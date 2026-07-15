import { Request, Response } from 'express';
import { ControllerHandler } from '../utils/ControllerHandler';
import { CreateService } from '../services/createService';
import { DetailService } from '../services/detailService';
import { ListService } from '../services/listService';
import { UpdateService } from '../services/updateService';
import { DeleteService } from '../services/deleteService';
import { error_message } from '../constants/errorMessages';
import { UserRole, ITask } from '../types';
import {
  createTaskSchema,
  listTasksQuerySchema,
  updateTaskSchema,
  updateTaskStatusSchema,
} from '../validators/task.validators';
import { canManageProject } from '../utils/projectAccess';
import { canViewTask } from '../utils/taskAccess';
import { buildPaginationMeta } from '../utils/pagination';
import { asyncHandler } from '../utils/asyncHandler';

const toTaskResponse = (task: ITask) => ({
  id: task._id,
  businessId: task.businessId,
  projectId: task.projectId,
  title: task.title,
  description: task.description,
  assignedTo: task.assignedTo,
  priority: task.priority,
  status: task.status,
  estimatedHours: task.estimatedHours,
  dueDate: task.dueDate,
  labels: task.labels,
  attachments: task.attachments,
  createdBy: task.createdBy,
  createdAt: task.createdAt,
});

class TaskController extends ControllerHandler {
  private create_service = new CreateService();
  private detail_service = new DetailService();
  private list_service = new ListService();
  private update_service = new UpdateService();
  private delete_service = new DeleteService();

  create = asyncHandler(async (req: Request, res: Response) => {
    const parsed = this.validate(createTaskSchema, req.body, res);
    if (!parsed) return;

    const businessId = req.businessId!;
    const { projectId, assignedTo, ...rest } = parsed;

    // A task's authorization mirrors its parent project's — a Manager can
    // only create tasks in a project they own (see utils/projectAccess.ts).
    const project = await this.detail_service.Project({ _id: projectId, businessId });
    if (!project) {
      this.error(res, 400, error_message.invalid_task_project);
      return;
    }

    if (!(await canManageProject(req, project))) {
      this.error(res, 403, error_message.forbidden);
      return;
    }

    if (assignedTo && assignedTo.length > 0) {
      const assignees = await Promise.all(
        assignedTo.map((userId) => this.detail_service.User({ _id: userId, businessId, role: UserRole.Employee })),
      );
      if (assignees.some((user) => !user)) {
        this.error(res, 400, error_message.invalid_task_assignee);
        return;
      }
    }

    const task = await this.create_service.Task({
      businessId,
      projectId,
      assignedTo,
      createdBy: req.userId!,
      ...rest,
    });

    this.jsonResponse(res, toTaskResponse(task));
  });

  list = asyncHandler(async (req: Request, res: Response) => {
    const parsedQuery = this.validate(listTasksQuerySchema, req.query, res);
    if (!parsedQuery) return;

    const { page, limit, search, projectId, status, priority } = parsedQuery;
    const businessId = req.businessId!;

    // Admin/Manager see every task in the business (or in one project, if
    // filtered); an Employee only sees tasks they're assigned to.
    const filter: Record<string, unknown> = { businessId, projectId, status, priority };
    if (req.role === UserRole.Employee) {
      filter.assignedTo = req.userId;
    }

    const { data, total } = await this.list_service.Task(filter, { page, limit, search });

    this.jsonResponse(res, {
      data: data.map(toTaskResponse),
      pagination: buildPaginationMeta(total, page, limit),
    });
  });

  detail = asyncHandler(async (req: Request, res: Response) => {
    const businessId = req.businessId!;
    const { id } = req.params;

    const task = await this.detail_service.Task({ _id: id, businessId });
    if (!task) {
      this.error(res, 404, error_message.task_not_found);
      return;
    }

    if (!canViewTask(req, task)) {
      this.error(res, 403, error_message.forbidden);
      return;
    }

    this.jsonResponse(res, toTaskResponse(task));
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const parsed = this.validate(updateTaskSchema, req.body, res);
    if (!parsed) return;

    const businessId = req.businessId!;
    const { id } = req.params;

    const task = await this.detail_service.Task({ _id: id, businessId });
    if (!task) {
      this.error(res, 404, error_message.task_not_found);
      return;
    }

    // Full edits are gated by the parent project's ownership, same as
    // create/delete — not open to assigned employees (see updateStatus).
    const project = await this.detail_service.Project({ _id: task.projectId, businessId });
    if (!project || !(await canManageProject(req, project))) {
      this.error(res, 403, error_message.forbidden);
      return;
    }

    const { assignedTo, ...rest } = parsed;

    if (assignedTo) {
      const assignees = await Promise.all(
        assignedTo.map((userId) => this.detail_service.User({ _id: userId, businessId, role: UserRole.Employee })),
      );
      if (assignees.some((user) => !user)) {
        this.error(res, 400, error_message.invalid_task_assignee);
        return;
      }
    }

    const updated = await this.update_service.Task({ _id: id, businessId }, { ...rest, assignedTo });
    if (!updated) {
      this.error(res, 404, error_message.task_not_found);
      return;
    }

    this.jsonResponse(res, toTaskResponse(updated));
  });

  updateStatus = asyncHandler(async (req: Request, res: Response) => {
    const parsed = this.validate(updateTaskStatusSchema, req.body, res);
    if (!parsed) return;

    const businessId = req.businessId!;
    const { id } = req.params;

    const task = await this.detail_service.Task({ _id: id, businessId });
    if (!task) {
      this.error(res, 404, error_message.task_not_found);
      return;
    }

    const project = await this.detail_service.Project({ _id: task.projectId, businessId });
    if (!project) {
      this.error(res, 404, error_message.task_not_found);
      return;
    }

    // Status-only changes are also open to an employee this task is
    // assigned to, not just Admin/the owning Manager — matches how an
    // employee actually moves their own work across the board.
    const isAssignee = (task.assignedTo ?? []).some((userId) => userId.toString() === req.userId);
    const canManage = await canManageProject(req, project);
    if (!canManage && !(req.role === UserRole.Employee && isAssignee)) {
      this.error(res, 403, error_message.forbidden);
      return;
    }

    const updated = await this.update_service.Task({ _id: id, businessId }, { status: parsed.status });
    if (!updated) {
      this.error(res, 404, error_message.task_not_found);
      return;
    }

    this.jsonResponse(res, toTaskResponse(updated));
  });

  remove = asyncHandler(async (req: Request, res: Response) => {
    const businessId = req.businessId!;
    const { id } = req.params;

    const task = await this.detail_service.Task({ _id: id, businessId });
    if (!task) {
      this.error(res, 404, error_message.task_not_found);
      return;
    }

    const project = await this.detail_service.Project({ _id: task.projectId, businessId });
    if (!project || !(await canManageProject(req, project))) {
      this.error(res, 403, error_message.forbidden);
      return;
    }

    await this.delete_service.Task({ _id: id, businessId });
    this.jsonResponse(res);
  });
}

export default new TaskController();
