import { FormEvent, useEffect, useState } from 'react';
import Modal from './Modal';
import Spinner from './Spinner';
import Avatar from './Avatar';
import TaskComments from './TaskComments';
import DatePicker from './DatePicker';
import MultiSelectDropdown, { MultiSelectOption } from './MultiSelectDropdown';
import SingleSelectDropdown, { SelectOption } from './SingleSelectDropdown';
import { taskPriorityStyles, taskStatusStyles } from './taskStyles';
import { updateTaskRequest, updateTaskStatusRequest, deleteTaskRequest } from '../services/taskService';
import { getApiErrorMessage } from '../utils/getApiErrorMessage';
import { colorFromString } from '../utils/avatarColor';
import { Task, TaskPriority, TaskStatus } from '../types';

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onUpdated: (task: Task) => void;
  onDeleted: (taskId: string) => void;
  // Full edit rights (Admin/the owning Manager) — matches the backend's
  // full-update ownership gate, not open to assignees.
  canEdit: boolean;
  // Status-only rights — an assignee gets this even without canEdit,
  // matching the backend's separate, looser updateStatus rule.
  canChangeStatus: boolean;
  employeeOptions: MultiSelectOption[];
}

const PRIORITY_OPTIONS: SelectOption[] = [
  { id: 'low', name: 'Low' },
  { id: 'medium', name: 'Medium' },
  { id: 'high', name: 'High' },
  { id: 'critical', name: 'Critical' },
];

const STATUS_OPTIONS: SelectOption[] = [
  { id: 'todo', name: 'To Do' },
  { id: 'in-progress', name: 'In Progress' },
  { id: 'completed', name: 'Completed' },
];

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

// Same view/edit-in-one-component shape as ProfileModal/ProjectFormModal —
// opens read-only by default (with an Edit button for those with canEdit),
// so viewers who can only change status (assignees) or only look (other
// Managers, for coordination) get a sensible experience without a form.
function TaskDetailModal({
  isOpen,
  onClose,
  task,
  onUpdated,
  onDeleted,
  canEdit,
  canChangeStatus,
  employeeOptions,
}: TaskDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [dueDate, setDueDate] = useState('');
  const [estimatedHours, setEstimatedHours] = useState('');
  const [labelsInput, setLabelsInput] = useState('');
  const [assigneeIds, setAssigneeIds] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && task) {
      setIsEditing(false);
      setTitle(task.title);
      setDescription(task.description ?? '');
      setPriority(task.priority);
      setStatus(task.status);
      setDueDate(task.dueDate ? task.dueDate.slice(0, 10) : '');
      setEstimatedHours(task.estimatedHours != null ? String(task.estimatedHours) : '');
      setLabelsInput(task.labels.join(', '));
      setAssigneeIds(task.assignedTo.map((person) => person.id));
      setError('');
      setIsSubmitting(false);
    }
  }, [isOpen, task]);

  if (!task) return null;

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      const updated = await updateTaskRequest(task.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        dueDate: dueDate || undefined,
        estimatedHours: estimatedHours ? Number(estimatedHours) : undefined,
        labels: labelsInput
          .split(',')
          .map((label) => label.trim())
          .filter(Boolean),
        assignedTo: assigneeIds,
      });
      // Full update doesn't take status (separate endpoint, also open to
      // assignees) — apply it here as a second call only if it changed.
      const final = status !== task.status ? await updateTaskStatusRequest(task.id, status) : updated;
      onUpdated(final);
      setIsEditing(false);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to save task. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${task.title}"? This cannot be undone.`)) return;
    try {
      await deleteTaskRequest(task.id);
      onDeleted(task.id);
      onClose();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to delete task.'));
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setError('');
    try {
      const updated = await updateTaskStatusRequest(task.id, newStatus as TaskStatus);
      onUpdated(updated);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to update status.'));
    }
  };

  const priorityStyle = taskPriorityStyles[task.priority];
  const statusStyle = taskStatusStyles[task.status];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Edit Task' : 'Task Details'} maxWidthClassName="max-w-lg">
      {isEditing ? (
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label htmlFor="task-detail-title" className="block text-sm font-medium text-gray-700 mb-1.5">
              Task title
            </label>
            <input
              id="task-detail-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            />
          </div>

          <div>
            <label htmlFor="task-detail-description" className="block text-sm font-medium text-gray-700 mb-1.5">
              Description
            </label>
            <textarea
              id="task-detail-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="task-detail-priority" className="block text-sm font-medium text-gray-700 mb-1.5">
                Priority
              </label>
              <SingleSelectDropdown
                id="task-detail-priority"
                options={PRIORITY_OPTIONS}
                value={priority}
                onChange={(value) => setPriority(value as TaskPriority)}
              />
            </div>
            <div>
              <label htmlFor="task-detail-status" className="block text-sm font-medium text-gray-700 mb-1.5">
                Status
              </label>
              <SingleSelectDropdown
                id="task-detail-status"
                options={STATUS_OPTIONS}
                value={status}
                onChange={(value) => setStatus(value as TaskStatus)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="task-detail-due" className="block text-sm font-medium text-gray-700 mb-1.5">
                Due date
              </label>
              <DatePicker id="task-detail-due" value={dueDate} onChange={setDueDate} placeholder="Due date" disablePast />
            </div>
            <div>
              <label htmlFor="task-detail-hours" className="block text-sm font-medium text-gray-700 mb-1.5">
                Estimated hours
              </label>
              <input
                id="task-detail-hours"
                type="number"
                min="0"
                step="0.5"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              />
            </div>
          </div>

          <div>
            <label htmlFor="task-detail-labels" className="block text-sm font-medium text-gray-700 mb-1.5">
              Labels
            </label>
            <input
              id="task-detail-labels"
              type="text"
              value={labelsInput}
              onChange={(e) => setLabelsInput(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              placeholder="frontend, urgent"
            />
          </div>

          <div>
            <label htmlFor="task-detail-assignees" className="block text-sm font-medium text-gray-700 mb-1.5">
              Assignees
            </label>
            <MultiSelectDropdown
              id="task-detail-assignees"
              options={employeeOptions}
              selectedIds={assigneeIds}
              onChange={setAssigneeIds}
              placeholder="Select employees"
              emptyMessage="No employees on this project."
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              disabled={isSubmitting}
              className="flex-1 bg-white text-gray-700 border border-gray-200 rounded-lg py-2.5 text-sm font-semibold hover:bg-gray-50 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white rounded-lg py-2.5 text-sm font-semibold shadow-md shadow-indigo-200 hover:bg-indigo-500 active:scale-[0.99] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting && <Spinner size={16} />}
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
            <p className="text-sm text-gray-500 mt-1">{task.description || 'No description yet.'}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${priorityStyle.badge}`}>
              {priorityStyle.label} priority
            </span>
            {canChangeStatus && !canEdit ? (
              <div className="w-36">
                <SingleSelectDropdown compact options={STATUS_OPTIONS} value={task.status} onChange={handleStatusChange} />
              </div>
            ) : (
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusStyle.badge}`}>{statusStyle.label}</span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-gray-400 mb-1">Due date</p>
              <p className="text-gray-800">{task.dueDate ? formatDate(task.dueDate) : '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Estimated hours</p>
              <p className="text-gray-800">{task.estimatedHours ?? '—'}</p>
            </div>
          </div>

          {task.labels.length > 0 && (
            <div>
              <p className="text-xs text-gray-400 mb-1.5">Labels</p>
              <div className="flex flex-wrap gap-1.5">
                {task.labels.map((label) => (
                  <span
                    key={label}
                    className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="text-xs text-gray-400 mb-1.5">Assignees</p>
            {task.assignedTo.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {task.assignedTo.map((person) => (
                  <div key={person.id} className="flex items-center gap-1.5 bg-gray-50 rounded-full pl-1 pr-3 py-1">
                    <Avatar name={person.name} color={colorFromString(person.name)} imageUrl={person.photoUrl} size={22} />
                    <span className="text-xs text-gray-700">{person.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No one assigned</p>
            )}
          </div>

          <TaskComments taskId={task.id} />

          {error && (
            <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-white text-gray-700 border border-gray-200 rounded-lg py-2.5 text-sm font-semibold hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            {canEdit && (
              <>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="bg-white text-red-600 border border-red-200 rounded-lg px-4 py-2.5 text-sm font-semibold hover:bg-red-50 transition-colors"
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="flex-1 bg-indigo-600 text-white rounded-lg py-2.5 text-sm font-semibold shadow-md shadow-indigo-200 hover:bg-indigo-500 transition-colors"
                >
                  Edit
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}

export default TaskDetailModal;
