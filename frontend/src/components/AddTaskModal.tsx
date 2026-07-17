import { FormEvent, useEffect, useState } from 'react';
import Modal from './Modal';
import Spinner from './Spinner';
import DatePicker from './DatePicker';
import MultiSelectDropdown, { MultiSelectOption } from './MultiSelectDropdown';
import SingleSelectDropdown, { SelectOption } from './SingleSelectDropdown';
import { createTaskRequest } from '../services/taskService';
import { getApiErrorMessage } from '../utils/getApiErrorMessage';
import { TaskPriority } from '../types';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
  projectId: string;
  employeeOptions: MultiSelectOption[];
}

const PRIORITY_OPTIONS: SelectOption[] = [
  { id: 'low', name: 'Low' },
  { id: 'medium', name: 'Medium' },
  { id: 'high', name: 'High' },
  { id: 'critical', name: 'Critical' },
];

function AddTaskModal({ isOpen, onClose, onCreated, projectId, employeeOptions }: AddTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [estimatedHours, setEstimatedHours] = useState('');
  const [labelsInput, setLabelsInput] = useState('');
  const [assigneeIds, setAssigneeIds] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDueDate('');
      setEstimatedHours('');
      setLabelsInput('');
      setAssigneeIds([]);
      setError('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Task title is required.');
      return;
    }

    setError('');
    setIsSubmitting(true);
    try {
      await createTaskRequest({
        projectId,
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
      onCreated();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to add task. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Task" maxWidthClassName="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="task-title" className="block text-sm font-medium text-gray-700 mb-1.5">
            Task title
          </label>
          <input
            id="task-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            placeholder="Build login form"
          />
        </div>

        <div>
          <label htmlFor="task-description" className="block text-sm font-medium text-gray-700 mb-1.5">
            Description
          </label>
          <textarea
            id="task-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition resize-none"
            placeholder="What needs to be done?"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="task-priority" className="block text-sm font-medium text-gray-700 mb-1.5">
              Priority
            </label>
            <SingleSelectDropdown
              id="task-priority"
              options={PRIORITY_OPTIONS}
              value={priority}
              onChange={(value) => setPriority(value as TaskPriority)}
            />
          </div>
          <div>
            <label htmlFor="task-due" className="block text-sm font-medium text-gray-700 mb-1.5">
              Due date
            </label>
            <DatePicker id="task-due" value={dueDate} onChange={setDueDate} placeholder="Due date" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="task-hours" className="block text-sm font-medium text-gray-700 mb-1.5">
              Estimated hours
            </label>
            <input
              id="task-hours"
              type="number"
              min="0"
              step="0.5"
              value={estimatedHours}
              onChange={(e) => setEstimatedHours(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              placeholder="4"
            />
          </div>
          <div>
            <label htmlFor="task-labels" className="block text-sm font-medium text-gray-700 mb-1.5">
              Labels
            </label>
            <input
              id="task-labels"
              type="text"
              value={labelsInput}
              onChange={(e) => setLabelsInput(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              placeholder="frontend, urgent"
            />
          </div>
        </div>

        <div>
          <label htmlFor="task-assignees" className="block text-sm font-medium text-gray-700 mb-1.5">
            Assignees
          </label>
          <MultiSelectDropdown
            id="task-assignees"
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
            onClick={onClose}
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
            {isSubmitting ? 'Adding...' : 'Add Task'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default AddTaskModal;
