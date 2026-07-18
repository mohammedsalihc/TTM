import Avatar from './Avatar';
import { Project } from '../types';
import { colorFromString } from '../utils/avatarColor';

interface ProjectCardProps {
  project: Project;
  onView?: (project: Project) => void;
}

const formatDate = (iso: string) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

// The card itself is the click target (cursor-pointer + hover shadow signal
// this) — edit/delete live on the project detail page's settings menu, not
// here, so there's no separate row of action icons to wire up or stop
// propagation for. No progress bar either — the real backend has no percent
// field, and computing one would mean a task-count query per card; a
// completion indicator belongs on the detail page instead, where tasks are
// loaded. Owner/members come pre-populated (name+photo) straight from the
// backend (Mongoose .populate()) — no separate id→name lookup needed here.
function ProjectCard({ project, onView }: ProjectCardProps) {
  const maxVisibleAvatars = 4;
  const visibleMembers = project.members.slice(0, maxVisibleAvatars);
  const extraCount = project.members.length - visibleMembers.length;

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
      <h3 className="text-base font-semibold text-gray-900 leading-snug">{project.name}</h3>

      <p className="text-sm text-gray-500 line-clamp-2">{project.description || 'No description yet.'}</p>

      <div className="flex items-center justify-between pt-1 border-t border-gray-100 -mx-5 px-5 pt-3">
        <div className="min-w-0">
          <p className="text-xs text-gray-400">Manager</p>
          <p className="text-sm font-medium text-gray-800 truncate">{project.owner?.name ?? '—'}</p>
        </div>

        <div className="flex items-center -space-x-2">
          {visibleMembers.map((member) => (
            <Avatar
              key={member.id}
              name={member.name}
              color={colorFromString(member.name)}
              imageUrl={member.photoUrl}
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

      <p className="text-xs text-gray-400">{project.dueDate ? `Due ${formatDate(project.dueDate)}` : 'No due date'}</p>
    </div>
  );
}

export default ProjectCard;
