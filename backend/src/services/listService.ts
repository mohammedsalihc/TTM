import { QueryFilter } from 'mongoose';
import { UserModel } from '../models/User';
import { ProjectModel } from '../models/Project';
import { TaskModel } from '../models/Task';
import { IUser, IProject, ITask } from '../types';
import { objectSanitizer, escapeRegex } from '../utils/validationHandler';

interface PageArgs {
  page: number;
  limit: number;
  search?: string;
}

export class ListService {
  User = async (
    filter: QueryFilter<IUser>,
    { page, limit, search }: PageArgs,
  ): Promise<{ data: IUser[]; total: number }> => {
    const query = objectSanitizer(filter);
    if (search) {
      const regex = new RegExp(escapeRegex(search), 'i');
      Object.assign(query, { $or: [{ name: regex }, { email: regex }] });
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      UserModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      UserModel.countDocuments(query),
    ]);

    return { data, total };
  };

  Project = async (
    filter: QueryFilter<IProject>,
    { page, limit, search }: PageArgs,
  ): Promise<{ data: IProject[]; total: number }> => {
    const query = objectSanitizer(filter);
    if (search) {
      const regex = new RegExp(escapeRegex(search), 'i');
      Object.assign(query, { $or: [{ name: regex }, { description: regex }] });
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      ProjectModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      ProjectModel.countDocuments(query),
    ]);

    return { data, total };
  };

  Task = async (
    filter: QueryFilter<ITask>,
    { page, limit, search }: PageArgs,
  ): Promise<{ data: ITask[]; total: number }> => {
    const query = objectSanitizer(filter);
    if (search) {
      const regex = new RegExp(escapeRegex(search), 'i');
      Object.assign(query, { $or: [{ title: regex }, { description: regex }] });
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      TaskModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      TaskModel.countDocuments(query),
    ]);

    return { data, total };
  };
}
