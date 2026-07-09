const iconProps = {
  width: 16,
  height: 16,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

// Feather Icons (MIT) — "user-plus", "edit-2", "trash-2".
// Using known-good icon paths instead of hand-drawn ones so the
// glyphs are guaranteed centered/proportional in the viewBox.
const AssignTaskIcon = () => (
  <svg {...iconProps} aria-hidden="true">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="8.5" cy="7" r="4" />
    <line x1="20" y1="8" x2="20" y2="14" />
    <line x1="23" y1="11" x2="17" y2="11" />
  </svg>
);

const EditIcon = () => (
  <svg {...iconProps} aria-hidden="true">
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
  </svg>
);

const DeleteIcon = () => (
  <svg {...iconProps} aria-hidden="true">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

interface RowActionsProps {
  onAssignTask?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const actionButtonClass =
  'w-8 h-8 flex items-center justify-center rounded-full transition-all duration-150 hover:scale-110 active:scale-95';

// Buttons are visual-only placeholders for now — wired up once
// task assignment and user CRUD have somewhere real to submit to.
function RowActions({ onAssignTask, onEdit, onDelete }: RowActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onAssignTask}
        title="Assign task"
        aria-label="Assign task"
        className={`${actionButtonClass} bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white hover:shadow-md hover:shadow-indigo-200`}
      >
        <AssignTaskIcon />
      </button>
      <button
        type="button"
        onClick={onEdit}
        title="Edit"
        aria-label="Edit"
        className={`${actionButtonClass} bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white hover:shadow-md hover:shadow-amber-200`}
      >
        <EditIcon />
      </button>
      <button
        type="button"
        onClick={onDelete}
        title="Delete"
        aria-label="Delete"
        className={`${actionButtonClass} bg-red-50 text-red-600 hover:bg-red-600 hover:text-white hover:shadow-md hover:shadow-red-200`}
      >
        <DeleteIcon />
      </button>
    </div>
  );
}

export default RowActions;
