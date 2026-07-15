import { Model } from 'mongoose';
import { BusinessModel } from '../models/Business';
import { UserModel } from '../models/User';
import { AuthModel } from '../models/Auth';
import { ProjectModel } from '../models/Project';
import { TaskModel } from '../models/Task';
import { CommentModel } from '../models/Comment';
import { NotificationModel } from '../models/Notification';
import { ActivityLogModel } from '../models/ActivityLog';
import { IBusiness, IUser, IAuth, IProject, ITask, IComment, INotification, IActivityLog } from '../types';

// _id/createdAt are server/DB-assigned — never part of a create payload.
type CreateInput<T> = Omit<T, '_id' | 'createdAt'>;

export class CreateService {
  // Generic escape hatch for one-off creates that don't need a named method.
  create = async <T>(model: Model<T>, body: T): Promise<T> => {
    return model.create(body);
  };

  Business = async (body: CreateInput<IBusiness>): Promise<IBusiness> => {
    return BusinessModel.create(body);
  };

  User = async (body: CreateInput<IUser>): Promise<IUser> => {
    return UserModel.create(body);
  };

  Auth = async (body: CreateInput<IAuth>): Promise<IAuth> => {
    return AuthModel.create(body);
  };

  Project = async (body: CreateInput<IProject>): Promise<IProject> => {
    return ProjectModel.create(body);
  };

  Task = async (body: CreateInput<ITask>): Promise<ITask> => {
    return TaskModel.create(body);
  };

  Comment = async (body: CreateInput<IComment>): Promise<IComment> => {
    return CommentModel.create(body);
  };

  Notification = async (body: CreateInput<INotification>): Promise<INotification> => {
    return NotificationModel.create(body);
  };

  ActivityLog = async (body: CreateInput<IActivityLog>): Promise<IActivityLog> => {
    return ActivityLogModel.create(body);
  };
}
