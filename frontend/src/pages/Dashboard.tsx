import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import StatCard from '../components/StatCard';
import ProjectCard from '../components/ProjectCard';
import Spinner from '../components/Spinner';
import {
  UsersIcon,
  ManagersIcon,
  ProjectsIcon,
  TasksIcon,
  CompletedIcon,
  InProgressIcon,
} from '../components/icons';
import { listEmployeesRequest } from '../services/employeeService';
import { listManagersRequest } from '../services/managerService';
import { listProjectsRequest } from '../services/projectService';
import { listTasksRequest } from '../services/taskService';
import { getApiErrorMessage } from '../utils/getApiErrorMessage';
import { Project, Stat } from '../types';

const RECENT_PROJECTS_LIMIT = 4;

function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stat[] | null>(null);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError('');
    Promise.all([
      listEmployeesRequest({ page: 1, limit: 1 }),
      listManagersRequest({ page: 1, limit: 1 }),
      listProjectsRequest({ page: 1, limit: RECENT_PROJECTS_LIMIT }),
      listTasksRequest({ page: 1, limit: 1 }),
      listTasksRequest({ page: 1, limit: 1, status: 'completed' }),
      listTasksRequest({ page: 1, limit: 1, status: 'in-progress' }),
    ])
      .then(([employeesRes, managersRes, projectsRes, tasksRes, completedRes, inProgressRes]) => {
        if (cancelled) return;
        setStats([
          { label: 'Total Employees', value: employeesRes.pagination.total, icon: <UsersIcon size={22} />, accent: 'indigo' },
          { label: 'Total Managers', value: managersRes.pagination.total, icon: <ManagersIcon size={22} />, accent: 'indigo' },
          { label: 'Total Projects', value: projectsRes.pagination.total, icon: <ProjectsIcon size={22} />, accent: 'gray' },
          { label: 'Total Tasks', value: tasksRes.pagination.total, icon: <TasksIcon size={22} />, accent: 'gray' },
          { label: 'Completed', value: completedRes.pagination.total, icon: <CompletedIcon size={22} />, accent: 'green' },
          { label: 'In Progress', value: inProgressRes.pagination.total, icon: <InProgressIcon size={22} />, accent: 'amber' },
        ]);
        setRecentProjects(projectsRes.data);
      })
      .catch((err) => {
        if (!cancelled) setError(getApiErrorMessage(err, 'Unable to load dashboard data.'));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6 sm:space-y-8">
        <h2 className="text-2xl font-semibold text-gray-900">Dashboard</h2>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-gray-400">
            <Spinner size={16} />
            Loading...
          </div>
        ) : (
          <>
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(stats ?? []).map((stat) => (
                <StatCard key={stat.label} {...stat} />
              ))}
            </section>

            <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-5">Recent Projects</h3>
              {recentProjects.length === 0 ? (
                <p className="text-sm text-gray-400 italic">No projects yet</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recentProjects.map((project) => (
                    <ProjectCard key={project.id} project={project} onView={(p) => navigate(`/projects/${p.id}`)} />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

export default Dashboard;
