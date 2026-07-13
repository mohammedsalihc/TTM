import { useEffect, useState } from 'react';
import Avatar from './Avatar';
import RowActions from './RowActions';
import Spinner from './Spinner';
import { MailIcon, SearchIcon, ChevronLeftIcon, ChevronRightIcon } from './icons';
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
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

// Shared table for any role that's just a paginated, searchable list of
// people (Employees, Managers). Pages own the actual data fetch (page,
// search, results) and pass it down — this component is purely
// presentational plus the debounce on the search input.
function PeopleTable({
  title,
  columnLabel,
  addButtonLabel,
  people,
  showDesignation = false,
  onAddClick,
  search,
  onSearchChange,
  page,
  totalPages,
  total,
  onPageChange,
  isLoading = false,
}: PeopleTableProps) {
  const [searchInput, setSearchInput] = useState(search);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchInput !== search) onSearchChange(searchInput);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  return (
    <>
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
              <th className="px-6 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
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
                    <RowActions />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="flex items-center gap-1 text-sm font-medium text-gray-600 rounded-lg px-3 py-2 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
          >
            <ChevronLeftIcon size={16} />
            Prev
          </button>
          <span className="text-sm text-gray-500">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="flex items-center gap-1 text-sm font-medium text-gray-600 rounded-lg px-3 py-2 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
          >
            Next
            <ChevronRightIcon size={16} />
          </button>
        </div>
      )}
    </>
  );
}

export default PeopleTable;
