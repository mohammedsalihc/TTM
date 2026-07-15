import { FormEvent, useEffect, useState } from 'react';
import Modal from './Modal';
import Spinner from './Spinner';
import DatePicker from './DatePicker';
import MultiSelectDropdown from './MultiSelectDropdown';
import SingleSelectDropdown from './SingleSelectDropdown';
import { createProjectRequest } from '../services/projectService';
import { usePeopleDirectory } from '../hooks/usePeopleDirectory';
import { getApiErrorMessage } from '../utils/getApiErrorMessage';

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

function AddProjectModal({ isOpen, onClose, onCreated }: AddProjectModalProps) {
  // Mounted unconditionally by the parent page (so its close transition can
  // play, same as AddPersonModal) — gate the directory fetch behind isOpen.
  const { managers, employees } = usePeopleDirectory(isOpen);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [managerId, setManagerId] = useState('');
  const [employeeIds, setEmployeeIds] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName('');
      setDescription('');
      setStartDate('');
      setDueDate('');
      setManagerId('');
      setEmployeeIds([]);
      setError('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !managerId || employeeIds.length === 0) {
      setError('Project name, a manager, and at least one employee are required.');
      return;
    }

    setError('');
    setIsSubmitting(true);
    try {
      // The project's owner (backend field) is always the assigned Manager
      // here — there's no separate "Owner" concept exposed in this form.
      await createProjectRequest({
        name: name.trim(),
        description: description.trim() || undefined,
        startDate: startDate || undefined,
        dueDate: dueDate || undefined,
        ownerId: managerId,
        memberIds: employeeIds,
      });
      onCreated();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to add project. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Project" maxWidthClassName="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="project-name" className="block text-sm font-medium text-gray-700 mb-1.5">
            Project name
          </label>
          <input
            id="project-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            placeholder="Website Revamp"
          />
        </div>

        <div>
          <label htmlFor="project-description" className="block text-sm font-medium text-gray-700 mb-1.5">
            Description
          </label>
          <textarea
            id="project-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition resize-none"
            placeholder="What's this project about?"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="project-start" className="block text-sm font-medium text-gray-700 mb-1.5">
              Start date
            </label>
            <DatePicker id="project-start" value={startDate} onChange={setStartDate} placeholder="Start date" />
          </div>
          <div>
            <label htmlFor="project-due" className="block text-sm font-medium text-gray-700 mb-1.5">
              Due date
            </label>
            <DatePicker id="project-due" value={dueDate} onChange={setDueDate} placeholder="Due date" />
          </div>
        </div>

        <div>
          <label htmlFor="project-manager" className="block text-sm font-medium text-gray-700 mb-1.5">
            Manager
          </label>
          <SingleSelectDropdown
            id="project-manager"
            options={managers}
            value={managerId}
            onChange={setManagerId}
            placeholder="Select a manager"
            emptyMessage="No managers yet."
          />
          {managers.length === 0 && (
            <p className="text-xs text-amber-600 mt-1">No managers yet — add one before creating a project.</p>
          )}
        </div>

        <div>
          <label htmlFor="project-employees" className="block text-sm font-medium text-gray-700 mb-1.5">
            Employees
          </label>
          <MultiSelectDropdown
            id="project-employees"
            options={employees}
            selectedIds={employeeIds}
            onChange={setEmployeeIds}
            placeholder="Select employees"
            emptyMessage="No employees yet."
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
            {isSubmitting ? 'Adding...' : 'Add Project'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default AddProjectModal;
