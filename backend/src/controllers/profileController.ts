import { Request, Response } from 'express';
import { ControllerHandler } from '../utils/ControllerHandler';
import { DetailService } from '../services/detail-service';
import { error_message } from '../constants/errorMessages';

class ProfileController extends ControllerHandler {
  private detail_service = new DetailService();

  // Works for any authenticated role (Admin, Manager, Employee) — resolves
  // "who does this token belong to" purely from req.userId/businessId, no
  // role restriction like the employee/manager endpoints have.
  me = async (req: Request, res: Response) => {
    try {
      const userId = req.userId!;
      const businessId = req.businessId!;

      const user = await this.detail_service.User({ _id: userId });
      if (!user) {
        this.error(res, 404, error_message.profile_not_found);
        return;
      }

      const business = await this.detail_service.Business({ _id: businessId });

      this.jsonResponse(res, {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        businessId: user.businessId,
        businessName: business?.name,
        designation: user.designation,
        photoUrl: user.photoUrl,
        canManageProjects: user.canManageProjects,
        canManageEmployees: user.canManageEmployees,
      });
    } catch (err) {
      console.error(err);
      this.error(res, 500, null, err);
    }
  };
}

export default new ProfileController();
