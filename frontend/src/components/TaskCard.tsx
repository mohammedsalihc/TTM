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

const formatDate = (iso: string) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

function TaskCard({ task, onClick, canChangeStatus, onStatusChange }: TaskCardProps) {
  const priority = taskPriorityStyles[task.priority];

  return (
    <div
      onClick={() => onClick?.(task)}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`bg-white rounded-lg border border-gray-100 shadow-sm p-3 flex flex-col gap-2 ${
        onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-[13px] font-semibold text-gray-900 leading-snug">{task.title}</h4>
        <span className={`shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${priority.badge}`}>
          {priority.label}
        </span>
      </div>

      {task.description && <p className="text-xs text-gray-500 line-clamp-2">{task.description}</p>}

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

      <div className="flex items-center justify-between">
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
        {task.dueDate && <span className="text-[10px] text-gray-400">Due {formatDate(task.dueDate)}</span>}
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
