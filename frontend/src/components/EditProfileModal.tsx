import { FormEvent, useEffect, useState } from 'react';
import Modal from './Modal';
import Avatar from './Avatar';
import Spinner from './Spinner';
import { ProfileIcon, BuildingIcon } from './icons';
import { getApiErrorMessage } from '../utils/getApiErrorMessage';
import { TeamMember } from '../types';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  person: TeamMember | null;
  // Owned by the page, not this component — Employees.tsx calls the real
  // update API here; Managers.tsx (no backend yet) just updates local
  // state. This modal only knows how to show a spinner and surface
  // whatever error that save throws.
  onSave: (updates: { name: string; designation?: string }) => Promise<void>;
}

function EditProfileModal({ isOpen, onClose, person, onSave }: EditProfileModalProps) {
  const [name, setName] = useState('');
  const [designation, setDesignation] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && person) {
      setName(person.name);
      setDesignation(person.designation ?? '');
      setError('');
    }
  }, [isOpen, person]);

  if (!person) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Name is required.');
      return;
    }

    setError('');
    setIsSubmitting(true);
    try {
      await onSave({ name: name.trim(), designation: designation.trim() || undefined });
      onClose();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to update employee. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Employee">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex justify-center pb-2">
          <Avatar name={name || person.name} color={person.avatarColor} imageUrl={person.photoUrl} size={80} />
        </div>

        <div>
          <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-1.5">
            Full name
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400" aria-hidden="true">
              <ProfileIcon size={16} />
            </span>
            <input
              id="edit-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white pl-10 pr-3 py-2.5 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            />
          </div>
        </div>

        <div>
          <label htmlFor="edit-designation" className="block text-sm font-medium text-gray-700 mb-1.5">
            Designation
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400" aria-hidden="true">
              <BuildingIcon size={16} />
            </span>
            <input
              id="edit-designation"
              type="text"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white pl-10 pr-3 py-2.5 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            />
          </div>
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
            {isSubmitting ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default EditProfileModal;
