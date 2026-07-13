import { Request, Response } from 'express';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { ControllerHandler } from '../utils/ControllerHandler';
import { CreateService } from '../services/create-service';
import { DetailService } from '../services/detail-service';
import { ListService } from '../services/list-service';
import { UpdateService } from '../services/update-service';
import { MailService } from '../services/mail-service';
import { error_message } from '../constants/errorMessages';
import { UserRole } from '../types';
import { createEmployeeSchema, listEmployeesQuerySchema, updateEmployeeSchema } from '../validators/employee.validators';
import { firstValidationMessage } from '../utils/validationHandler';
import { renderTemplate } from '../utils/renderTemplate';
import { welcomeEmployeeEmailTemplate } from '../templates/welcomeEmployeeEmail';

const SALT_ROUNDS = 10;

class EmployeeController extends ControllerHandler {
  private create_service = new CreateService();
  private detail_service = new DetailService();
  private list_service = new ListService();
  private update_service = new UpdateService();
  private mail_service = new MailService();

  create = async (req: Request, res: Response) => {
    try {
      const parsed = createEmployeeSchema.safeParse(req.body);
      if (!parsed.success) {
        const message = firstValidationMessage(parsed.error, error_message.body_validation_error.message);
        this.error(
          res,
          400,
          { message, code: error_message.body_validation_error.code },
          z.treeifyError(parsed.error),
        );
        return;
      }

      const { name, email, password, designation, photoUrl, sendEmailInvite } = parsed.data;
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
          const html = renderTemplate(welcomeEmployeeEmailTemplate, {
            businessName: business?.name ?? 'your team',
            employeeName: name,
            designation: designation || 'a team member',
            email,
            password,
            loginUrl: `${process.env.FRONTEND_URL}/login`,
            currentYear: new Date().getFullYear().toString(),
          });
          await this.mail_service.send({
            to: email,
            subject: `Welcome to ${business?.name ?? 'TTM'}`,
            html,
          });
        } catch (mailErr) {
          console.error('Failed to send welcome email invite:', mailErr);
        }
      }

      this.jsonResponse(res, {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        businessId: user.businessId,
        designation: user.designation,
        photoUrl: user.photoUrl,
      });
    } catch (err) {
      // Duplicate-key race: the pre-check above can't fully rule out two
      // concurrent creates with the same email; the unique index on
      // Auth.email is the real guarantee.
      if (typeof err === 'object' && err !== null && 'code' in err && (err as { code: unknown }).code === 11000) {
        this.error(res, 409, error_message.email_already_exists);
        return;
      }
      console.error(err);
      this.error(res, 500, null, err);
    }
  };

  detail = async (req: Request, res: Response) => {
    try {
      const businessId = req.businessId!;
      const { id } = req.params;

      // Same tenant/role scoping as update — an admin can only ever fetch
      // an employee that actually belongs to their own business.
      const user = await this.detail_service.User({ _id: id, businessId, role: UserRole.Employee });

      if (!user) {
        this.error(res, 404, error_message.employee_not_found);
        return;
      }

      this.jsonResponse(res, {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        businessId: user.businessId,
        designation: user.designation,
        photoUrl: user.photoUrl,
      });
    } catch (err) {
      console.error(err);
      this.error(res, 500, null, err);
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const parsed = updateEmployeeSchema.safeParse(req.body);
      if (!parsed.success) {
        const message = firstValidationMessage(parsed.error, error_message.body_validation_error.message);
        this.error(
          res,
          400,
          { message, code: error_message.body_validation_error.code },
          z.treeifyError(parsed.error),
        );
        return;
      }

      const { name, designation } = parsed.data;
      const businessId = req.businessId!;
      const { id } = req.params;

      // Scoping the filter to businessId + role: Employee (not just _id)
      // means an admin can never update another business's employee, or a
      // non-employee record, even by guessing an id.
      const user = await this.update_service.User(
        { _id: id, businessId, role: UserRole.Employee },
        { name, designation },
      );

      if (!user) {
        this.error(res, 404, error_message.employee_not_found);
        return;
      }

      this.jsonResponse(res, {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        businessId: user.businessId,
        designation: user.designation,
        photoUrl: user.photoUrl,
      });
    } catch (err) {
      console.error(err);
      this.error(res, 500, null, err);
    }
  };

  list = async (req: Request, res: Response) => {
    try {
      const parsedQuery = listEmployeesQuerySchema.safeParse(req.query);
      if (!parsedQuery.success) {
        const message = firstValidationMessage(parsedQuery.error, error_message.body_validation_error.message);
        this.error(
          res,
          400,
          { message, code: error_message.body_validation_error.code },
          z.treeifyError(parsedQuery.error),
        );
        return;
      }

      const { page, limit, search } = parsedQuery.data;
      const businessId = req.businessId!;
      const { data, total } = await this.list_service.User(
        { businessId, role: UserRole.Employee },
        { page, limit, search },
      );

      this.jsonResponse(res, {
        data: data.map((user) => ({
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          businessId: user.businessId,
          designation: user.designation,
          photoUrl: user.photoUrl,
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.max(1, Math.ceil(total / limit)),
        },
      });
    } catch (err) {
      console.error(err);
      this.error(res, 500, null, err);
    }
  };
}

export default new EmployeeController();
