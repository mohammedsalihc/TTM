import { useEffect, useRef, useState } from 'react';
import Avatar from './Avatar';
import RowActions from './RowActions';
import Spinner from './Spinner';
import ViewProfileModal from './ViewProfileModal';
import EditProfileModal from './EditProfileModal';
import { MailIcon, SearchIcon } from './icons';
import { TeamMember } from '../types';

const SEARCH_DEBOUNCE_MS = 400;

interface PeopleTableProps {
  title: string;
  columnLabel: string;
  addButtonLabel: string;
  people: TeamMember[];
  showDesignation?: boolean;
  onAddClick?: () => void;
  search: string;
  onSearchChange: (value: string) => void;
  total: number;
  hasMore: boolean;
  onLoadMore: () => void;
  isLoading?: boolean;
  isLoadingMore?: boolean;
  onEditPerson?: (id: string, updates: { name: string; designation?: string }) => Promise<void>;
  onFetchProfile?: (id: string) => Promise<TeamMember>;
}

// Shared table for any role that's just a searchable list of people
// (Employees, Managers). Pages own the actual data fetch (search, results,
// paging) and pass it down — this component is purely presentational plus
// the debounce on the search input and the scroll-triggered "load more".
function PeopleTable({
  title,
  columnLabel,
  addButtonLabel,
  people,
  showDesignation = false,
  onAddClick,
  search,
  onSearchChange,
  total,
  hasMore,
  onLoadMore,
  isLoading = false,
  isLoadingMore = false,
  onEditPerson,
  onFetchProfile,
}: PeopleTableProps) {
  const [searchInput, setSearchInput] = useState(search);
  const [viewingPerson, setViewingPerson] = useState<TeamMember | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<TeamMember | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchInput !== search) onSearchChange(searchInput);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  // Fetch the next 10 automatically once the sentinel below the table
  // scrolls near the viewport — no Prev/Next buttons needed.
  useEffect(() => {
    if (!hasMore) return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) onLoadMore();
      },
      { rootMargin: '200px' },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, onLoadMore]);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6 gap-3">
        <div className="min-w-0">
          <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-500 mt-0.5">{total} team members</p>
        </div>
        <button
          type="button"
          onClick={onAddClick}
          className="shrink-0 bg-indigo-600 text-white text-sm font-semibold rounded-lg px-4 py-2.5 shadow-sm hover:bg-indigo-500 transition-colors"
        >
          {addButtonLabel}
        </button>
      </div>

      <div className="relative mb-4 max-w-sm">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400" aria-hidden="true">
          <SearchIcon size={16} />
        </span>
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder={`Search ${columnLabel.toLowerCase()}s`}
          aria-label={`Search ${columnLabel.toLowerCase()}s`}
          className="w-full rounded-lg border border-gray-200 bg-white pl-10 pr-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-md overflow-x-auto">
        <table
          className={`w-full text-left border-collapse table-fixed ${
            showDesignation ? 'min-w-[860px]' : 'min-w-[720px]'
          }`}
        >
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-100">
              <th className="w-1/5 px-6 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                {columnLabel}
              </th>
              {showDesignation && (
                <th className="w-1/6 px-6 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  Designation
                </th>
              )}
              <th className="w-1/5 px-6 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                Email
              </th>
              <th className="w-1/4 px-6 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                Projects
              </th>
              <th className="w-32 px-6 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              <tr>
                <td colSpan={showDesignation ? 5 : 4} className="px-6 py-10 text-center text-sm text-gray-400">
                  <div className="flex items-center justify-center gap-2">
                    <Spinner size={16} />
                    Loading...
                  </div>
                </td>
              </tr>
            ) : people.length === 0 ? (
              <tr>
                <td
                  colSpan={showDesignation ? 5 : 4}
                  className="px-6 py-10 text-center text-sm text-gray-400 italic"
                >
                  {search ? `No ${columnLabel.toLowerCase()}s match "${search}"` : `No ${columnLabel.toLowerCase()}s yet`}
                </td>
              </tr>
            ) : (
              people.map((person) => (
                <tr key={person.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="ring-2 ring-white rounded-full shadow-sm">
                        <Avatar name={person.name} color={person.avatarColor} imageUrl={person.photoUrl} />
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{person.name}</span>
                    </div>
                  </td>
                  {showDesignation && (
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{person.designation ?? '—'}</span>
                    </td>
                  )}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span className="text-gray-400">
                        <MailIcon />
                      </span>
                      {person.email}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      {person.projects.length > 0 ? (
                        person.projects.map((project) => (
                          <span
                            key={project}
                            className="text-xs font-medium px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100"
                          >
                            {project}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400 italic">No projects assigned</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <RowActions
                      onViewProfile={() => {
                        setViewingPerson(person);
                        setIsViewModalOpen(true);
                      }}
                      onEdit={() => {
                        setEditingPerson(person);
                        setIsEditModalOpen(true);
                      }}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {hasMore && (
        <div ref={sentinelRef} className="flex items-center justify-center py-5">
          {isLoadingMore && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Spinner size={16} />
              Loading more...
            </div>
          )}
        </div>
      )}

      <ViewProfileModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        person={viewingPerson}
        onRefresh={onFetchProfile}
      />

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        person={editingPerson}
        onSave={async (updates) => {
          if (editingPerson) await onEditPerson?.(editingPerson.id, updates);
        }}
      />
    </div>
  );
}

export default PeopleTable;
