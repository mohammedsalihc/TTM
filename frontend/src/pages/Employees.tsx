import DashboardLayout from '../components/DashboardLayout';
import PeopleTable from '../components/PeopleTable';
import { employees } from '../data/employees';

function Employees() {
  return (
    <DashboardLayout>
      <PeopleTable
        title="Employees"
        columnLabel="Employee"
        addButtonLabel="+ Add Employee"
        people={employees}
        showDesignation
      />
    </DashboardLayout>
  );
}

export default Employees;
