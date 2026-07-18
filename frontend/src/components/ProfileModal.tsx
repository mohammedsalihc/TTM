import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react';
import Modal from './Modal';
import Avatar from './Avatar';
import Spinner from './Spinner';
import Toggle from './Toggle';
import { MailIcon, ProfileIcon, BuildingIcon, CameraIcon, EditIcon } from './icons';
import { uploadImageRequest } from '../services/uploadService';
import { getApiErrorMessage } from '../utils/getApiErrorMessage';
import { TeamMember } from '../types';

type ProfileModalMode = 'view' | 'edit';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  person: TeamMember | null;
  // "Employee" / "Manager" — drives both the title ("Employee Profile" /
  // "Edit Employee") and which edit fields show below.
  columnLabel: string;
  initialMode: ProfileModalMode;
  // Employees get an editable Designation field; Managers get the
  // permission toggles instead. Neither, and edit mode is just photo+name.
  showDesignation?: boolean;
  showPermissionToggles?: boolean;
  // Required to reach edit mode at all — View-only usages can omit it.
  onSave?: (updates: {
    name: string;
    designation?: string;
    photoUrl?: string;
    canManageProjects?: boolean;
    canManageEmployees?: boolean;
  }) => Promise<void>;
  // Optional — Employees.tsx passes the real GET /api/employees/:id call;
  // Managers.tsx (no backend yet) omits it and view mode just shows the
  // already-loaded row data.
  onRefresh?: (id: string) => Promise<TeamMember>;
}

// One modal for both "view a person" and "edit a person" — they're the
// same data (avatar, name, designation/role-specific fields, email), one
// read-only and one a form, so keeping them as separate components meant
// duplicating most of the layout. `initialMode` picks which one opens;
// view mode also gets its own Edit button (when onSave is available) to
// switch into edit mode in place, rather than closing and reopening.
function ProfileModal({
  isOpen,
  onClose,
  person,
  columnLabel,
  initialMode,
  showDesignation = false,
  showPermissionToggles = false,
  onSave,
  onRefresh,
}: ProfileModalProps) {
  const [mode, setMode] = useState<ProfileModalMode>(initialMode);
  const [displayPerson, setDisplayPerson] = useState<TeamMember | null>(person);

  const [name, setName] = useState('');
  const [designation, setDesignation] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [canManageProjects, setCanManageProjects] = useState(false);
  const [canManageEmployees, setCanManageEmployees] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset everything to a fresh snapshot of `person` each time the modal opens.
  useEffect(() => {
    if (!isOpen || !person) return;
    setMode(initialMode);
    setDisplayPerson(person);
    setName(person.name);
    setDesignation(person.designation ?? '');
    setPhotoFile(null);
    setPhotoPreviewUrl(person.photoUrl ?? null);
    setCanManageProjects(person.canManageProjects ?? false);
    setCanManageEmployees(person.canManageEmployees ?? false);
    setError('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, person?.id]);

  // Silently refresh view mode with the authoritative server copy, if the
  // page provided a fetch — no loading flash, the cached row data is
  // already showing.
  useEffect(() => {
    if (!isOpen || !person || !onRefresh) return;
    onRefresh(person.id)
      .then(setDisplayPerson)
      .catch((err) => console.error('Failed to refresh profile details:', err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, person?.id]);

  useEffect(() => {
    return () => {
      if (photoFile && photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl);
    };
  }, [photoFile, photoPreviewUrl]);

  if (!person || !displayPerson) return null;

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!onSave) return;

    if (!name.trim()) {
      setError('Name is required.');
      return;
    }

    setError('');
    setIsSubmitting(true);
    try {
      let photoUrl: string | undefined;
      if (photoFile) {
        try {
          photoUrl = await uploadImageRequest(photoFile);
        } catch (uploadErr) {
          setError(getApiErrorMessage(uploadErr, 'Unable to upload photo. Please try again.'));
          return;
        }
      }

      await onSave({
        name: name.trim(),
        designation: showDesignation ? designation.trim() || undefined : undefined,
        photoUrl,
        canManageProjects: showPermissionToggles ? canManageProjects : undefined,
        canManageEmployees: showPermissionToggles ? canManageEmployees : undefined,
      });
      onClose();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to save changes. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const title = mode === 'edit' ? `Edit ${columnLabel}` : `${columnLabel} Profile`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      {mode === 'view' ? (
        <>
          <div className="flex flex-col items-center text-center pb-5 border-b border-gray-100">
            <div className="relative">
              <div className="ring-2 ring-white shadow-sm rounded-full">
                <Avatar
                  name={displayPerson.name}
                  color={displayPerson.avatarColor}
                  imageUrl={displayPerson.photoUrl}
                  size={128}
                />
              </div>
              {onSave && (
                <button
                  type="button"
                  onClick={() => setMode('edit')}
                  title={`Edit ${columnLabel.toLowerCase()}`}
                  aria-label={`Edit ${columnLabel.toLowerCase()}`}
                  className="absolute bottom-0 right-0 w-8 h-8 flex items-center justify-center rounded-full bg-indigo-600 text-white shadow-md hover:bg-indigo-500 transition-colors"
                >
                  <EditIcon size={14} />
                </button>
              )}
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
        </>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex justify-center pb-2">
            <div className="relative">
              {photoPreviewUrl ? (
                <img
                  src={photoPreviewUrl}
                  alt=""
                  className="w-20 h-20 rounded-full object-cover ring-2 ring-white shadow-sm"
                />
              ) : (
                <Avatar name={name || person.name} color={person.avatarColor} size={80} />
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Change photo"
                aria-label="Change photo"
                className="absolute bottom-0 right-0 w-7 h-7 flex items-center justify-center rounded-full bg-indigo-600 text-white shadow-md hover:bg-indigo-500 transition-colors"
              >
                <CameraIcon size={14} />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
            </div>
          </div>

          <div>
            <label htmlFor="profile-name" className="block text-sm font-medium text-gray-700 mb-1.5">
              Full name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400" aria-hidden="true">
                <ProfileIcon size={16} />
              </span>
              <input
                id="profile-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white pl-10 pr-3 py-2.5 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              />
            </div>
          </div>

          {showDesignation && (
            <div>
              <label htmlFor="profile-designation" className="block text-sm font-medium text-gray-700 mb-1.5">
                Designation
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400" aria-hidden="true">
                  <BuildingIcon size={16} />
                </span>
                <input
                  id="profile-designation"
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white pl-10 pr-3 py-2.5 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                />
              </div>
            </div>
          )}

          {showPermissionToggles && (
            <div className="space-y-3 rounded-lg border border-gray-200 p-3.5">
              <Toggle
                label="Manage Projects"
                description="Allow this manager to create and delete projects."
                checked={canManageProjects}
                onChange={setCanManageProjects}
              />
              <Toggle
                label="Manage Employees"
                description="Allow this manager to add and edit employees (not other managers)."
                checked={canManageEmployees}
                onChange={setCanManageEmployees}
              />
            </div>
          )}

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
      )}
    </Modal>
  );
}

export default ProfileModal;
