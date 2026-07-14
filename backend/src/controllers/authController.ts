import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { ControllerHandler } from '../utils/ControllerHandler';
import { CreateService } from '../services/createService';
import { DetailService } from '../services/detailService';
import { signToken } from '../utils/jwt';
import { error_message } from '../constants/errorMessages';
import { SALT_ROUNDS } from '../constants/security';
import { UserRole } from '../types';
import { registerSchema, loginSchema } from '../validators/auth.validators';
import { isDuplicateKeyError } from '../utils/errors';
import { asyncHandler } from '../utils/asyncHandler';

class AuthController extends ControllerHandler {
  private create_service = new CreateService();
  private detail_service = new DetailService();

  register = async (req: Request, res: Response) => {
    try {
      const parsed = this.validate(registerSchema, req.body, res);
      if (!parsed) return;

      const { businessName, fullName, email, password } = parsed;

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
      if (isDuplicateKeyError(err)) {
        this.error(res, 409, error_message.email_already_exists);
        return;
      }
      console.error(err);
      this.error(res, 500, null, err);
    }
  };

  login = asyncHandler(async (req: Request, res: Response) => {
    const parsed = this.validate(loginSchema, req.body, res);
    if (!parsed) return;

    const { email, password } = parsed;

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
  });
}

export default new AuthController();
