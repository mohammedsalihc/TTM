import { useEffect, useState } from 'react';
import Spinner from './Spinner';
import { listProjectActivityRequest } from '../services/activityLogService';
import { getApiErrorMessage } from '../utils/getApiErrorMessage';
import { ActivityLogEntry, PaginationMeta } from '../types';

interface ProjectActivityProps {
  projectId: string;
}

const PAGE_SIZE = 15;
const EMPTY_PAGINATION: PaginationMeta = { page: 1, limit: PAGE_SIZE, total: 0, totalPages: 1 };

const formatTimestamp = (iso: string) =>
  new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

// Simple newest-first feed with a "Load more" button — same pagination
// contract as everywhere else (PaginationMeta), just a lighter-weight UI
// than the auto-load-on-scroll pattern PeopleTable/Projects.tsx use, since
// this is a secondary tab, not the page's primary content.
function ProjectActivity({ projectId }: ProjectActivityProps) {
  const [entries, setEntries] = useState<ActivityLogEntry[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>(EMPTY_PAGINATION);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError('');
    listProjectActivityRequest(projectId, { page: 1, limit: PAGE_SIZE })
      .then((res) => {
        if (cancelled) return;
        setEntries(res.data);
        setPagination(res.pagination);
      })
      .catch((err) => {
        if (!cancelled) setError(getApiErrorMessage(err, 'Unable to load activity.'));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const hasMore = pagination.page < pagination.totalPages;

  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    try {
      const nextPage = pagination.page + 1;
      const res = await listProjectActivityRequest(projectId, { page: nextPage, limit: PAGE_SIZE });
      setEntries((prev) => [...prev, ...res.data]);
      setPagination(res.pagination);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to load more activity.'));
    } finally {
      setIsLoadingMore(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-12 text-sm text-gray-400">
        <Spinner size={16} />
        Loading...
      </div>
    );
  }

  return (
    <div>
      {error && (
        <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
      )}

      {entries.length === 0 ? (
        <p className="text-sm text-gray-400 italic text-center py-12">No activity yet</p>
      ) : (
        <ul className="space-y-4">
          {entries.map((entry) => (
            <li key={entry.id} className="flex gap-3">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
              <div className="min-w-0">
                <p className="text-sm text-gray-700">{entry.message}</p>
                <p className="text-xs text-gray-400 mt-0.5">{formatTimestamp(entry.createdAt)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {hasMore && (
        <div className="flex justify-center pt-4">
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoadingMore && <Spinner size={14} />}
            {isLoadingMore ? 'Loading...' : 'Load more'}
          </button>
        </div>
      )}
    </div>
  );
}

export default ProjectActivity;
