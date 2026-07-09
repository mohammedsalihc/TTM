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

export const SettingsIcon = ({ size = 20 }: IconProps) => (
  <svg {...baseProps(size)} aria-hidden="true">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 00.3 1.9l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.9-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1-1.6 1.7 1.7 0 00-1.9.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.9 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.6-1 1.7 1.7 0 00-.3-1.9l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.9.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.9-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.9V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z" />
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
