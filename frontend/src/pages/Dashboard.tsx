import DashboardLayout from '../components/DashboardLayout';
import StatCard from '../components/StatCard';
import {
  UsersIcon,
  ManagersIcon,
  ProjectsIcon,
  TasksIcon,
  CompletedIcon,
  InProgressIcon,
  OverdueIcon,
} from '../components/icons';
import { Stat, ProjectProgress, ProjectStatus } from '../types';

const stats: Stat[] = [
  { label: 'Total Employees', value: 18, icon: <UsersIcon size={22} />, accent: 'indigo' as const },
  { label: 'Total Managers', value: 4, icon: <ManagersIcon size={22} />, accent: 'indigo' as const },
  { label: 'Total Projects', value: 9, icon: <ProjectsIcon size={22} />, accent: 'gray' as const },
  { label: 'Total Tasks', value: 62, icon: <TasksIcon size={22} />, accent: 'gray' as const },
  { label: 'Completed', value: 34, icon: <CompletedIcon size={22} />, accent: 'green' as const },
  { label: 'In Progress', value: 21, icon: <InProgressIcon size={22} />, accent: 'amber' as const },
  { label: 'Overdue', value: 7, icon: <OverdueIcon size={22} />, accent: 'red' as const },
];

const projectProgress: ProjectProgress[] = [
  { name: 'Website Revamp', percent: 72, status: 'On track' },
  { name: 'Mobile App Launch', percent: 45, status: 'At risk' },
  { name: 'CRM Migration', percent: 90, status: 'On track' },
  { name: 'Internal Tools Cleanup', percent: 30, status: 'Overdue' },
];

const statusStyles: Record<ProjectStatus, { bar: string; badge: string }> = {
  'On track': { bar: 'bg-indigo-600', badge: 'bg-indigo-50 text-indigo-600' },
  'At risk': { bar: 'bg-amber-500', badge: 'bg-amber-50 text-amber-600' },
  Overdue: { bar: 'bg-red-500', badge: 'bg-red-50 text-red-600' },
};

function Dashboard() {
  return (
    <DashboardLayout>
      <div className="space-y-6 sm:space-y-8">
        <h2 className="text-2xl font-semibold text-gray-900">Dashboard</h2>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </section>

        <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-5">Project Progress</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projectProgress.map((project) => (
              <div key={project.name} className="rounded-lg border border-gray-100 p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-gray-800">{project.name}</span>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusStyles[project.status].badge}`}
                  >
                    {project.status}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${statusStyles[project.status].bar}`}
                    style={{ width: `${project.percent}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">{project.percent}% complete</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}

export default Dashboard;
