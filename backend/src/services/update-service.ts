import { Model, QueryFilter, UpdateQuery } from 'mongoose';
import { UserModel } from '../models/User';
import { IUser } from '../types';

export class UpdateService {
  // Generic escape hatch for one-off updates that don't need a named method.
  update = async <T>(model: Model<T>, filter: QueryFilter<T>, body: UpdateQuery<T>): Promise<T | null> => {
    return model.findOneAndUpdate(filter, body, { returnDocument: 'after' });
  };

  User = async (filter: QueryFilter<IUser>, body: UpdateQuery<IUser>): Promise<IUser | null> => {
    return UserModel.findOneAndUpdate(filter, body, { returnDocument: 'after' });
  };
}
