import { Schema, model } from 'mongoose';
import { IActivityLog } from '../types';

const activityLogSchema = new Schema({
  businessId: {
    type: Schema.Types.ObjectId,
    ref: 'Business',
    required: true,
    index: true,
  },
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true,
  },
  taskId: {
    type: Schema.Types.ObjectId,
    ref: 'Task',
  },
  actorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  message: {
    type: String,
    required: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const ActivityLogModel = model<IActivityLog>('ActivityLog', activityLogSchema);
