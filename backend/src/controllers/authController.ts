import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { ControllerHandler } from '../utils/ControllerHandler';
import { CreateService } from '../services/createService';
import { DetailService } from '../services/detailService';
import { UpdateService } from '../services/updateService';
import { MailService } from '../services/mailService';
import { AuthModel } from '../models/Auth';
import { signToken } from '../utils/jwt';
import { error_message } from '../constants/errorMessages';
import { SALT_ROUNDS } from '../constants/security';
import { UserRole } from '../types';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from '../validators/auth.validators';
import { asyncHandler, asyncHandlerWithDuplicateKeyCatch } from '../utils/asyncHandler';

// 1 hour — long enough to find the email without being an open-ended
// standing credential.
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

class AuthController extends ControllerHandler {
  private create_service = new CreateService();
  private detail_service = new DetailService();
  private update_service = new UpdateService();
  private mail_service = new MailService();

  register = asyncHandlerWithDuplicateKeyCatch(async (req: Request, res: Response) => {
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
  }, error_message.email_already_exists);

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

  forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const parsed = this.validate(forgotPasswordSchema, req.body, res);
    if (!parsed) return;

    const { email } = parsed;
    const auth = await this.detail_service.Auth({ email });

    // Always respond success either way — confirming/denying an email
    // exists would let this endpoint be used to enumerate accounts.
    if (!auth) {
      this.jsonResponse(res);
      return;
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const resetTokenExpiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);
    await this.update_service.update(AuthModel, { email }, { resetTokenHash, resetTokenExpiresAt });

    // Best-effort: the token is already saved either way — a flaky email
    // provider shouldn't turn this into a 500 for the caller.
    try {
      const user = await this.detail_service.User({ _id: auth.user });
      await this.mail_service.sendPasswordResetEmail({
        to: email,
        recipientName: user?.name ?? 'there',
        resetUrl: `${process.env.FRONTEND_URL}/reset-password?token=${rawToken}`,
      });
    } catch (err) {
      console.error('Failed to send password reset email:', err);
    }

    this.jsonResponse(res);
  });

  resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const parsed = this.validate(resetPasswordSchema, req.body, res);
    if (!parsed) return;

    const { token, newPassword } = parsed;
    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const auth = await this.detail_service.Auth({ resetTokenHash });

    if (!auth || !auth.resetTokenExpiresAt || auth.resetTokenExpiresAt < new Date()) {
      this.error(res, 400, error_message.invalid_reset_token);
      return;
    }

    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await this.update_service.update(
      AuthModel,
      { _id: auth._id },
      { passwordHash, $unset: { resetTokenHash: '', resetTokenExpiresAt: '' } },
    );

    this.jsonResponse(res);
  });
}

export default new AuthController();
