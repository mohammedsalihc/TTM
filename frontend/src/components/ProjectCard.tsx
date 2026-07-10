import Avatar from './Avatar';
import RowActions from './RowActions';
import { statusStyles } from './projectStatusStyles';
import { Project } from '../types';

const avatarPalette = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#0EA5E9'];

interface ProjectCardProps {
  project: Project;
  onView?: (project: Project) => void;
}

// The card itself is the click target (cursor-pointer + hover shadow signal
// this). Row actions stop propagation so Assign/Edit/Delete don't also
// trigger onView.
function ProjectCard({ project, onView }: ProjectCardProps) {
  const { bar, badge } = statusStyles[project.status];
  const maxVisibleAvatars = 4;
  const visibleEmployees = project.employees.slice(0, maxVisibleAvatars);
  const extraCount = project.employees.length - visibleEmployees.length;

  return (
    <div
      onClick={() => onView?.(project)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onView?.(project);
        }
      }}
      role="button"
      tabIndex={0}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-shadow duration-200 cursor-pointer p-5 flex flex-col gap-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold text-gray-900 leading-snug">{project.name}</h3>
        <span className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${badge}`}>
          {project.status}
        </span>
      </div>

      <p className="text-sm text-gray-500 line-clamp-2">{project.description}</p>

      <div>
        <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
          <div className={`h-full rounded-full ${bar}`} style={{ width: `${project.percent}%` }} />
        </div>
        <p className="text-xs text-gray-500 mt-1.5">{project.percent}% complete</p>
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-gray-100 -mx-5 px-5 pt-3">
        <div className="min-w-0">
          <p className="text-xs text-gray-400">Manager</p>
          <p className="text-sm font-medium text-gray-800 truncate">{project.manager}</p>
        </div>

        <div className="flex items-center -space-x-2">
          {visibleEmployees.map((name, index) => (
            <Avatar
              key={name}
              name={name}
              color={avatarPalette[index % avatarPalette.length]}
              size={28}
              className="ring-2 ring-white"
            />
          ))}
          {extraCount > 0 && (
            <div className="w-7 h-7 rounded-full bg-gray-100 text-gray-600 text-[11px] font-semibold flex items-center justify-center ring-2 ring-white">
              +{extraCount}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400">Due {project.deadline}</p>
        <div onClick={(e) => e.stopPropagation()}>
          <RowActions />
        </div>
      </div>
    </div>
  );
}

export default ProjectCard;
