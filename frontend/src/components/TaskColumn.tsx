import { ReactNode } from 'react';

interface TaskColumnProps {
  title: string;
  count: number;
  children: ReactNode;
}

function TaskColumn({ title, count, children }: TaskColumnProps) {
  return (
    <div className="bg-gray-50 rounded-2xl border border-gray-100 p-4 flex flex-col gap-3 min-h-[240px]">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
        <span className="text-xs text-gray-400 bg-white rounded-full px-2 py-0.5 border border-gray-100">{count}</span>
      </div>
      <div className="flex flex-col gap-3">{count === 0 ? <EmptyState /> : children}</div>
    </div>
  );
}

function EmptyState() {
  return <p className="text-xs text-gray-400 italic text-center py-6">No tasks</p>;
}

export default TaskColumn;
