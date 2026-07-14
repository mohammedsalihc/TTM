import { useCallback, useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import PeopleTable from '../components/PeopleTable';
import AddPersonModal from '../components/AddPersonModal';
import { listManagersRequest, updateManagerRequest } from '../services/managerService';
import { getApiErrorMessage } from '../utils/getApiErrorMessage';
import { colorFromString } from '../utils/avatarColor';
import { Manager, PaginationMeta, TeamMember } from '../types';

const PAGE_SIZE = 10;

const EMPTY_PAGINATION: PaginationMeta = { page: 1, limit: PAGE_SIZE, total: 0, totalPages: 1 };

const toTeamMember = (manager: Manager): TeamMember => ({
  id: manager.id,
  name: manager.name,
  email: manager.email,
  photoUrl: manager.photoUrl,
  avatarColor: colorFromString(manager.name || manager.email),
  projects: [],
  canManageProjects: manager.canManageProjects,
  canManageEmployees: manager.canManageEmployees,
});

function Managers() {
  const [managers, setManagers] = useState<TeamMember[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>(EMPTY_PAGINATION);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchFirstPage = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const result = await listManagersRequest({ page: 1, limit: PAGE_SIZE, search: search || undefined });
      setManagers(result.data.map(toTeamMember));
      setPagination(result.pagination);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to load managers.'));
    } finally {
      setIsLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchFirstPage();
  }, [fetchFirstPage]);

  const handleLoadMore = async () => {
    if (isLoadingMore || pagination.page >= pagination.totalPages) return;
    setIsLoadingMore(true);
    try {
      const nextPage = pagination.page + 1;
      const result = await listManagersRequest({ page: nextPage, limit: PAGE_SIZE, search: search || undefined });
      setManagers((prev) => [...prev, ...result.data.map(toTeamMember)]);
      setPagination(result.pagination);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to load more managers.'));
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleCreated = () => {
    setIsModalOpen(false);
    // New managers sort newest-first, so a fresh page-1 load surfaces it.
    fetchFirstPage();
  };

  const handleEditPerson = async (
    id: string,
    updates: { name: string; photoUrl?: string; canManageProjects?: boolean; canManageEmployees?: boolean },
  ) => {
    const updated = await updateManagerRequest(id, updates);
    setManagers((prev) =>
      prev.map((manager) =>
        manager.id === id
          ? {
              ...manager,
              name: updated.name,
              photoUrl: updated.photoUrl,
              canManageProjects: updated.canManageProjects,
              canManageEmployees: updated.canManageEmployees,
            }
          : manager,
      ),
    );
  };

  return (
    <DashboardLayout>
      {error && (
        <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
      )}
      <PeopleTable
        title="Managers"
        columnLabel="Manager"
        addButtonLabel="+ Add Manager"
        people={managers}
        showPermissionToggles
        onAddClick={() => setIsModalOpen(true)}
        search={search}
        onSearchChange={setSearch}
        total={pagination.total}
        hasMore={pagination.page < pagination.totalPages}
        onLoadMore={handleLoadMore}
        isLoading={isLoading}
        isLoadingMore={isLoadingMore}
        onEditPerson={handleEditPerson}
      />
      <AddPersonModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onCreated={handleCreated} role="manager" />
    </DashboardLayout>
  );
}

export default Managers;
