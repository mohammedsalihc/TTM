// Filled/solid icons, defined locally (not the shared outline EyeIcon/EditIcon
// from ./icons, which are used elsewhere as thin outlines — e.g. the
// password show/hide toggle and Profile.tsx's inline edit affordance).
const ViewIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zm0 12.5c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8a3 3 0 100 6 3 3 0 000-6z" />
  </svg>
);

const EditIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
  </svg>
);

const DeleteIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
  </svg>
);

interface RowActionsProps {
  onViewProfile?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const actionButtonClass =
  'w-10 h-8 flex items-center justify-center rounded-lg transition-all duration-150 hover:scale-110 active:scale-95';

function RowActions({ onViewProfile, onEdit, onDelete }: RowActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onViewProfile}
        title="View profile"
        aria-label="View profile"
        className={`${actionButtonClass} bg-indigo-50 border border-indigo-200 text-indigo-600 hover:bg-indigo-600 hover:border-indigo-600 hover:text-white hover:shadow-md hover:shadow-indigo-200`}
      >
        <ViewIcon />
      </button>
      <button
        type="button"
        onClick={onEdit}
        title="Edit"
        aria-label="Edit"
        className={`${actionButtonClass} bg-amber-50 border border-amber-200 text-amber-600 hover:bg-amber-500 hover:border-amber-500 hover:text-white hover:shadow-md hover:shadow-amber-200`}
      >
        <EditIcon />
      </button>
      <button
        type="button"
        onClick={onDelete}
        title="Delete"
        aria-label="Delete"
        className={`${actionButtonClass} bg-red-50 border border-red-200 text-red-600 hover:bg-red-600 hover:border-red-600 hover:text-white hover:shadow-md hover:shadow-red-200`}
      >
        <DeleteIcon />
      </button>
    </div>
  );
}

export default RowActions;
