import { Link, useLocation } from 'react-router-dom';
import Logo from './Logo';
import {
  DashboardIcon,
  UsersIcon,
  ManagersIcon,
  ProjectsIcon,
  ProfileIcon,
} from './icons';
import { NavItem } from '../types';

// Notifications lives in the Navbar bell dropdown (see NotificationsBell),
// not its own page, so it isn't a sidebar item.
const navItems: NavItem[] = [
  { label: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { label: 'Employees', icon: <UsersIcon />, path: '/employees' },
  { label: 'Managers', icon: <ManagersIcon />, path: '/managers' },
  { label: 'Projects', icon: <ProjectsIcon />, path: '/projects' },
  { label: 'Profile & Settings', icon: <ProfileIcon />, path: '/profile' },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

// Responsive behavior: below `lg`, this renders as an off-canvas drawer
// (hidden via -translate-x-full, slid in via `isOpen`) with a backdrop;
// at `lg` and above it's always visible as a static column.
function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 shrink-0 min-h-screen bg-white border-r border-gray-200 flex flex-col transform transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="px-6 py-6 border-b border-gray-100">
          <Logo />
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1">
          {navItems.map((item) => {
            const isActive = item.path === location.pathname;
            return (
              <Link
                key={item.label}
                to={item.path}
                onClick={onClose}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;
