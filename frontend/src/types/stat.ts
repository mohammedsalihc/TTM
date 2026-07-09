import { ReactNode } from 'react';

export type StatAccent = 'indigo' | 'green' | 'amber' | 'red' | 'gray';

export interface Stat {
  label: string;
  value: string | number;
  icon: ReactNode;
  accent?: StatAccent;
}
