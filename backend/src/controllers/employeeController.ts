import { Request, Response } from 'express';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { ControllerHandler } from '../utils/ControllerHandler';
import { CreateService } from '../services/create-service';
import { DetailService } from '../services/detail-service';
import { ListService } from '../services/list-service';
import { error_message } from '../constants/errorMessages';
import { UserRole } from '../types';
import { createEmployeeSchema, listEmployeesQuerySchema } from '../validators/employee.validators';
import { firstValidationMessage } from '../utils/validationHandler';

const SALT_ROUNDS = 10;

class EmployeeController extends ControllerHandler {
  private create_service = new CreateService();
  private detail_service = new DetailService();
  private list_service = new ListService();

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

      const { name, email, password, designation, photoUrl } = parsed.data;
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
