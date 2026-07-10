import Avatar from './Avatar';
import RowActions from './RowActions';
import { MailIcon } from './icons';
import { TeamMember } from '../types';

interface PeopleTableProps {
  title: string;
  columnLabel: string;
  addButtonLabel: string;
  people: TeamMember[];
  showDesignation?: boolean;
}

// Shared table for any role that's just a list of people + their assigned
// projects (Employees, Managers). Pages differ only in title/labels/data,
// plus an optional Designation column (used by Employees only, for now).
function PeopleTable({
  title,
  columnLabel,
  addButtonLabel,
  people,
  showDesignation = false,
}: PeopleTableProps) {
  return (
    <>
      <div className="flex items-center justify-between mb-6 gap-3">
        <div className="min-w-0">
          <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-500 mt-0.5">{people.length} team members</p>
        </div>
        <button
          type="button"
          className="shrink-0 bg-indigo-600 text-white text-sm font-semibold rounded-lg px-4 py-2.5 shadow-sm hover:bg-indigo-500 transition-colors"
        >
          {addButtonLabel}
        </button>
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
            {people.map((person) => (
              <tr key={person.id} className="hover:bg-gray-50/60 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="ring-2 ring-white rounded-full shadow-sm">
                      <Avatar name={person.name} color={person.avatarColor} />
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
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default PeopleTable;
