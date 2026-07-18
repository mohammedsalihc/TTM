import { useEffect, useState } from 'react';
import Avatar from './Avatar';
import SingleSelectDropdown, { SelectOption } from './SingleSelectDropdown';
import { taskPriorityStyles } from './taskStyles';
import { colorFromString } from '../utils/avatarColor';
import { Task, TaskStatus } from '../types';

interface TaskCardProps {
  task: Task;
  onClick?: (task: Task) => void;
  // Only Admin/the owning Manager, or (for status only) the task's own
  // assignee can change status — matches the backend's updateStatus rule.
  canChangeStatus: boolean;
  onStatusChange: (status: TaskStatus) => void;
}

const STATUS_OPTIONS: SelectOption[] = [
  { id: 'todo', name: 'To Do' },
  { id: 'in-progress', name: 'In Progress' },
  { id: 'completed', name: 'Completed' },
];

function TaskCard({ task, onClick, canChangeStatus, onStatusChange }: TaskCardProps) {
  const priority = taskPriorityStyles[task.priority];
  // Fades/slides the card in on mount — since a status change re-renders the
  // task into a different column (a fresh DOM node, not a repositioned one),
  // this is what makes that move read as a smooth transition instead of a
  // hard cut, matching Modal's own mount-transition approach.
  const [isSettled, setIsSettled] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setIsSettled(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      onClick={() => onClick?.(task)}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`bg-white rounded-xl border border-gray-100 shadow-sm p-3 flex flex-col gap-2 transition-all duration-300 ease-out ${
        isSettled ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      } ${onClick ? 'cursor-pointer hover:shadow-md hover:border-gray-200' : ''}`}
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2">{task.title}</h4>
        <span className={`shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full ${priority.badge}`}>
          {priority.label}
        </span>
      </div>

      {task.description && <p className="text-xs text-gray-400 line-clamp-2">{task.description}</p>}

      {task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {task.labels.map((label) => (
            <span
              key={label}
              className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100"
            >
              {label}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-0.5">
        <div className="flex items-center -space-x-1.5">
          {task.assignedTo.map((person) => (
            <Avatar
              key={person.id}
              name={person.name}
              color={colorFromString(person.name)}
              imageUrl={person.photoUrl}
              size={20}
              className="ring-2 ring-white"
            />
          ))}
        </div>
        {task.estimatedHours != null && <span className="text-[10px] text-gray-400">{task.estimatedHours}h</span>}
      </div>

      {canChangeStatus && (
        <div onClick={(e) => e.stopPropagation()}>
          <SingleSelectDropdown
            compact
            options={STATUS_OPTIONS}
            value={task.status}
            onChange={(value) => onStatusChange(value as TaskStatus)}
          />
        </div>
      )}
    </div>
  );
}

export default TaskCard;
