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
import { createEmployeeSchema, listEmployeesQuerySchema, updateEmployeeSchema } from '../validators/employee.validators';
import { buildPaginationMeta } from '../utils/pagination';
import { asyncHandler, asyncHandlerWithDuplicateKeyCatch } from '../utils/asyncHandler';

const toEmployeeResponse = (user: IUser) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  businessId: user.businessId,
  designation: user.designation,
  photoUrl: user.photoUrl,
  createdAt: user.createdAt,
});

class EmployeeController extends ControllerHandler {
  private create_service = new CreateService();
  private detail_service = new DetailService();
  private list_service = new ListService();
  private update_service = new UpdateService();
  private mail_service = new MailService();

  create = asyncHandlerWithDuplicateKeyCatch(async (req: Request, res: Response) => {
    const parsed = this.validate(createEmployeeSchema, req.body, res);
    if (!parsed) return;

    const { name, email, password, designation, photoUrl, sendEmailInvite } = parsed;
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
      role: UserRole.Employee,
      designation,
      photoUrl,
    });

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    await this.create_service.Auth({
      businessId,
      user: user._id!,
      email,
      passwordHash,
      role: UserRole.Employee,
    });

    if (sendEmailInvite) {
      // Best-effort: the employee record is already created either way —
      // a flaky email provider shouldn't fail the whole create request.
      try {
        const business = await this.detail_service.Business({ _id: businessId });
        await this.mail_service.sendWelcomeEmail({
          to: email,
          businessName: business?.name,
          recipientName: name,
          designation: designation || 'a team member',
          password,
        });
      } catch (mailErr) {
        console.error('Failed to send welcome email invite:', mailErr);
      }
    }

    this.jsonResponse(res, toEmployeeResponse(user));
  }, error_message.email_already_exists);

  detail = asyncHandler(async (req: Request, res: Response) => {
    const businessId = req.businessId!;
    const { id } = req.params;

    // Same tenant/role scoping as update — an admin can only ever fetch
    // an employee that actually belongs to their own business.
    const user = await this.detail_service.User({ _id: id, businessId, role: UserRole.Employee });

    if (!user) {
      this.error(res, 404, error_message.employee_not_found);
      return;
    }

    this.jsonResponse(res, toEmployeeResponse(user));
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const parsed = this.validate(updateEmployeeSchema, req.body, res);
    if (!parsed) return;

    const { name, designation, photoUrl } = parsed;
    const businessId = req.businessId!;
    const { id } = req.params;

    // Scoping the filter to businessId + role: Employee (not just _id)
    // means an admin can never update another business's employee, or a
    // non-employee record, even by guessing an id. photoUrl is left
    // undefined when no new photo was picked — Mongoose drops undefined
    // keys from the update, so the existing photo is untouched.
    const user = await this.update_service.User(
      { _id: id, businessId, role: UserRole.Employee },
      { name, designation, photoUrl },
    );

    if (!user) {
      this.error(res, 404, error_message.employee_not_found);
      return;
    }

    this.jsonResponse(res, toEmployeeResponse(user));
  });

  list = asyncHandler(async (req: Request, res: Response) => {
    const parsedQuery = this.validate(listEmployeesQuerySchema, req.query, res);
    if (!parsedQuery) return;

    const { page, limit, search } = parsedQuery;
    const businessId = req.businessId!;
    const { data, total } = await this.list_service.User(
      { businessId, role: UserRole.Employee },
      { page, limit, search },
    );

    this.jsonResponse(res, {
      data: data.map(toEmployeeResponse),
      pagination: buildPaginationMeta(total, page, limit),
    });
  });
}

export default new EmployeeController();
