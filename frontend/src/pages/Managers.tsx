import DashboardLayout from '../components/DashboardLayout';
import PeopleTable from '../components/PeopleTable';
import { TeamMember } from '../types';

const managers: TeamMember[] = [
  {
    id: 'u2',
    name: 'Mona Manager',
    email: 'manager@ttm.com',
    avatarColor: '#6366F1',
    projects: ['Website Revamp', 'Mobile App Launch'],
  },
  {
    id: 'u7',
    name: 'Derek Holt',
    email: 'derek.holt@ttm.com',
    avatarColor: '#10B981',
    projects: ['CRM Migration'],
  },
  {
    id: 'u8',
    name: 'Aisha Khan',
    email: 'aisha.khan@ttm.com',
    avatarColor: '#F59E0B',
    projects: ['Internal Tools Cleanup'],
  },
  {
    id: 'u9',
    name: 'Leo Fischer',
    email: 'leo.fischer@ttm.com',
    avatarColor: '#EF4444',
    projects: [],
  },
];

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
