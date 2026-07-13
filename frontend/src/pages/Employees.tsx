import { useCallback, useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import PeopleTable from '../components/PeopleTable';
import AddEmployeeModal from '../components/AddEmployeeModal';
import { getEmployeeRequest, listEmployeesRequest, updateEmployeeRequest } from '../services/employeeService';
import { getApiErrorMessage } from '../utils/getApiErrorMessage';
import { colorFromString } from '../utils/avatarColor';
import { Employee, PaginationMeta, TeamMember } from '../types';

const PAGE_SIZE = 10;

const EMPTY_PAGINATION: PaginationMeta = { page: 1, limit: PAGE_SIZE, total: 0, totalPages: 1 };

const toTeamMember = (employee: Employee): TeamMember => ({
  id: employee.id,
  name: employee.name,
  email: employee.email,
  designation: employee.designation,
  photoUrl: employee.photoUrl,
  avatarColor: colorFromString(employee.name || employee.email),
  projects: [],
});

function Employees() {
  const [employees, setEmployees] = useState<TeamMember[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>(EMPTY_PAGINATION);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fresh load of page 1 — used on mount and whenever the search term changes.
  const fetchFirstPage = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const result = await listEmployeesRequest({ page: 1, limit: PAGE_SIZE, search: search || undefined });
      setEmployees(result.data.map(toTeamMember));
      setPagination(result.pagination);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to load employees.'));
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
      const result = await listEmployeesRequest({ page: nextPage, limit: PAGE_SIZE, search: search || undefined });
      setEmployees((prev) => [...prev, ...result.data.map(toTeamMember)]);
      setPagination(result.pagination);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to load more employees.'));
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleCreated = () => {
    setIsModalOpen(false);
    // New employees sort newest-first, so a fresh page-1 load surfaces it.
    fetchFirstPage();
  };

  const handleEditPerson = async (id: string, updates: { name: string; designation?: string }) => {
    const updated = await updateEmployeeRequest(id, updates);
    setEmployees((prev) =>
      prev.map((employee) =>
        employee.id === id ? { ...employee, name: updated.name, designation: updated.designation } : employee,
      ),
    );
  };

  const handleFetchProfile = (id: string) => getEmployeeRequest(id).then(toTeamMember);

  return (
    <DashboardLayout>
      {error && (
        <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
      )}
      <PeopleTable
        title="Employees"
        columnLabel="Employee"
        addButtonLabel="+ Add Employee"
        people={employees}
        showDesignation
        onAddClick={() => setIsModalOpen(true)}
        search={search}
        onSearchChange={setSearch}
        total={pagination.total}
        hasMore={pagination.page < pagination.totalPages}
        onLoadMore={handleLoadMore}
        isLoading={isLoading}
        isLoadingMore={isLoadingMore}
        onEditPerson={handleEditPerson}
        onFetchProfile={handleFetchProfile}
      />
      <AddEmployeeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onCreated={handleCreated} />
    </DashboardLayout>
  );
}

export default Employees;
