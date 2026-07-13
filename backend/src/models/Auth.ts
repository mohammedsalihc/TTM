import { Schema, model } from 'mongoose';
import { IAuth, UserRole } from '../types';

// Credentials only, kept separate from User (profile data) — the email
// unique index (identity) and passwordHash both live here.
const authSchema = new Schema({
  businessId: {
    type: Schema.Types.ObjectId,
    ref: 'Business',
    required: true,
    index: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: Object.values(UserRole),
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const AuthModel = model<IAuth>('Auth', authSchema);
