import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import Avatar from '../components/Avatar';
import Spinner from '../components/Spinner';
import TaskColumn from '../components/TaskColumn';
import TaskCard from '../components/TaskCard';
import AddTaskModal from '../components/AddTaskModal';
import TaskDetailModal from '../components/TaskDetailModal';
import ProjectFormModal from '../components/ProjectFormModal';
import MultiSelectDropdown from '../components/MultiSelectDropdown';
import { ChevronLeftIcon, SearchIcon, SettingsIcon, PlusIcon } from '../components/icons';
import { getProjectRequest, updateProjectRequest, deleteProjectRequest } from '../services/projectService';
import { listTasksRequest, updateTaskStatusRequest } from '../services/taskService';
import { usePeopleDirectory } from '../hooks/usePeopleDirectory';
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
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (!isSettingsOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (settingsRef.current?.contains(e.target as Node)) return;
      setIsSettingsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSettingsOpen]);

  // Same ownership rule the backend enforces: Admin always, a Manager only
  // if they own this project and still hold the permission.
  const canManageProject =
    !!project &&
    !!profile &&
    (profile.role === UserRole.Admin ||
      (profile.role === UserRole.Manager && profile.canManageProjects === true && project.owner?.id === profile.id));

  // Business-wide employee directory (not just this project's current
  // members) — needed for the add/remove members picker. Only fetched once
  // the viewer can actually manage the project.
  const { employees: allEmployees } = usePeopleDirectory(canManageProject);

  const employeeOptions = (project?.members ?? []).filter((member) => member.role === UserRole.Employee);

  const handleMembersChange = async (memberIds: string[]) => {
    if (!project) return;
    try {
      const updated = await updateProjectRequest(project.id, { memberIds });
      setProject(updated);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to update project members.'));
    }
  };

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

  const filteredTasks = tasks.filter(
    (task) => !searchTerm || task.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );

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

      <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-gray-900 truncate">{project.name}</h2>
          {project.dueDate && <p className="text-xs text-gray-500 mt-1">Due {formatDate(project.dueDate)}</p>}
        </div>
        {canManageProject && (
          <div className="relative shrink-0" ref={settingsRef}>
            <button
              type="button"
              onClick={() => setIsSettingsOpen((prev) => !prev)}
              aria-label="Project settings"
              title="Project settings"
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
            >
              <SettingsIcon size={16} />
            </button>
            {isSettingsOpen && (
              <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-xl border border-gray-100 shadow-xl py-1.5 z-20">
                <button
                  type="button"
                  onClick={() => {
                    setIsSettingsOpen(false);
                    setIsEditModalOpen(true);
                  }}
                  className="w-full text-left px-3.5 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Edit project
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsSettingsOpen(false);
                    handleDeleteProject();
                  }}
                  className="w-full text-left px-3.5 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  Delete project
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 mb-5">
        {project.members.length > 0 && (
          <div className="flex items-center -space-x-2">
            {project.members.slice(0, 6).map((member) => (
              <Avatar
                key={member.id}
                name={member.name}
                color={colorFromString(member.name)}
                imageUrl={member.photoUrl}
                size={28}
                className="ring-2 ring-white"
              />
            ))}
            {project.members.length > 6 && (
              <div className="w-7 h-7 rounded-full bg-gray-100 text-gray-600 text-[10px] font-semibold flex items-center justify-center ring-2 ring-white">
                +{project.members.length - 6}
              </div>
            )}
          </div>
        )}
        {canManageProject && (
          <MultiSelectDropdown
            options={allEmployees.map((employee) => ({ id: employee.id, name: employee.name }))}
            selectedIds={employeeOptions.map((member) => member.id)}
            onChange={handleMembersChange}
            emptyMessage="No employees yet."
            renderTrigger={({ onClick }) => (
              <button
                type="button"
                onClick={onClick}
                aria-label="Add or remove members"
                title="Add or remove members"
                className="w-7 h-7 rounded-full border border-dashed border-gray-300 text-gray-400 flex items-center justify-center hover:border-indigo-400 hover:text-indigo-500 transition-colors"
              >
                <PlusIcon size={14} />
              </button>
            )}
          />
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400" aria-hidden="true">
            <SearchIcon size={14} />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search tasks..."
            aria-label="Search tasks"
            className="w-52 rounded-lg border border-gray-200 bg-white pl-9 pr-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          />
        </div>
        {canManageProject && (
          <button
            type="button"
            onClick={() => setIsAddTaskModalOpen(true)}
            className="bg-indigo-600 text-white text-sm font-semibold rounded-lg px-4 py-2.5 shadow-sm hover:bg-indigo-500 transition-colors"
          >
            + New Task
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {BOARD_COLUMNS.map((column) => {
          const columnTasks = filteredTasks.filter((task) => task.status === column.status);
          return (
            <TaskColumn key={column.status} status={column.status} title={column.title} count={columnTasks.length}>
              {columnTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onClick={setSelectedTask}
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

      <TaskDetailModal
        isOpen={selectedTask !== null}
        onClose={() => setSelectedTask(null)}
        task={selectedTask}
        onUpdated={(updated) => {
          setTasks((prev) => prev.map((task) => (task.id === updated.id ? updated : task)));
          setSelectedTask(updated);
        }}
        onDeleted={(taskId) => {
          setTasks((prev) => prev.filter((task) => task.id !== taskId));
          setSelectedTask(null);
        }}
        canEdit={canManageProject}
        canChangeStatus={selectedTask ? canChangeTaskStatus(selectedTask) : false}
        employeeOptions={employeeOptions}
      />
    </DashboardLayout>
  );
}

export default ProjectDetail;
