import DashboardLayout from '../components/DashboardLayout';
import Avatar from '../components/Avatar';
import { useAuth } from '../context/AuthContext';
import { colorFromString } from '../utils/avatarColor';

function Profile() {
  const { profile } = useAuth();

  if (!profile) return null;

  return (
    <DashboardLayout>
      <div className="max-w-2xl space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">My Profile</h2>

        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-5">
            <Avatar name={profile.name} color={colorFromString(profile.name)} imageUrl={profile.photoUrl} size={64} />
            <div className="min-w-0">
              <p className="text-lg font-semibold text-gray-900 truncate">{profile.name}</p>
              <p className="text-sm text-gray-500 truncate">{profile.email}</p>
              {profile.designation && (
                <span className="inline-block mt-2 text-xs font-medium px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600">
                  {profile.designation}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-5 pt-5 border-t border-gray-100">
            <div>
              <p className="text-xs text-gray-400">Role</p>
              <p className="text-sm font-medium text-gray-800 mt-0.5 capitalize">{profile.role}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Business</p>
              <p className="text-sm font-medium text-gray-800 mt-0.5">{profile.businessName ?? '—'}</p>
            </div>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}

export default Profile;
