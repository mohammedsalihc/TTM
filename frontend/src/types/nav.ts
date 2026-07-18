import { ReactNode } from 'react';

export interface NavItem {
  label: string;
  icon: ReactNode;
  // Absent for nav items whose page doesn't exist yet (e.g. Notifications,
  // pending Batch 5) — rendered as a non-navigating placeholder instead of
  // a link to a route that doesn't exist.
  path?: string;
}
