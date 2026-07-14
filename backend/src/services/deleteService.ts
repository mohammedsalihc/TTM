import { Model, QueryFilter } from 'mongoose';
import { ProjectModel } from '../models/Project';
import { TaskModel } from '../models/Task';
import { IProject, ITask } from '../types';

export class DeleteService {
  // Generic escape hatch for one-off deletes that don't need a named method.
  delete = async <T>(model: Model<T>, filter: QueryFilter<T>): Promise<T | null> => {
    return model.findOneAndDelete(filter);
  };

  Project = async (filter: QueryFilter<IProject>): Promise<IProject | null> => {
    return ProjectModel.findOneAndDelete(filter);
  };

  Task = async (filter: QueryFilter<ITask>): Promise<ITask | null> => {
    return TaskModel.findOneAndDelete(filter);
  };
}
