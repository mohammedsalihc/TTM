import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { ControllerHandler } from '../utils/ControllerHandler';
import { DetailService } from '../services/detailService';
import { UpdateService } from '../services/updateService';
import { AuthModel } from '../models/Auth';
import { error_message } from '../constants/errorMessages';
import { SALT_ROUNDS } from '../constants/security';
import { IUser } from '../types';
import { updateProfileSchema, changePasswordSchema } from '../validators/profile.validators';
import { asyncHandler } from '../utils/asyncHandler';

class ProfileController extends ControllerHandler {
  private detail_service = new DetailService();
  private update_service = new UpdateService();

  // Shared by me/update — businessName needs a second lookup since it isn't
  // stored on the User record itself.
  private toProfileResponse = async (user: IUser) => {
    const business = await this.detail_service.Business({ _id: user.businessId });
    return {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      businessId: user.businessId,
      businessName: business?.name,
      designation: user.designation,
      photoUrl: user.photoUrl,
      phone: user.phone,
      canManageProjects: user.canManageProjects,
      canManageEmployees: user.canManageEmployees,
    };
  };

  me = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;

    const user = await this.detail_service.User({ _id: userId });
    if (!user) {
      this.error(res, 404, error_message.profile_not_found);
      return;
    }

    this.jsonResponse(res, await this.toProfileResponse(user));
  });

  // Self-service "edit my profile" — deliberately narrower than the
  // employee/manager update endpoints (no role, no permissions, works for
  // any authenticated user editing themselves).
  update = asyncHandler(async (req: Request, res: Response) => {
    const parsed = this.validate(updateProfileSchema, req.body, res);
    if (!parsed) return;

    const userId = req.userId!;
    const user = await this.update_service.User({ _id: userId }, parsed);
    if (!user) {
      this.error(res, 404, error_message.profile_not_found);
      return;
    }

    this.jsonResponse(res, await this.toProfileResponse(user));
  });

  changePassword = asyncHandler(async (req: Request, res: Response) => {
    const parsed = this.validate(changePasswordSchema, req.body, res);
    if (!parsed) return;

    const userId = req.userId!;
    const auth = await this.detail_service.Auth({ user: userId });
    if (!auth) {
      this.error(res, 404, error_message.profile_not_found);
      return;
    }

    const isMatch = await bcrypt.compare(parsed.currentPassword, auth.passwordHash);
    if (!isMatch) {
      this.error(res, 400, error_message.invalid_current_password);
      return;
    }

    const passwordHash = await bcrypt.hash(parsed.newPassword, SALT_ROUNDS);
    await this.update_service.update(AuthModel, { user: userId }, { passwordHash });
    this.jsonResponse(res);
  });
}

export default new ProfileController();
