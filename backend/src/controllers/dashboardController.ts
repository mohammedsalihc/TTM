import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { ControllerHandler } from '../utils/ControllerHandler';
import { UserModel } from '../models/User';
import { ProjectModel } from '../models/Project';
import { TaskModel } from '../models/Task';
import { UserRole } from '../types';
import { dashboardChartsQuerySchema } from '../validators/dashboard.validators';
import { asyncHandler } from '../utils/asyncHandler';

interface MonthlyAggRow {
  _id: { year: number; month: number };
  count: number;
}

// Oldest-first skeleton for the last `months` months (including the current
// one) — every month shows up even with zero records, and the key format
// matches $year/$month's 1-indexed month so aggregation rows can be merged
// straight in.
function buildMonthSkeleton(months: number) {
  const now = new Date();
  return Array.from({ length: months }, (_, i) => {
    const offset = months - 1 - i;
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    return { key: `${date.getFullYear()}-${date.getMonth() + 1}`, label: date.toLocaleDateString('en-US', { month: 'short' }) };
  });
}

function toCountMap(rows: MonthlyAggRow[]): Map<string, number> {
  return new Map(rows.map((row) => [`${row._id.year}-${row._id.month}`, row.count]));
}

// First day of the oldest month in the `months`-sized window (including the
// current month) — the $match lower bound for both aggregations below.
function getRangeStart(months: number): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);
}

class DashboardController extends ControllerHandler {
  // Aggregate counts only — never exposes the underlying employee/manager
  // records themselves, so (unlike GET /api/employees and /api/managers)
  // this is safe to open to every authenticated role, not just Admin.
  stats = asyncHandler(async (req: Request, res: Response) => {
    const businessId = req.businessId!;

    // Same visibility rules as the list endpoints these counts stand in
    // for: an Employee only sees their own assigned tasks and the projects
    // they're a member of; Admin/Manager see the whole business.
    const taskFilter: Record<string, unknown> = { businessId };
    const projectFilter: Record<string, unknown> = { businessId };
    if (req.role === UserRole.Employee) {
      taskFilter.assignedTo = req.userId;
      projectFilter.memberIds = req.userId;
    }

    const [totalEmployees, totalManagers, totalProjects, totalTasks] = await Promise.all([
      UserModel.countDocuments({ businessId, role: UserRole.Employee }),
      UserModel.countDocuments({ businessId, role: UserRole.Manager }),
      ProjectModel.countDocuments(projectFilter),
      TaskModel.countDocuments(taskFilter),
    ]);

    this.jsonResponse(res, { totalEmployees, totalManagers, totalProjects, totalTasks });
  });

  charts = asyncHandler(async (req: Request, res: Response) => {
    const parsedQuery = this.validate(dashboardChartsQuerySchema, req.query, res);
    if (!parsedQuery) return;

    const { months } = parsedQuery;
    const businessId = new Types.ObjectId(req.businessId);
    const skeleton = buildMonthSkeleton(months);
    const rangeStart = getRangeStart(months);

    // An Employee's project trend is scoped to projects they're a member
    // of, matching projectController.list — but employee/manager headcount
    // growth is business-wide for every role, since it's an aggregate count
    // with no per-person detail attached.
    const projectMatch: Record<string, unknown> = { businessId, createdAt: { $gte: rangeStart } };
    if (req.role === UserRole.Employee) {
      projectMatch.memberIds = new Types.ObjectId(req.userId);
    }

    const monthlyGroup = { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, count: { $sum: 1 } };

    const [employeeRows, managerRows, projectRows] = await Promise.all([
      UserModel.aggregate<MonthlyAggRow>([
        { $match: { businessId, role: UserRole.Employee, createdAt: { $gte: rangeStart } } },
        { $group: monthlyGroup },
      ]),
      UserModel.aggregate<MonthlyAggRow>([
        { $match: { businessId, role: UserRole.Manager, createdAt: { $gte: rangeStart } } },
        { $group: monthlyGroup },
      ]),
      ProjectModel.aggregate<MonthlyAggRow>([{ $match: projectMatch }, { $group: monthlyGroup }]),
    ]);

    const employeeMap = toCountMap(employeeRows);
    const managerMap = toCountMap(managerRows);
    const projectMap = toCountMap(projectRows);

    const result = skeleton.map(({ key, label }) => ({
      label,
      employees: employeeMap.get(key) ?? 0,
      managers: managerMap.get(key) ?? 0,
      projects: projectMap.get(key) ?? 0,
    }));

    this.jsonResponse(res, { months: result });
  });
}

export default new DashboardController();
