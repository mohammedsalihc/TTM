import { useEffect, useState } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import DashboardLayout from '../components/DashboardLayout';
import StatCard from '../components/StatCard';
import Spinner from '../components/Spinner';
import { UsersIcon, ManagersIcon, ProjectsIcon, TasksIcon } from '../components/icons';
import { getDashboardStatsRequest, getDashboardChartsRequest, DashboardMonthlyBucket } from '../services/dashboardService';
import { getApiErrorMessage } from '../utils/getApiErrorMessage';
import { Stat } from '../types';

const MONTHS_TO_SHOW = 6;

function Dashboard() {
  const [stats, setStats] = useState<Stat[] | null>(null);
  const [months, setMonths] = useState<DashboardMonthlyBucket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError('');
    Promise.all([getDashboardStatsRequest(), getDashboardChartsRequest(MONTHS_TO_SHOW)])
      .then(([statsRes, chartsRes]) => {
        if (cancelled) return;
        setStats([
          { label: 'Total Employees', value: statsRes.totalEmployees, icon: <UsersIcon size={24} />, accent: 'indigo' },
          { label: 'Total Managers', value: statsRes.totalManagers, icon: <ManagersIcon size={24} />, accent: 'indigo' },
          { label: 'Total Projects', value: statsRes.totalProjects, icon: <ProjectsIcon size={24} />, accent: 'gray' },
          { label: 'Total Tasks', value: statsRes.totalTasks, icon: <TasksIcon size={24} />, accent: 'gray' },
        ]);
        setMonths(chartsRes.months);
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
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {(stats ?? []).map((stat) => (
                <StatCard key={stat.label} {...stat} />
              ))}
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 sm:p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Team Growth</h3>
                <p className="text-sm text-gray-500 mb-4">Employees vs. managers added over the last {MONTHS_TO_SHOW} months</p>
                <ResponsiveContainer width="100%" height={320}>
                  <AreaChart data={months} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="employeesArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#6366F1" stopOpacity={0.02} />
                      </linearGradient>
                      <linearGradient id="managersArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="2 4" vertical={false} stroke="#EEF0F3" />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                    <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                    <Tooltip
                      cursor={{ stroke: '#E5E7EB', strokeDasharray: '4 4' }}
                      contentStyle={{ borderRadius: 12, border: '1px solid #F3F4F6', fontSize: 13 }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 13 }} />
                    <Area
                      type="linear"
                      dataKey="employees"
                      name="Employees"
                      stroke="#6366F1"
                      strokeWidth={2}
                      fill="url(#employeesArea)"
                      dot={false}
                      activeDot={{ r: 4, strokeWidth: 0 }}
                    />
                    <Area
                      type="linear"
                      dataKey="managers"
                      name="Managers"
                      stroke="#F59E0B"
                      strokeWidth={2}
                      fill="url(#managersArea)"
                      dot={false}
                      activeDot={{ r: 4, strokeWidth: 0 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 sm:p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Projects Created</h3>
                <p className="text-sm text-gray-500 mb-4">New projects over the last {MONTHS_TO_SHOW} months</p>
                <ResponsiveContainer width="100%" height={320}>
                  <AreaChart data={months} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="projectsArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#6366F1" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="2 4" vertical={false} stroke="#EEF0F3" />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                    <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                    <Tooltip
                      cursor={{ stroke: '#E5E7EB', strokeDasharray: '4 4' }}
                      contentStyle={{ borderRadius: 12, border: '1px solid #F3F4F6', fontSize: 13 }}
                    />
                    <Area
                      type="linear"
                      dataKey="projects"
                      name="Projects"
                      stroke="#6366F1"
                      strokeWidth={2}
                      fill="url(#projectsArea)"
                      dot={false}
                      activeDot={{ r: 4, strokeWidth: 0 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </section>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

export default Dashboard;
