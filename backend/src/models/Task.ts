import { Schema, model } from 'mongoose';
import { ITask, TaskPriority, TaskStatus } from '../types';

const taskSchema = new Schema({
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
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  assignedTo: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  priority: {
    type: String,
    enum: Object.values(TaskPriority),
    default: TaskPriority.Medium,
  },
  status: {
    type: String,
    enum: Object.values(TaskStatus),
    default: TaskStatus.Todo,
  },
  estimatedHours: {
    type: Number,
  },
  dueDate: {
    type: Date,
  },
  labels: [
    {
      type: String,
      trim: true,
    },
  ],
  attachments: [
    {
      url: { type: String, required: true },
      fileName: { type: String, required: true },
      fileType: { type: String, required: true },
      uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      uploadedAt: { type: Date, default: Date.now },
    },
  ],
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const TaskModel = model<ITask>('Task', taskSchema);
