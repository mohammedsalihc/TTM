import * as XLSX from 'xlsx';
import { listEmployeesRequest } from '../services/employeeService';
import { listManagersRequest } from '../services/managerService';
import { listProjectsRequest } from '../services/projectService';

// 100 is the backend's hard cap on `limit` (paginationQuerySchema) — same
// constraint usePeopleDirectory works around, so a business with more
// employees/managers/projects than that would need real pagination here.
const REPORT_PAGE_SIZE = 100;

export async function exportFullReport() {
  const [employeesRes, managersRes, projectsRes] = await Promise.all([
    listEmployeesRequest({ page: 1, limit: REPORT_PAGE_SIZE }),
    listManagersRequest({ page: 1, limit: REPORT_PAGE_SIZE }),
    listProjectsRequest({ page: 1, limit: REPORT_PAGE_SIZE }),
  ]);

  const users = [
    ...employeesRes.data.map((e) => ({
      Name: e.name,
      Email: e.email,
      Role: 'Employee',
      Designation: e.designation ?? '',
    })),
    ...managersRes.data.map((m) => ({
      Name: m.name,
      Email: m.email,
      Role: 'Manager',
      Designation: '',
    })),
  ];

  const projectRows = projectsRes.data.map((p) => ({
    Name: p.name,
    Manager: p.owner?.name ?? '',
    Members: p.members.map((member) => member.name).join(', '),
    'Start Date': p.startDate ?? '',
    'Due Date': p.dueDate ?? '',
  }));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(users), 'Users');
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(projectRows), 'Projects');

  XLSX.writeFile(workbook, 'ttm-full-report.xlsx');
}
