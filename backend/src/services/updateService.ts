import { Model, QueryFilter, UpdateQuery } from 'mongoose';
import { UserModel } from '../models/User';
import { ProjectModel } from '../models/Project';
import { TaskModel } from '../models/Task';
import { NotificationModel } from '../models/Notification';
import { IUser, IProject, ITask, INotification } from '../types';

export class UpdateService {
  // Generic escape hatch for one-off updates that don't need a named method.
  update = async <T>(model: Model<T>, filter: QueryFilter<T>, body: UpdateQuery<T>): Promise<T | null> => {
    return model.findOneAndUpdate(filter, body, { returnDocument: 'after' });
  };

  User = async (filter: QueryFilter<IUser>, body: UpdateQuery<IUser>): Promise<IUser | null> => {
    return UserModel.findOneAndUpdate(filter, body, { returnDocument: 'after' });
  };

  Project = async (filter: QueryFilter<IProject>, body: UpdateQuery<IProject>): Promise<IProject | null> => {
    return ProjectModel.findOneAndUpdate(filter, body, { returnDocument: 'after' });
  };

  Task = async (filter: QueryFilter<ITask>, body: UpdateQuery<ITask>): Promise<ITask | null> => {
    return TaskModel.findOneAndUpdate(filter, body, { returnDocument: 'after' });
  };

  Notification = async (
    filter: QueryFilter<INotification>,
    body: UpdateQuery<INotification>,
  ): Promise<INotification | null> => {
    return NotificationModel.findOneAndUpdate(filter, body, { returnDocument: 'after' });
  };

  // Bulk variant for "mark all as read" — a single-document update can't
  // express that, so this returns a count instead of a document.
  NotificationsMany = async (filter: QueryFilter<INotification>, body: UpdateQuery<INotification>): Promise<number> => {
    const result = await NotificationModel.updateMany(filter, body);
    return result.modifiedCount;
  };
}
