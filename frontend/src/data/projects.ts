// Dashboard.tsx's "Project Progress" section still runs on this mock data —
// real aggregate progress stats need a backend endpoint that doesn't exist
// yet, so this is intentionally left as-is rather than wired to the real
// Projects API. Kept fully self-contained (its own status type + styles)
// so it doesn't depend on the real `Project`/`ProjectStatus` types in
// `../types`, which now reflect the actual backend contract.
export type MockProjectStatus = 'On track' | 'At risk' | 'Overdue';

export interface MockProject {
  id: string;
  name: string;
  description: string;
  manager: string;
  employees: string[];
  percent: number;
  status: MockProjectStatus;
  deadline: string;
}

export const mockProjectStatusStyles: Record<MockProjectStatus, { bar: string; badge: string }> = {
  'On track': { bar: 'bg-indigo-600', badge: 'bg-indigo-50 text-indigo-600' },
  'At risk': { bar: 'bg-amber-500', badge: 'bg-amber-50 text-amber-600' },
  Overdue: { bar: 'bg-red-500', badge: 'bg-red-50 text-red-600' },
};

export const projects: MockProject[] = [
  {
    id: 'p1',
    name: 'Website Revamp',
    description: 'Redesign the marketing site with a new visual identity and faster page loads.',
    manager: 'Mona Manager',
    employees: ['Eddie Employee', 'Nina Employee'],
    percent: 72,
    status: 'On track',
    deadline: 'Jul 28',
  },
  {
    id: 'p2',
    name: 'Mobile App Launch',
    description: 'Ship v1 of the mobile app to the App Store and Play Store.',
    manager: 'Mona Manager',
    employees: ['Eddie Employee'],
    percent: 45,
    status: 'At risk',
    deadline: 'Aug 4',
  },
  {
    id: 'p3',
    name: 'CRM Migration',
    description: 'Migrate customer records from the legacy CRM to the new platform without downtime.',
    manager: 'Derek Holt',
    employees: ['Sam Carter'],
    percent: 90,
    status: 'On track',
    deadline: 'Jul 18',
  },
  {
    id: 'p4',
    name: 'Internal Tools Cleanup',
    description: 'Retire unused internal dashboards and consolidate reporting into one tool.',
    manager: 'Aisha Khan',
    employees: ['Sam Carter', 'Priya Nair'],
    percent: 30,
    status: 'Overdue',
    deadline: 'Jul 10',
  },
  {
    id: 'p5',
    name: 'Onboarding Revamp',
    description: 'Rebuild the new-hire onboarding flow to cut ramp-up time for new employees.',
    manager: 'Leo Fischer',
    employees: [],
    percent: 12,
    status: 'On track',
    deadline: 'Sep 1',
  },
];
