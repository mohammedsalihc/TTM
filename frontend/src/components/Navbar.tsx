import { useNavigate } from 'react-router-dom';
import Avatar from './Avatar';
import NotificationsBell from './NotificationsBell';
import { LogoutIcon } from './icons';
import { useAuth } from '../context/AuthContext';
import { colorFromString } from '../utils/avatarColor';

const MenuIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="4" y1="6" x2="20" y2="6" />
    <line x1="4" y1="12" x2="20" y2="12" />
    <line x1="4" y1="18" x2="20" y2="18" />
  </svg>
);

interface NavbarProps {
  onMenuClick: () => void;
}

function Navbar({ onMenuClick }: NavbarProps) {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const displayName = profile?.name ?? '';
  const businessName = profile?.businessName ?? 'TTM';

  const handleLogout = () => {
    localStorage.removeItem('ttm_token');
    localStorage.removeItem('ttm_user');
    navigate('/login');
  };

  return (
    <header className="flex items-center justify-between gap-3 px-4 lg:px-8 py-3 bg-white border-b border-gray-200 sticky top-0 z-20">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open menu"
          className="lg:hidden p-2 -ml-2 rounded-lg text-gray-500 hover:bg-gray-100"
        >
          <MenuIcon />
        </button>
        <span className="font-semibold text-gray-900 truncate">{businessName}</span>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <NotificationsBell />
        {displayName && (
          <>
            <Avatar name={displayName} color={colorFromString(displayName)} size={32} imageUrl={profile?.photoUrl} />
            <span className="text-sm font-medium text-gray-700 hidden sm:inline">{displayName}</span>
          </>
        )}
        <button
          type="button"
          onClick={handleLogout}
          aria-label="Logout"
          className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-red-600 rounded-lg px-2.5 py-1.5 hover:bg-red-50 transition-colors"
        >
          <LogoutIcon />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}

export default Navbar;
