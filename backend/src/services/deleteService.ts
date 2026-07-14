import { Model, QueryFilter } from 'mongoose';
import { ProjectModel } from '../models/Project';
import { IProject } from '../types';

export class DeleteService {
  // Generic escape hatch for one-off deletes that don't need a named method.
  delete = async <T>(model: Model<T>, filter: QueryFilter<T>): Promise<T | null> => {
    return model.findOneAndDelete(filter);
  };

  Project = async (filter: QueryFilter<IProject>): Promise<IProject | null> => {
    return ProjectModel.findOneAndDelete(filter);
  };
}
