import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import Avatar from '../components/Avatar';
import Spinner from '../components/Spinner';
import { CameraIcon, EditIcon } from '../components/icons';
import { updateProfileRequest, changePasswordRequest } from '../services/profileService';
import { forgotPasswordRequest } from '../services/authService';
import { uploadImageRequest } from '../services/uploadService';
import { getApiErrorMessage } from '../utils/getApiErrorMessage';
import { colorFromString } from '../utils/avatarColor';
import { useAuth } from '../context/AuthContext';

function Profile() {
  const { profile, refresh } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [profileError, setProfileError] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const [isSendingReset, setIsSendingReset] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetError, setResetError] = useState('');

  useEffect(() => {
    if (!profile) return;
    setName(profile.name);
    setPhone(profile.phone ?? '');
  }, [profile]);

  useEffect(() => {
    return () => {
      if (photoFile && photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl);
    };
  }, [photoFile, photoPreviewUrl]);

  if (!profile) return null;

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreviewUrl(URL.createObjectURL(file));
  };

  const handleCancelEdit = () => {
    setName(profile.name);
    setPhone(profile.phone ?? '');
    setPhotoFile(null);
    setPhotoPreviewUrl(null);
    setProfileError('');
    setIsEditing(false);
  };

  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setProfileError('Name is required.');
      return;
    }

    setProfileError('');
    setIsSavingProfile(true);
    try {
      let photoUrl: string | undefined;
      if (photoFile) {
        try {
          photoUrl = await uploadImageRequest(photoFile);
        } catch (uploadErr) {
          setProfileError(getApiErrorMessage(uploadErr, 'Unable to upload photo. Please try again.'));
          return;
        }
      }

      await updateProfileRequest({
        name: name.trim(),
        phone: phone.trim() || undefined,
        photoUrl,
      });
      await refresh();
      setPhotoFile(null);
      setPhotoPreviewUrl(null);
      setIsEditing(false);
    } catch (err) {
      setProfileError(getApiErrorMessage(err, 'Unable to save changes. Please try again.'));
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('All fields are required.');
      setPasswordSaved(false);
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      setPasswordSaved(false);
      return;
    }

    setPasswordError('');
    setIsSavingPassword(true);
    try {
      await changePasswordRequest({ currentPassword, newPassword });
      setPasswordSaved(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(getApiErrorMessage(err, 'Unable to update password. Please try again.'));
      setPasswordSaved(false);
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleForgotPassword = async () => {
    setResetError('');
    setIsSendingReset(true);
    try {
      await forgotPasswordRequest(profile.email);
      setResetSent(true);
    } catch (err) {
      setResetError(getApiErrorMessage(err, 'Unable to send reset link. Please try again.'));
    } finally {
      setIsSendingReset(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">My Profile</h2>

        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          {isEditing ? (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="flex justify-center pb-2">
                <div className="relative">
                  {photoPreviewUrl ? (
                    <img
                      src={photoPreviewUrl}
                      alt=""
                      className="w-20 h-20 rounded-full object-cover ring-2 ring-white shadow-sm"
                    />
                  ) : (
                    <Avatar
                      name={name || profile.name}
                      color={colorFromString(profile.name)}
                      imageUrl={profile.photoUrl}
                      size={80}
                    />
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
                <input
                  id="profile-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                />
              </div>

              <div>
                <label htmlFor="profile-phone" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Phone
                </label>
                <input
                  id="profile-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 012-3456"
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                />
              </div>

              {profileError && (
                <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                  {profileError}
                </p>
              )}

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="flex items-center justify-center gap-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg px-4 py-2 shadow-sm hover:bg-indigo-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSavingProfile && <Spinner size={14} />}
                  {isSavingProfile ? 'Saving...' : 'Save changes'}
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={isSavingProfile}
                  className="text-sm font-semibold text-gray-600 border border-gray-200 rounded-lg px-4 py-2 hover:bg-gray-50 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="flex items-start gap-5">
              <Avatar name={profile.name} color={colorFromString(profile.name)} imageUrl={profile.photoUrl} size={64} />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-lg font-semibold text-gray-900 truncate">{profile.name}</p>
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    aria-label="Edit profile"
                    className="shrink-0 p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-indigo-600 transition-colors"
                  >
                    <EditIcon />
                  </button>
                </div>
                <p className="text-sm text-gray-500 truncate">{profile.email}</p>
                {profile.designation && (
                  <span className="inline-block mt-2 text-xs font-medium px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600">
                    {profile.designation}
                  </span>
                )}

                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-100">
                  <div>
                    <p className="text-xs text-gray-400">Phone</p>
                    <p className="text-sm font-medium text-gray-800 mt-0.5">{profile.phone || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Business</p>
                    <p className="text-sm font-medium text-gray-800 mt-0.5">{profile.businessName ?? '—'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Change Password</h3>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
                Current password
              </label>
              <input
                id="currentPassword"
                name="currentPassword"
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value);
                  setPasswordSaved(false);
                }}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              />
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
                New password
              </label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setPasswordSaved(false);
                }}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
                Confirm new password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setPasswordSaved(false);
                }}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              />
            </div>

            {passwordError && (
              <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {passwordError}
              </p>
            )}

            <div className="flex items-center gap-3 pt-1">
              <button
                type="submit"
                disabled={isSavingPassword}
                className="flex items-center justify-center gap-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg px-4 py-2.5 shadow-sm hover:bg-indigo-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSavingPassword && <Spinner size={14} />}
                {isSavingPassword ? 'Updating...' : 'Update password'}
              </button>
              {passwordSaved && <span className="text-sm text-green-600">Password updated</span>}
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-sm text-gray-500 mb-3">
              Forgot your password? We can send a reset link to your email instead.
            </p>
            {resetError && (
              <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-3">
                {resetError}
              </p>
            )}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={isSendingReset || resetSent}
                className="flex items-center justify-center gap-2 text-sm font-semibold text-indigo-600 border border-indigo-200 rounded-lg px-4 py-2.5 hover:bg-indigo-50 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSendingReset && <Spinner size={14} />}
                {resetSent ? 'Reset link sent' : isSendingReset ? 'Sending...' : 'Send reset link to my email'}
              </button>
            </div>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}

export default Profile;
