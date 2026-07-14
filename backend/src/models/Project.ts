import { Schema, model } from 'mongoose';
import { IProject, ProjectStatus } from '../types';

const projectSchema = new Schema({
  businessId: {
    type: Schema.Types.ObjectId,
    ref: 'Business',
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  startDate: {
    type: Date,
  },
  dueDate: {
    type: Date,
  },
  ownerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  memberIds: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  status: {
    type: String,
    enum: Object.values(ProjectStatus),
    default: ProjectStatus.Active,
  },
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

export const ProjectModel = model<IProject>('Project', projectSchema);
