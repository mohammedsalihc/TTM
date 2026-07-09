import DashboardLayout from '../components/DashboardLayout';
import PeopleTable from '../components/PeopleTable';
import { TeamMember } from '../types';

const employees: TeamMember[] = [
  {
    id: 'u3',
    name: 'Eddie Employee',
    email: 'eddie@ttm.com',
    avatarColor: '#6366F1',
    projects: ['Website Revamp', 'Mobile App Launch'],
  },
  {
    id: 'u4',
    name: 'Nina Employee',
    email: 'nina@ttm.com',
    avatarColor: '#F59E0B',
    projects: ['Website Revamp'],
  },
  {
    id: 'u5',
    name: 'Sam Carter',
    email: 'sam.carter@ttm.com',
    avatarColor: '#10B981',
    projects: ['CRM Migration', 'Internal Tools Cleanup'],
  },
  {
    id: 'u6',
    name: 'Priya Nair',
    email: 'priya.nair@ttm.com',
    avatarColor: '#EF4444',
    projects: [],
  },
];

function Employees() {
  return (
    <DashboardLayout>
      <PeopleTable
        title="Employees"
        columnLabel="Employee"
        addButtonLabel="+ Add Employee"
        people={employees}
      />
    </DashboardLayout>
  );
}

export default Employees;
