import { QueryFilter } from 'mongoose';
import { UserModel } from '../models/User';
import { ProjectModel } from '../models/Project';
import { TaskModel } from '../models/Task';
import { CommentModel } from '../models/Comment';
import { IUser, IProject, ITask, IComment } from '../types';
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

  // No `search` — comments are a chronological thread, not a searchable
  // list, so sort ascending (oldest first) instead of newest-first.
  Comment = async (
    filter: QueryFilter<IComment>,
    { page, limit }: Pick<PageArgs, 'page' | 'limit'>,
  ): Promise<{ data: IComment[]; total: number }> => {
    const query = objectSanitizer(filter);
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      CommentModel.find(query).sort({ createdAt: 1 }).skip(skip).limit(limit),
      CommentModel.countDocuments(query),
    ]);

    return { data, total };
  };
}
