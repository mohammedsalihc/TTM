import { useMemo, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import PeopleTable from '../components/PeopleTable';
import { managers as initialManagers } from '../data/managers';

const PAGE_SIZE = 10;

// Managers isn't wired to a real backend yet (only Employees is) — this
// mirrors client-side what the real integration will look like, so
// PeopleTable's search/infinite-scroll/edit props keep working.
function Managers() {
  const [managers, setManagers] = useState(initialManagers);
  const [search, setSearch] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return managers;
    return managers.filter(
      (manager) => manager.name.toLowerCase().includes(term) || manager.email.toLowerCase().includes(term),
    );
  }, [managers, search]);

  const visibleItems = filtered.slice(0, visibleCount);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setVisibleCount(PAGE_SIZE);
  };

  // eslint-disable-next-line @typescript-eslint/require-await -- matches
  // PeopleTable's async onEditPerson contract; no real API to await yet.
  const handleEditPerson = async (id: string, updates: { name: string; designation?: string }) => {
    setManagers((prev) =>
      prev.map((manager) => (manager.id === id ? { ...manager, name: updates.name, designation: updates.designation } : manager)),
    );
  };

  return (
    <DashboardLayout>
      <PeopleTable
        title="Managers"
        columnLabel="Manager"
        addButtonLabel="+ Add Manager"
        people={visibleItems}
        search={search}
        onSearchChange={handleSearchChange}
        total={filtered.length}
        hasMore={visibleCount < filtered.length}
        onLoadMore={() => setVisibleCount((count) => count + PAGE_SIZE)}
        onEditPerson={handleEditPerson}
      />
    </DashboardLayout>
  );
}

export default Managers;
