export type NotificationType = 'task-assigned';

// Matches backend/src/controllers/notificationController.ts's toNotificationResponse.
export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  relatedProjectId?: string;
  relatedTaskId?: string;
  isRead: boolean;
  createdAt: string;
}
