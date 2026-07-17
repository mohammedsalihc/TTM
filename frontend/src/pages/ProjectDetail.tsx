import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import Avatar from '../components/Avatar';
import Spinner from '../components/Spinner';
import TaskColumn from '../components/TaskColumn';
import TaskCard from '../components/TaskCard';
import AddTaskModal from '../components/AddTaskModal';
import ProjectFormModal from '../components/ProjectFormModal';
import { ChevronLeftIcon } from '../components/icons';
import { statusStyles } from '../components/projectStatusStyles';
import { getProjectRequest, deleteProjectRequest } from '../services/projectService';
import { listTasksRequest, updateTaskStatusRequest } from '../services/taskService';
import { getApiErrorMessage } from '../utils/getApiErrorMessage';
import { colorFromString } from '../utils/avatarColor';
import { useAuth } from '../context/AuthContext';
import { Project, Task, TaskStatus, UserRole } from '../types';

const formatDate = (iso: string) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const BOARD_COLUMNS: { status: TaskStatus; title: string }[] = [
  { status: 'todo', title: 'To Do' },
  { status: 'in-progress', title: 'In Progress' },
  { status: 'completed', title: 'Completed' },
];

function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);

  const fetchProject = useCallback(async () => {
    if (!id) return;
    const result = await getProjectRequest(id);
    setProject(result);
  }, [id]);

  const fetchTasks = useCallback(async () => {
    if (!id) return;
    const result = await listTasksRequest({ projectId: id, limit: 100 });
    setTasks(result.data);
  }, [id]);

  useEffect(() => {
    setIsLoading(true);
    setError('');
    Promise.all([fetchProject(), fetchTasks()])
      .catch((err) => setError(getApiErrorMessage(err, 'Unable to load this project.')))
      .finally(() => setIsLoading(false));
  }, [fetchProject, fetchTasks]);

  // Same ownership rule the backend enforces: Admin always, a Manager only
  // if they own this project and still hold the permission.
  const canManageProject =
    !!project &&
    !!profile &&
    (profile.role === UserRole.Admin ||
      (profile.role === UserRole.Manager && profile.canManageProjects === true && project.owner?.id === profile.id));

  const employeeOptions = (project?.members ?? []).filter((member) => member.role === UserRole.Employee);

  const handleDeleteProject = async () => {
    if (!project) return;
    if (!window.confirm(`Delete "${project.name}"? This cannot be undone.`)) return;
    try {
      await deleteProjectRequest(project.id);
      navigate('/projects');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to delete project.'));
    }
  };

  const handleTaskStatusChange = async (taskId: string, status: TaskStatus) => {
    try {
      const updated = await updateTaskStatusRequest(taskId, status);
      setTasks((prev) => prev.map((task) => (task.id === taskId ? updated : task)));
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to update task status.'));
    }
  };

  const canChangeTaskStatus = (task: Task) =>
    canManageProject || (profile?.role === UserRole.Employee && task.assignedTo.some((a) => a.id === profile.id));

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-gray-400">
          <Spinner size={16} />
          Loading...
        </div>
      </DashboardLayout>
    );
  }

  if (!project) {
    return (
      <DashboardLayout>
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {error || 'Project not found.'}
        </p>
      </DashboardLayout>
    );
  }

  const { badge, label } = statusStyles[project.status];

  return (
    <DashboardLayout>
      <button
        type="button"
        onClick={() => navigate('/projects')}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors"
      >
        <ChevronLeftIcon size={16} />
        Back to Projects
      </button>

      {error && (
        <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
      )}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-3.5 mb-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-lg font-semibold text-gray-900 truncate">{project.name}</h2>
              <span className={`shrink-0 text-[11px] font-medium px-2 py-0.5 rounded-full ${badge}`}>{label}</span>
            </div>
            {project.description && <p className="text-xs text-gray-500 mt-0.5 truncate">{project.description}</p>}

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs">
              <span className="text-gray-500">
                Manager: <span className="font-medium text-gray-800">{project.owner?.name ?? '—'}</span>
              </span>

              <div className="flex items-center gap-1.5">
                <span className="text-gray-500">Members:</span>
                {project.members.length > 0 ? (
                  <div className="flex items-center -space-x-1.5">
                    {project.members.map((member) => (
                      <Avatar
                        key={member.id}
                        name={member.name}
                        color={colorFromString(member.name)}
                        imageUrl={member.photoUrl}
                        size={20}
                        className="ring-2 ring-white"
                      />
                    ))}
                  </div>
                ) : (
                  <span className="text-gray-400">None</span>
                )}
              </div>

              {(project.startDate || project.dueDate) && (
                <span className="text-gray-400">
                  {project.startDate ? formatDate(project.startDate) : '—'} &rarr;{' '}
                  {project.dueDate ? formatDate(project.dueDate) : '—'}
                </span>
              )}
            </div>
          </div>
          {canManageProject && (
            <div className="flex gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(true)}
                className="bg-white text-gray-700 border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-semibold hover:bg-gray-50 transition-colors"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={handleDeleteProject}
                className="bg-white text-red-600 border border-red-200 rounded-lg px-3 py-1.5 text-xs font-semibold hover:bg-red-50 transition-colors"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Tasks</h3>
        {canManageProject && (
          <button
            type="button"
            onClick={() => setIsAddTaskModalOpen(true)}
            className="bg-indigo-600 text-white text-sm font-semibold rounded-lg px-4 py-2.5 shadow-sm hover:bg-indigo-500 transition-colors"
          >
            + Add Task
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {BOARD_COLUMNS.map((column) => {
          const columnTasks = tasks.filter((task) => task.status === column.status);
          return (
            <TaskColumn key={column.status} title={column.title} count={columnTasks.length}>
              {columnTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  canChangeStatus={canChangeTaskStatus(task)}
                  onStatusChange={(status) => handleTaskStatusChange(task.id, status)}
                />
              ))}
            </TaskColumn>
          );
        })}
      </div>

      <ProjectFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSaved={() => {
          setIsEditModalOpen(false);
          fetchProject();
        }}
        project={project}
      />

      <AddTaskModal
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
        onCreated={() => {
          setIsAddTaskModalOpen(false);
          fetchTasks();
        }}
        projectId={project.id}
        employeeOptions={employeeOptions}
      />
    </DashboardLayout>
  );
}

export default ProjectDetail;
