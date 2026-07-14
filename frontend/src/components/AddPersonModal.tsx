import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react';
import Modal from './Modal';
import Avatar from './Avatar';
import Spinner from './Spinner';
import {
  MailIcon,
  ProfileIcon,
  BuildingIcon,
  LockIcon,
  CameraIcon,
  RefreshIcon,
  EyeIcon,
  EyeOffIcon,
  CopyIcon,
} from './icons';
import { generatePassword } from '../utils/generatePassword';
import { randomColor } from '../utils/avatarColor';
import { createEmployeeRequest } from '../services/employeeService';
import { createManagerRequest } from '../services/managerService';
import { uploadImageRequest } from '../services/uploadService';
import { getApiErrorMessage } from '../utils/getApiErrorMessage';

type PersonRole = 'employee' | 'manager';

interface AddPersonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
  // Only real difference between "Add Employee" and "Add Manager": managers
  // don't have a Designation field, and each role calls its own create API.
  role: PersonRole;
}

const roleLabel: Record<PersonRole, string> = { employee: 'Employee', manager: 'Manager' };

function AddPersonModal({ isOpen, onClose, onCreated, role }: AddPersonModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [designation, setDesignation] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [previewColor, setPreviewColor] = useState(randomColor);
  const [sendEmailInvite, setSendEmailInvite] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setName('');
      setEmail('');
      setDesignation('');
      setPassword('');
      setShowPassword(false);
      setCopied(false);
      setPhotoFile(null);
      setPhotoPreviewUrl(null);
      setPreviewColor(randomColor());
      setSendEmailInvite(false);
      setError('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  // The preview is a local object URL for instant feedback — the actual
  // file only gets uploaded to Cloudinary when the form is submitted.
  useEffect(() => {
    return () => {
      if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl);
    };
  }, [photoPreviewUrl]);

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreviewUrl(URL.createObjectURL(file));
  };

  const copyToClipboard = (value: string) => {
    navigator.clipboard?.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleGeneratePassword = () => {
    const generated = generatePassword();
    setPassword(generated);
    setShowPassword(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Name, email, and password are required.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
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

      if (role === 'employee') {
        await createEmployeeRequest({
          name: name.trim(),
          email: email.trim(),
          password,
          designation: designation.trim() || undefined,
          photoUrl,
          sendEmailInvite,
        });
      } else {
        await createManagerRequest({
          name: name.trim(),
          email: email.trim(),
          password,
          photoUrl,
          sendEmailInvite,
        });
      }
      onCreated();
    } catch (err) {
      setError(getApiErrorMessage(err, `Unable to add ${roleLabel[role].toLowerCase()}. Please try again.`));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Add ${roleLabel[role]}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex justify-center">
          <div className="relative">
            {photoPreviewUrl ? (
              <img
                src={photoPreviewUrl}
                alt=""
                className="w-20 h-20 rounded-full object-cover ring-2 ring-white shadow-sm"
              />
            ) : name.trim() ? (
              <Avatar name={name} color={previewColor} size={80} />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gray-100 ring-2 ring-white shadow-sm flex items-center justify-center text-gray-400">
                <ProfileIcon size={32} />
              </div>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Add photo"
              aria-label="Add photo"
              className="absolute bottom-0 right-0 w-7 h-7 flex items-center justify-center rounded-full bg-indigo-600 text-white shadow-md hover:bg-indigo-500 transition-colors"
            >
              <CameraIcon size={14} />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
          </div>
        </div>

        <div>
          <label htmlFor="person-name" className="block text-sm font-medium text-gray-700 mb-1.5">
            Full name
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400" aria-hidden="true">
              <ProfileIcon size={16} />
            </span>
            <input
              id="person-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white pl-10 pr-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              placeholder="Name"
            />
          </div>
        </div>

        <div>
          <label htmlFor="person-email" className="block text-sm font-medium text-gray-700 mb-1.5">
            Email
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400" aria-hidden="true">
              <MailIcon size={16} />
            </span>
            <input
              id="person-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white pl-10 pr-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              placeholder="Email"
            />
          </div>
        </div>

        {role === 'employee' && (
          <div>
            <label htmlFor="person-designation" className="block text-sm font-medium text-gray-700 mb-1.5">
              Designation
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400" aria-hidden="true">
                <BuildingIcon size={16} />
              </span>
              <input
                id="person-designation"
                type="text"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white pl-10 pr-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                placeholder="Designation"
              />
            </div>
          </div>
        )}

        <div>
          <label htmlFor="person-password" className="block text-sm font-medium text-gray-700 mb-1.5">
            Password
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400" aria-hidden="true">
              <LockIcon size={16} />
            </span>
            <input
              id="person-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white pl-10 pr-24 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              placeholder="Password"
            />
            <div className="absolute inset-y-0 right-0 flex items-center gap-0.5 pr-2">
              {password && (
                <button
                  type="button"
                  onClick={() => copyToClipboard(password)}
                  title="Copy password"
                  aria-label="Copy password"
                  className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <CopyIcon size={14} />
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                title={showPassword ? 'Hide password' : 'Show password'}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOffIcon size={14} /> : <EyeIcon size={14} />}
              </button>
              <button
                type="button"
                onClick={handleGeneratePassword}
                title="Generate password"
                aria-label="Generate password"
                className="p-1.5 text-gray-400 hover:text-indigo-600 transition-colors"
              >
                <RefreshIcon size={14} />
              </button>
            </div>
          </div>
          {copied && <p className="text-xs text-emerald-600 mt-1">Copied to clipboard</p>}

          <label className="flex items-center gap-1.5 mt-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={sendEmailInvite}
              onChange={(e) => setSendEmailInvite(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-xs text-gray-500">Send email invite</span>
          </label>
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
            {isSubmitting ? 'Adding...' : `Add ${roleLabel[role]}`}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default AddPersonModal;
