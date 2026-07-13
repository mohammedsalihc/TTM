import { useEffect, useState } from 'react';
import Modal from './Modal';
import Avatar from './Avatar';
import { MailIcon } from './icons';
import { TeamMember } from '../types';

interface ViewProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  person: TeamMember | null;
  // Optional — Employees.tsx passes the real GET /api/employees/:id call;
  // Managers.tsx (no backend yet) omits it and the modal just shows the
  // already-loaded row data, same as before.
  onRefresh?: (id: string) => Promise<TeamMember>;
}

// Shows the cached row data immediately (no loading flash), then silently
// refreshes with the authoritative server copy if `onRefresh` is provided.
// `person` stays set while closing so the exit transition doesn't blank out
// mid-animation.
function ViewProfileModal({ isOpen, onClose, person, onRefresh }: ViewProfileModalProps) {
  const [displayPerson, setDisplayPerson] = useState<TeamMember | null>(person);

  useEffect(() => {
    setDisplayPerson(person);
  }, [person]);

  useEffect(() => {
    if (!isOpen || !person || !onRefresh) return;
    onRefresh(person.id)
      .then(setDisplayPerson)
      .catch((err) => console.error('Failed to refresh profile details:', err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, person?.id]);

  if (!displayPerson) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Employee Profile">
      <div className="flex flex-col items-center text-center pb-5 border-b border-gray-100">
        <div className="ring-2 ring-white shadow-sm rounded-full">
          <Avatar
            name={displayPerson.name}
            color={displayPerson.avatarColor}
            imageUrl={displayPerson.photoUrl}
            size={128}
          />
        </div>
        <p className="mt-3 text-lg font-semibold text-gray-900">{displayPerson.name}</p>
        {displayPerson.designation && (
          <span className="mt-2 inline-block text-xs font-medium px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600">
            {displayPerson.designation}
          </span>
        )}
      </div>

      <div className="pt-5 space-y-4">
        <div>
          <p className="text-xs text-gray-400">Email</p>
          <div className="flex items-center gap-2 mt-0.5 text-sm font-medium text-gray-800">
            <MailIcon size={15} />
            <span className="truncate">{displayPerson.email}</span>
          </div>
        </div>

        {/* Static placeholder stats — no real task/project tracking backend yet. */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
          <div>
            <p className="text-xs text-gray-400">Projects completed</p>
            <p className="text-sm font-semibold text-gray-800 mt-0.5">8</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Overall performance</p>
            <p className="text-sm font-semibold text-gray-800 mt-0.5">Good</p>
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-400 mb-1.5">Projects</p>
          {displayPerson.projects.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {displayPerson.projects.map((project) => (
                <span
                  key={project}
                  className="text-xs font-medium px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100"
                >
                  {project}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic">No projects assigned</p>
          )}
        </div>
      </div>

      <div className="pt-6">
        <button
          type="button"
          onClick={onClose}
          className="w-full bg-white text-gray-700 border border-gray-200 rounded-lg py-2.5 text-sm font-semibold hover:bg-gray-50 transition-colors"
        >
          Close
        </button>
      </div>
    </Modal>
  );
}

export default ViewProfileModal;
