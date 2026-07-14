import { QueryFilter } from 'mongoose';
import { BusinessModel } from '../models/Business';
import { UserModel } from '../models/User';
import { AuthModel } from '../models/Auth';
import { ProjectModel } from '../models/Project';
import { TaskModel } from '../models/Task';
import { IBusiness, IUser, IAuth, IProject, ITask } from '../types';
import { objectSanitizer } from '../utils/validationHandler';

export class DetailService {
  Business = async (filter: QueryFilter<IBusiness>): Promise<IBusiness | null> => {
    const query = objectSanitizer(filter);
    return BusinessModel.findOne(query);
  };

  User = async (filter: QueryFilter<IUser>): Promise<IUser | null> => {
    const query = objectSanitizer(filter);
    return UserModel.findOne(query);
  };

  Auth = async (filter: QueryFilter<IAuth>): Promise<IAuth | null> => {
    const query = objectSanitizer(filter);
    return AuthModel.findOne(query);
  };

  Project = async (filter: QueryFilter<IProject>): Promise<IProject | null> => {
    const query = objectSanitizer(filter);
    return ProjectModel.findOne(query);
  };

  Task = async (filter: QueryFilter<ITask>): Promise<ITask | null> => {
    const query = objectSanitizer(filter);
    return TaskModel.findOne(query);
  };
}
