interface IconProps {
  size?: number;
}

const baseProps = (size: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

export const DashboardIcon = ({ size = 20 }: IconProps) => (
  <svg {...baseProps(size)} aria-hidden="true">
    <rect x="3" y="3" width="7" height="9" rx="1.5" />
    <rect x="14" y="3" width="7" height="5" rx="1.5" />
    <rect x="14" y="12" width="7" height="9" rx="1.5" />
    <rect x="3" y="16" width="7" height="5" rx="1.5" />
  </svg>
);

export const UsersIcon = ({ size = 20 }: IconProps) => (
  <svg {...baseProps(size)} aria-hidden="true">
    <circle cx="9" cy="8" r="3.5" />
    <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
    <path d="M16.5 6.5a3 3 0 010 6" />
    <path d="M21 20c0-2.8-2-5.1-4.7-5.8" />
  </svg>
);

export const ManagersIcon = ({ size = 20 }: IconProps) => (
  <svg {...baseProps(size)} aria-hidden="true">
    <path d="M12 2l2.2 4.7 5.1.6-3.8 3.6.9 5.1-4.4-2.4-4.4 2.4.9-5.1-3.8-3.6 5.1-.6z" />
  </svg>
);

export const ProjectsIcon = ({ size = 20 }: IconProps) => (
  <svg {...baseProps(size)} aria-hidden="true">
    <path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
  </svg>
);

export const ProfileIcon = ({ size = 20 }: IconProps) => (
  <svg {...baseProps(size)} aria-hidden="true">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8" />
  </svg>
);

export const MailIcon = ({ size = 15 }: IconProps) => (
  <svg {...baseProps(size)} aria-hidden="true">
    <path d="M22 6l-10 7L2 6" />
    <rect x="2" y="4" width="20" height="16" rx="2" />
  </svg>
);

export const TasksIcon = ({ size = 20 }: IconProps) => (
  <svg {...baseProps(size)} aria-hidden="true">
    <rect x="4" y="3" width="16" height="18" rx="2" />
    <path d="M8 8h8M8 12h8M8 16h5" />
  </svg>
);

export const CompletedIcon = ({ size = 20 }: IconProps) => (
  <svg {...baseProps(size)} aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="M8.5 12.5l2.5 2.5 4.5-5" />
  </svg>
);

export const InProgressIcon = ({ size = 20 }: IconProps) => (
  <svg {...baseProps(size)} aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3.5 2" />
  </svg>
);

export const OverdueIcon = ({ size = 20 }: IconProps) => (
  <svg {...baseProps(size)} aria-hidden="true">
    <path d="M12 9v4M12 17h.01" />
    <path d="M10.3 3.9L2.4 18a1.5 1.5 0 001.3 2.2h16.6a1.5 1.5 0 001.3-2.2L13.7 3.9a1.5 1.5 0 00-2.6 0z" />
  </svg>
);

// Feather Icons (MIT) — "edit-2"
export const EditIcon = ({ size = 16 }: IconProps) => (
  <svg {...baseProps(size)} aria-hidden="true">
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
  </svg>
);

// Feather Icons (MIT) — "tool" (wrench)
export const ToolsIcon = ({ size = 20 }: IconProps) => (
  <svg {...baseProps(size)} aria-hidden="true">
    <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
  </svg>
);

// Feather Icons (MIT) — "log-out"
export const LogoutIcon = ({ size = 18 }: IconProps) => (
  <svg {...baseProps(size)} aria-hidden="true">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

// Feather Icons (MIT) — "lock"
export const LockIcon = ({ size = 18 }: IconProps) => (
  <svg {...baseProps(size)} aria-hidden="true">
    <rect x="5" y="11" width="14" height="9" rx="2" />
    <path d="M8 11V7a4 4 0 018 0v4" />
  </svg>
);

// Feather Icons (MIT) — "briefcase" (used to represent a business/company)
export const BuildingIcon = ({ size = 18 }: IconProps) => (
  <svg {...baseProps(size)} aria-hidden="true">
    <rect x="2" y="7" width="20" height="14" rx="2" />
    <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
  </svg>
);

// Feather Icons (MIT) — "chevron-left"
export const ChevronLeftIcon = ({ size = 16 }: IconProps) => (
  <svg {...baseProps(size)} aria-hidden="true">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

// Feather Icons (MIT) — "chevron-right"
export const ChevronRightIcon = ({ size = 16 }: IconProps) => (
  <svg {...baseProps(size)} aria-hidden="true">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

// Material Design Icons (Apache-2.0) — "star", filled
export const StarIcon = ({ size = 16 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2l2.9 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l7.1-1.01z" />
  </svg>
);

// Feather Icons (MIT) — "search"
export const SearchIcon = ({ size = 16 }: IconProps) => (
  <svg {...baseProps(size)} aria-hidden="true">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

// Feather Icons (MIT) — "x"
export const CloseIcon = ({ size = 20 }: IconProps) => (
  <svg {...baseProps(size)} aria-hidden="true">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// Material Design Icons (Apache-2.0) — "photo_camera", filled — the
// standard "change profile photo" glyph (Facebook/LinkedIn use the same).
export const CameraIcon = ({ size = 16 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M9 2L7.17 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8a3 3 0 100 6 3 3 0 000-6z" />
  </svg>
);

// Feather Icons (MIT) — "refresh-cw" (used for "generate password")
export const RefreshIcon = ({ size = 16 }: IconProps) => (
  <svg {...baseProps(size)} aria-hidden="true">
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
  </svg>
);

// Feather Icons (MIT) — "eye"
export const EyeIcon = ({ size = 16 }: IconProps) => (
  <svg {...baseProps(size)} aria-hidden="true">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

// Feather Icons (MIT) — "eye-off"
export const EyeOffIcon = ({ size = 16 }: IconProps) => (
  <svg {...baseProps(size)} aria-hidden="true">
    <path d="M17.94 17.94A10.94 10.94 0 0112 20c-7 0-11-8-11-8a18.6 18.6 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

// Feather Icons (MIT) — "copy"
export const CopyIcon = ({ size = 14 }: IconProps) => (
  <svg {...baseProps(size)} aria-hidden="true">
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
  </svg>
);

// Feather Icons (MIT) — "calendar"
export const CalendarIcon = ({ size = 16 }: IconProps) => (
  <svg {...baseProps(size)} aria-hidden="true">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

// Feather Icons (MIT) — "settings"
export const SettingsIcon = ({ size = 16 }: IconProps) => (
  <svg {...baseProps(size)} aria-hidden="true">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
  </svg>
);

// Feather Icons (MIT) — "plus"
export const PlusIcon = ({ size = 14 }: IconProps) => (
  <svg {...baseProps(size)} aria-hidden="true">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

// Feather Icons (MIT) — "chevron-down"
export const ChevronDownIcon = ({ size = 16 }: IconProps) => (
  <svg {...baseProps(size)} aria-hidden="true">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);
