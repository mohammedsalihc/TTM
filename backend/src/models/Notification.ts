import { Schema, model } from 'mongoose';
import { INotification, NotificationType } from '../types';

const notificationSchema = new Schema({
  businessId: {
    type: Schema.Types.ObjectId,
    ref: 'Business',
    required: true,
    index: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  message: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    enum: Object.values(NotificationType),
    required: true,
  },
  relatedProjectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
  },
  relatedTaskId: {
    type: Schema.Types.ObjectId,
    ref: 'Task',
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const NotificationModel = model<INotification>('Notification', notificationSchema);
