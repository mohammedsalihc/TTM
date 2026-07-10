import { useNavigate } from 'react-router-dom';
import Avatar from './Avatar';
import { LogoutIcon } from './icons';
import { currentUser } from '../data/currentUser';

const businessName = 'Acme Inc.';

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

// No AuthContext/real auth yet — logout just routes back to /login,
// and the business name is a placeholder until multi-tenant/org data exists.
function Navbar({ onMenuClick }: NavbarProps) {
  const navigate = useNavigate();

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
        <Avatar name={currentUser.name} color={currentUser.avatarColor} size={32} />
        <span className="text-sm font-medium text-gray-700 hidden sm:inline">{currentUser.name}</span>
        <button
          type="button"
          onClick={() => navigate('/login')}
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
