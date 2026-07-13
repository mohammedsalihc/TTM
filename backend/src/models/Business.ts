import { Schema, model } from 'mongoose';
import { IBusiness } from '../types';

const businessSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const BusinessModel = model<IBusiness>('Business', businessSchema);
