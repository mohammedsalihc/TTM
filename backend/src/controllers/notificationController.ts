import { Request, Response } from 'express';
import { ControllerHandler } from '../utils/ControllerHandler';
import { ListService } from '../services/listService';
import { UpdateService } from '../services/updateService';
import { error_message } from '../constants/errorMessages';
import { INotification } from '../types';
import { listNotificationsQuerySchema } from '../validators/notification.validators';
import { buildPaginationMeta } from '../utils/pagination';
import { asyncHandler } from '../utils/asyncHandler';

const toNotificationResponse = (notification: INotification) => ({
  id: notification._id,
  message: notification.message,
  type: notification.type,
  relatedProjectId: notification.relatedProjectId,
  relatedTaskId: notification.relatedTaskId,
  isRead: notification.isRead,
  createdAt: notification.createdAt,
});

class NotificationController extends ControllerHandler {
  private list_service = new ListService();
  private update_service = new UpdateService();

  // Every notification is scoped to req.userId — a user only ever sees or
  // touches their own notifications, never another user's in the business.
  list = asyncHandler(async (req: Request, res: Response) => {
    const parsedQuery = this.validate(listNotificationsQuerySchema, req.query, res);
    if (!parsedQuery) return;

    const { page, limit, isRead } = parsedQuery;
    const businessId = req.businessId!;
    const userId = req.userId!;

    const { data, total } = await this.list_service.Notification({ businessId, userId, isRead }, { page, limit });

    this.jsonResponse(res, {
      data: data.map(toNotificationResponse),
      pagination: buildPaginationMeta(total, page, limit),
    });
  });

  markRead = asyncHandler(async (req: Request, res: Response) => {
    const businessId = req.businessId!;
    const userId = req.userId!;
    const { id } = req.params;

    const notification = await this.update_service.Notification({ _id: id, businessId, userId }, { isRead: true });
    if (!notification) {
      this.error(res, 404, error_message.notification_not_found);
      return;
    }

    this.jsonResponse(res, toNotificationResponse(notification));
  });

  markAllRead = asyncHandler(async (req: Request, res: Response) => {
    const businessId = req.businessId!;
    const userId = req.userId!;

    await this.update_service.NotificationsMany({ businessId, userId, isRead: false }, { isRead: true });
    this.jsonResponse(res);
  });
}

export default new NotificationController();
