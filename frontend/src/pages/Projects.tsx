import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import ProjectCard from '../components/ProjectCard';
import ProjectFormModal from '../components/ProjectFormModal';
import Spinner from '../components/Spinner';
import { SearchIcon } from '../components/icons';
import {
  deleteProjectRequest,
  listProjectsRequest,
} from '../services/projectService';
import { getApiErrorMessage } from '../utils/getApiErrorMessage';
import { useAuth } from '../context/AuthContext';
import { Project, PaginationMeta, UserRole } from '../types';

const PAGE_SIZE = 12;
const SEARCH_DEBOUNCE_MS = 400;

const EMPTY_PAGINATION: PaginationMeta = { page: 1, limit: PAGE_SIZE, total: 0, totalPages: 1 };

function Projects() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>(EMPTY_PAGINATION);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Only Admin or a Manager with the canManageProjects permission may
  // create a project — same gate the backend enforces server-side.
  const canCreateProject = profile?.role === UserRole.Admin || profile?.canManageProjects === true;

  const fetchFirstPage = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const result = await listProjectsRequest({ page: 1, limit: PAGE_SIZE, search: search || undefined });
      setProjects(result.data);
      setPagination(result.pagination);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to load projects.'));
    } finally {
      setIsLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchFirstPage();
  }, [fetchFirstPage]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchInput !== search) setSearch(searchInput);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const hasMore = pagination.page < pagination.totalPages;

  const handleLoadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    try {
      const nextPage = pagination.page + 1;
      const result = await listProjectsRequest({ page: nextPage, limit: PAGE_SIZE, search: search || undefined });
      setProjects((prev) => [...prev, ...result.data]);
      setPagination(result.pagination);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to load more projects.'));
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMore, pagination.page, search]);

  // Fetch the next page automatically once the sentinel below the grid
  // scrolls near the viewport — same pattern as PeopleTable, no Prev/Next.
  useEffect(() => {
    if (!hasMore) return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) handleLoadMore();
      },
      { rootMargin: '200px' },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, handleLoadMore]);

  const handleSaved = () => {
    setIsModalOpen(false);
    // New projects sort newest-first, so a fresh page-1 load surfaces it.
    fetchFirstPage();
  };

  const handleDelete = async (project: Project) => {
    if (!window.confirm(`Delete "${project.name}"? This cannot be undone.`)) return;
    try {
      await deleteProjectRequest(project.id);
      setProjects((prev) => prev.filter((p) => p.id !== project.id));
      setPagination((prev) => ({ ...prev, total: Math.max(0, prev.total - 1) }));
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to delete project.'));
    }
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6 gap-3">
        <div className="min-w-0">
          <h2 className="text-2xl font-semibold text-gray-900">Projects</h2>
          <p className="text-sm text-gray-500 mt-0.5">{pagination.total} projects</p>
        </div>
        {canCreateProject && (
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="shrink-0 bg-indigo-600 text-white text-sm font-semibold rounded-lg px-4 py-2.5 shadow-sm hover:bg-indigo-500 transition-colors"
          >
            + Add Project
          </button>
        )}
      </div>

      <div className="relative mb-5 max-w-sm">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400" aria-hidden="true">
          <SearchIcon size={16} />
        </span>
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search projects"
          aria-label="Search projects"
          className="w-full rounded-lg border border-gray-200 bg-white pl-10 pr-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
        />
      </div>

      {error && (
        <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-gray-400">
          <Spinner size={16} />
          Loading...
        </div>
      ) : projects.length === 0 ? (
        <p className="text-center text-sm text-gray-400 italic py-16">
          {search ? `No projects match "${search}"` : 'No projects yet'}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onView={(p) => navigate(`/projects/${p.id}`)}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

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

      <ProjectFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSaved={handleSaved} />
    </DashboardLayout>
  );
}

export default Projects;
