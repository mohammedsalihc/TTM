import { useMemo, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import PeopleTable from '../components/PeopleTable';
import { managers } from '../data/managers';

const PAGE_SIZE = 10;

// Managers isn't wired to a real backend yet (only Employees is) — this
// mirrors client-side what the real integration will look like, so
// PeopleTable's now-required search/pagination props keep working.
function Managers() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return managers;
    return managers.filter(
      (manager) => manager.name.toLowerCase().includes(term) || manager.email.toLowerCase().includes(term),
    );
  }, [search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  return (
    <DashboardLayout>
      <PeopleTable
        title="Managers"
        columnLabel="Manager"
        addButtonLabel="+ Add Manager"
        people={pageItems}
        search={search}
        onSearchChange={handleSearchChange}
        page={page}
        totalPages={totalPages}
        total={filtered.length}
        onPageChange={setPage}
      />
    </DashboardLayout>
  );
}

export default Managers;
