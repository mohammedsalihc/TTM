import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { ControllerHandler } from '../utils/ControllerHandler';
import { CreateService } from '../services/createService';
import { DetailService } from '../services/detailService';
import { ListService } from '../services/listService';
import { UpdateService } from '../services/updateService';
import { MailService } from '../services/mailService';
import { error_message } from '../constants/errorMessages';
import { SALT_ROUNDS } from '../constants/security';
import { UserRole, IUser } from '../types';
import { createManagerSchema, listManagersQuerySchema, updateManagerSchema } from '../validators/manager.validators';
import { isDuplicateKeyError } from '../utils/errors';
import { buildPaginationMeta } from '../utils/pagination';
import { asyncHandler } from '../utils/asyncHandler';

const toManagerResponse = (user: IUser) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  businessId: user.businessId,
  photoUrl: user.photoUrl,
  canManageProjects: user.canManageProjects,
  canManageEmployees: user.canManageEmployees,
});

class ManagerController extends ControllerHandler {
  private create_service = new CreateService();
  private detail_service = new DetailService();
  private list_service = new ListService();
  private update_service = new UpdateService();
  private mail_service = new MailService();

  create = async (req: Request, res: Response) => {
    try {
      const parsed = this.validate(createManagerSchema, req.body, res);
      if (!parsed) return;

      const { name, email, password, photoUrl, sendEmailInvite } = parsed;
      const businessId = req.businessId!;

      const existingAuth = await this.detail_service.Auth({ email });
      if (existingAuth) {
        this.error(res, 409, error_message.email_already_exists);
        return;
      }

      const user = await this.create_service.User({
        businessId,
        name,
        email,
        role: UserRole.Manager,
        photoUrl,
      });

      const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
      await this.create_service.Auth({
        businessId,
        user: user._id!,
        email,
        passwordHash,
        role: UserRole.Manager,
      });

      if (sendEmailInvite) {
        // Best-effort: the manager record is already created either way —
        // a flaky email provider shouldn't fail the whole create request.
        try {
          const business = await this.detail_service.Business({ _id: businessId });
          await this.mail_service.sendWelcomeEmail({
            to: email,
            businessName: business?.name,
            recipientName: name,
            designation: 'a Manager',
            password,
          });
        } catch (mailErr) {
          console.error('Failed to send welcome email invite:', mailErr);
        }
      }

      this.jsonResponse(res, toManagerResponse(user));
    } catch (err) {
      // Duplicate-key race: the pre-check above can't fully rule out two
      // concurrent creates with the same email; the unique index on
      // Auth.email is the real guarantee.
      if (isDuplicateKeyError(err)) {
        this.error(res, 409, error_message.email_already_exists);
        return;
      }
      console.error(err);
      this.error(res, 500, null, err);
    }
  };

  detail = asyncHandler(async (req: Request, res: Response) => {
    const businessId = req.businessId!;
    const { id } = req.params;

    // Same tenant/role scoping as update — an admin can only ever fetch
    // a manager that actually belongs to their own business.
    const user = await this.detail_service.User({ _id: id, businessId, role: UserRole.Manager });

    if (!user) {
      this.error(res, 404, error_message.manager_not_found);
      return;
    }

    this.jsonResponse(res, toManagerResponse(user));
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const parsed = this.validate(updateManagerSchema, req.body, res);
    if (!parsed) return;

    const { name, photoUrl, canManageProjects, canManageEmployees } = parsed;
    const businessId = req.businessId!;
    const { id } = req.params;

    // Scoping the filter to businessId + role: Manager (not just _id)
    // means an admin can never update another business's manager, or a
    // non-manager record, even by guessing an id.
    const user = await this.update_service.User(
      { _id: id, businessId, role: UserRole.Manager },
      { name, photoUrl, canManageProjects, canManageEmployees },
    );

    if (!user) {
      this.error(res, 404, error_message.manager_not_found);
      return;
    }

    this.jsonResponse(res, toManagerResponse(user));
  });

  list = asyncHandler(async (req: Request, res: Response) => {
    const parsedQuery = this.validate(listManagersQuerySchema, req.query, res);
    if (!parsedQuery) return;

    const { page, limit, search } = parsedQuery;
    const businessId = req.businessId!;
    const { data, total } = await this.list_service.User(
      { businessId, role: UserRole.Manager },
      { page, limit, search },
    );

    this.jsonResponse(res, {
      data: data.map(toManagerResponse),
      pagination: buildPaginationMeta(total, page, limit),
    });
  });
}

export default new ManagerController();
