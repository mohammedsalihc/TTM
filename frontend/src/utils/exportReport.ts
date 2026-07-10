import * as XLSX from 'xlsx';
import { employees } from '../data/employees';
import { managers } from '../data/managers';
import { projects } from '../data/projects';

export function exportFullReport() {
  const users = [
    ...employees.map((e) => ({
      Name: e.name,
      Email: e.email,
      Role: 'Employee',
      Designation: e.designation ?? '',
      Projects: e.projects.join(', '),
    })),
    ...managers.map((m) => ({
      Name: m.name,
      Email: m.email,
      Role: 'Manager',
      Designation: '',
      Projects: m.projects.join(', '),
    })),
  ];

  const projectRows = projects.map((p) => ({
    Name: p.name,
    Manager: p.manager,
    Status: p.status,
    'Percent Complete': p.percent,
    Deadline: p.deadline,
    Employees: p.employees.join(', '),
  }));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(users), 'Users');
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(projectRows), 'Projects');

  XLSX.writeFile(workbook, 'ttm-full-report.xlsx');
}
