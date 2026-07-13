import { useCallback, useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import PeopleTable from '../components/PeopleTable';
import AddEmployeeModal from '../components/AddEmployeeModal';
import { listEmployeesRequest } from '../services/employeeService';
import { getApiErrorMessage } from '../utils/getApiErrorMessage';
import { colorFromString } from '../utils/avatarColor';
import { PaginationMeta, TeamMember } from '../types';

const PAGE_SIZE = 10;

const EMPTY_PAGINATION: PaginationMeta = { page: 1, limit: PAGE_SIZE, total: 0, totalPages: 1 };

function Employees() {
  const [employees, setEmployees] = useState<TeamMember[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>(EMPTY_PAGINATION);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchEmployees = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const result = await listEmployeesRequest({ page, limit: PAGE_SIZE, search: search || undefined });
      setEmployees(
        result.data.map((employee) => ({
          id: employee.id,
          name: employee.name,
          email: employee.email,
          designation: employee.designation,
          photoUrl: employee.photoUrl,
          avatarColor: colorFromString(employee.name || employee.email),
          projects: [],
        })),
      );
      setPagination(result.pagination);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to load employees.'));
    } finally {
      setIsLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleCreated = () => {
    setIsModalOpen(false);
    // New employees sort newest-first, so page 1 is where it'll show up.
    if (page === 1) {
      fetchEmployees();
    } else {
      setPage(1);
    }
  };

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
        onSearchChange={handleSearchChange}
        page={pagination.page}
        totalPages={pagination.totalPages}
        total={pagination.total}
        onPageChange={setPage}
        isLoading={isLoading}
      />
      <AddEmployeeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onCreated={handleCreated} />
    </DashboardLayout>
  );
}

export default Employees;
