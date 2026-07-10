import DashboardLayout from '../components/DashboardLayout';
import PeopleTable from '../components/PeopleTable';
import { managers } from '../data/managers';

function Managers() {
  return (
    <DashboardLayout>
      <PeopleTable
        title="Managers"
        columnLabel="Manager"
        addButtonLabel="+ Add Manager"
        people={managers}
      />
    </DashboardLayout>
  );
}

export default Managers;
