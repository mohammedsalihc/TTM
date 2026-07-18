import { Schema, model } from 'mongoose';
import { IUser, UserRole } from '../types';

// Profile data only — credentials live on the separate Auth model.
const userSchema = new Schema({
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
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  role: {
    type: String,
    enum: Object.values(UserRole),
    required: true,
  },
  designation: {
    type: String,
    trim: true,
  },
  photoUrl: {
    type: String,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  canManageProjects: {
    type: Boolean,
    default: false,
  },
  canManageEmployees: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const UserModel = model<IUser>('User', userSchema);
