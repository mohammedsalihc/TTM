import { Request, Response } from 'express';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { ControllerHandler } from '../utils/ControllerHandler';
import { CreateService } from '../services/create-service';
import { DetailService } from '../services/detail-service';
import { signToken } from '../utils/jwt';
import { error_message } from '../constants/errorMessages';
import { UserRole } from '../types';
import { registerSchema, loginSchema } from '../validators/auth.validators';
import { firstValidationMessage } from '../utils/validationHandler';

const SALT_ROUNDS = 10;

class AuthController extends ControllerHandler {
  private create_service = new CreateService();
  private detail_service = new DetailService();

  register = async (req: Request, res: Response) => {
    try {
      const parsed = registerSchema.safeParse(req.body);
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

      const { businessName, fullName, email, password } = parsed.data;

      const existingAuth = await this.detail_service.Auth({ email });
      if (existingAuth) {
        this.error(res, 409, error_message.email_already_exists);
        return;
      }

      const business = await this.create_service.Business({ name: businessName });
      const user = await this.create_service.User({
        businessId: business._id!,
        name: fullName,
        email,
        role: UserRole.Admin,
      });

      const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
      const auth = await this.create_service.Auth({
        businessId: business._id!,
        user: user._id!,
        email,
        passwordHash,
        role: UserRole.Admin,
      });

      const token = signToken({
        userId: user._id!,
        businessId: business._id!,
        role: auth.role,
      });

      this.jsonResponse(res, {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          businessId: user.businessId,
        },
      });
    } catch (err) {
      // Duplicate-key race: the pre-check above can't fully rule out two
      // concurrent signups with the same email; the unique index on
      // Auth.email is the real guarantee.
      if (typeof err === 'object' && err !== null && 'code' in err && (err as { code: unknown }).code === 11000) {
        this.error(res, 409, error_message.email_already_exists);
        return;
      }
      console.error(err);
      this.error(res, 500, null, err);
    }
  };

  login = async (req: Request, res: Response) => {
    try {
      const parsed = loginSchema.safeParse(req.body);
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

      const { email, password } = parsed.data;

      const auth = await this.detail_service.Auth({ email });
      if (!auth) {
        this.error(res, 401, error_message.invalid_credentials);
        return;
      }

      const isMatch = await bcrypt.compare(password, auth.passwordHash);
      if (!isMatch) {
        this.error(res, 401, error_message.invalid_credentials);
        return;
      }

      const user = await this.detail_service.User({ _id: auth.user });
      if (!user) {
        this.error(res, 401, error_message.invalid_credentials);
        return;
      }

      const token = signToken({
        userId: auth.user,
        businessId: auth.businessId,
        role: auth.role,
      });

      this.jsonResponse(res, {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          businessId: user.businessId,
        },
      });
    } catch (err) {
      console.error(err);
      this.error(res, 500, null, err);
    }
  };
}

export default new AuthController();
