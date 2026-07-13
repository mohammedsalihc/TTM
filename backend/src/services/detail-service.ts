import { QueryFilter } from 'mongoose';
import { BusinessModel } from '../models/Business';
import { UserModel } from '../models/User';
import { AuthModel } from '../models/Auth';
import { IBusiness, IUser, IAuth } from '../types';
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
}
