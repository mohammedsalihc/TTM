import { ReactNode } from 'react';
import { taskStatusDotStyles, taskStatusStyles } from './taskStyles';
import { TaskStatus } from '../types';

interface TaskColumnProps {
  status: TaskStatus;
  title: string;
  count: number;
  children: ReactNode;
}

function TaskColumn({ status, title, count, children }: TaskColumnProps) {
  return (
    <div className="bg-gray-50 rounded-2xl border border-gray-100 p-4 flex flex-col gap-3 min-h-[240px]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${taskStatusDotStyles[status]}`} aria-hidden="true" />
          <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
        </div>
        <span className={`text-xs font-semibold rounded-full px-2 py-0.5 ${taskStatusStyles[status].badge}`}>{count}</span>
      </div>
      <div className="flex flex-col gap-2">{count === 0 ? <EmptyState /> : children}</div>
    </div>
  );
}

function EmptyState() {
  return <p className="text-xs text-gray-400 italic text-center py-6">No tasks</p>;
}

export default TaskColumn;
