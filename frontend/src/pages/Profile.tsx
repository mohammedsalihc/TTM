import { FormEvent, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import Avatar from '../components/Avatar';
import Toggle from '../components/Toggle';
import { EditIcon } from '../components/icons';
import { currentUser } from '../data/currentUser';

function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentUser.name);
  const [phone, setPhone] = useState(currentUser.phone);

  const handleSave = () => {
    setIsEditing(false);
  };

  const handleCancel = () => {
    setName(currentUser.name);
    setPhone(currentUser.phone);
    setIsEditing(false);
  };

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [inAppNotifications, setInAppNotifications] = useState(true);

  const handleChangePassword = (e: FormEvent) => {
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
    setPasswordSaved(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">My Profile</h2>

        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-start gap-5">
            <Avatar name={currentUser.name} color={currentUser.avatarColor} size={64} />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    aria-label="Full name"
                    className="text-lg font-semibold text-gray-900 rounded-lg border border-gray-200 px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                ) : (
                  <p className="text-lg font-semibold text-gray-900 truncate">{name}</p>
                )}
                <button
                  type="button"
                  onClick={() => setIsEditing(!isEditing)}
                  aria-label={isEditing ? 'Close edit profile' : 'Edit profile'}
                  className="shrink-0 p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-indigo-600 transition-colors"
                >
                  <EditIcon />
                </button>
              </div>
              <p className="text-sm text-gray-500 truncate">{currentUser.email}</p>
              <span className="inline-block mt-2 text-xs font-medium px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600">
                {currentUser.designation}
              </span>

              <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-100">
                <div>
                  <p className="text-xs text-gray-400">Phone</p>
                  {isEditing ? (
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      aria-label="Phone"
                      className="w-full mt-0.5 text-sm text-gray-900 rounded-lg border border-gray-200 px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  ) : (
                    <p className="text-sm font-medium text-gray-800 mt-0.5">{phone}</p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-400">Date joined</p>
                  <p className="text-sm font-medium text-gray-800 mt-0.5">{currentUser.joinedDate}</p>
                </div>
              </div>

              {isEditing && (
                <div className="flex items-center gap-3 mt-4">
                  <button
                    type="button"
                    onClick={handleSave}
                    className="bg-indigo-600 text-white text-sm font-semibold rounded-lg px-4 py-2 shadow-sm hover:bg-indigo-500 transition-colors"
                  >
                    Save changes
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="text-sm font-semibold text-gray-600 border border-gray-200 rounded-lg px-4 py-2 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Notification Preferences</h3>
          <div className="space-y-4">
            <Toggle
              label="Email notifications"
              description="Get emailed when a task or project you're involved in changes."
              checked={emailNotifications}
              onChange={setEmailNotifications}
            />
            <Toggle
              label="In-app notifications"
              description="Show a live toast when an employee updates a task status."
              checked={inAppNotifications}
              onChange={setInAppNotifications}
            />
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Security</h3>
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
                className="bg-indigo-600 text-white text-sm font-semibold rounded-lg px-4 py-2.5 shadow-sm hover:bg-indigo-500 transition-colors"
              >
                Update password
              </button>
              {passwordSaved && <span className="text-sm text-green-600">Password updated</span>}
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-sm text-gray-500 mb-3">
              Forgot your password? We can send a reset link to your email instead.
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setResetSent(true)}
                className="text-sm font-semibold text-indigo-600 border border-indigo-200 rounded-lg px-4 py-2.5 hover:bg-indigo-50 transition-colors"
              >
                Send reset link to my email
              </button>
              {resetSent && <span className="text-sm text-green-600">Reset link sent</span>}
            </div>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}

export default Profile;
