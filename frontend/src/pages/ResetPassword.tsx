import { FormEvent, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Logo from '../components/Logo';
import Spinner from '../components/Spinner';
import { LockIcon } from '../components/icons';
import { resetPasswordRequest } from '../services/authService';
import { getApiErrorMessage } from '../utils/getApiErrorMessage';

function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!token) {
      setError('This reset link is missing its token. Please request a new one.');
      return;
    }
    if (!newPassword || !confirmPassword) {
      setError('Both fields are required.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setError('');
    setIsLoading(true);
    try {
      await resetPasswordRequest(token, newPassword);
      setIsDone(true);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to reset password. The link may have expired.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50 to-violet-100 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-indigo-200/50 ring-1 ring-black/5 p-8">
          <div className="flex justify-center mb-6">
            <Logo />
          </div>

          {isDone ? (
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">Password updated</h1>
              <p className="text-sm text-gray-500 mt-2 mb-6">You can now sign in with your new password.</p>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 bg-indigo-600 text-white rounded-lg px-5 py-2.5 text-sm font-semibold shadow-md shadow-indigo-200 hover:bg-indigo-500 transition-colors"
              >
                Go to sign in
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-7 text-center">
                <h1 className="text-2xl font-bold text-gray-900">Set a new password</h1>
                <p className="text-sm text-gray-500 mt-1">Choose a new password for your account</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
                    New password
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400" aria-hidden="true">
                      <LockIcon size={18} />
                    </span>
                    <input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      autoComplete="new-password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 bg-white pl-10 pr-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Confirm new password
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400" aria-hidden="true">
                      <LockIcon size={18} />
                    </span>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 bg-white pl-10 pr-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                {error && (
                  <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white rounded-lg py-2.5 text-sm font-semibold shadow-md shadow-indigo-200 hover:bg-indigo-500 active:scale-[0.99] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading && <Spinner size={16} />}
                  {isLoading ? 'Updating...' : 'Update password'}
                </button>
              </form>

              <p className="text-sm text-gray-500 text-center mt-6">
                Remembered it after all?{' '}
                <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
