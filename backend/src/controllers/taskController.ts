import { Request, Response } from 'express';
import { HydratedDocument } from 'mongoose';
import { ControllerHandler } from '../utils/ControllerHandler';
import { CreateService } from '../services/createService';
import { DetailService } from '../services/detailService';
import { ListService } from '../services/listService';
import { UpdateService } from '../services/updateService';
import { DeleteService } from '../services/deleteService';
import { error_message } from '../constants/errorMessages';
import { UserRole, ITask, IUser, NotificationType } from '../types';
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
import { ActivityLogService } from '../utils/activityLogService';
import { PopulatedUserRef } from '../utils/populatedRef';

// Populates assignedTo with name+photo just before a response is built —
// deliberately NOT done inside DetailService.Task itself, since that method
// is also used for raw-id comparisons elsewhere (canViewTask, the isAssignee
// check in updateStatus) that need plain ids to compare against req.userId.
// Call this only after any such check has already run.
const populateAssignees = (task: ITask) =>
  (task as unknown as HydratedDocument<ITask>).populate([{ path: 'assignedTo', select: 'name photoUrl' }]);

const toTaskResponse = (task: ITask) => {
  const assignedTo = (task.assignedTo as unknown as PopulatedUserRef[]) ?? [];

  return {
    id: task._id,
    businessId: task.businessId,
    projectId: task.projectId,
    title: task.title,
    description: task.description,
    assignedTo: assignedTo.map((user) => ({ id: user._id, name: user.name, photoUrl: user.photoUrl })),
    priority: task.priority,
    status: task.status,
    estimatedHours: task.estimatedHours,
    dueDate: task.dueDate,
    labels: task.labels,
    attachments: task.attachments,
    createdBy: task.createdBy,
    createdAt: task.createdAt,
  };
};

class TaskController extends ControllerHandler {
  private create_service = new CreateService();
  private detail_service = new DetailService();
  private list_service = new ListService();
  private update_service = new UpdateService();
  private delete_service = new DeleteService();
  private activity_log_service = new ActivityLogService();

  // Best-effort: the task is already created/updated either way — a
  // notification failure shouldn't fail the whole request (same pattern as
  // the welcome-email invite in employee/manager create).
  private notifyAssignees = async (task: ITask, assigneeIds: string[]) => {
    if (assigneeIds.length === 0) return;
    try {
      await Promise.all(
        assigneeIds.map((userId) =>
          this.create_service.Notification({
            businessId: task.businessId,
            userId,
            message: `You were assigned to "${task.title}"`,
            type: NotificationType.TaskAssigned,
            relatedProjectId: task.projectId,
            relatedTaskId: task._id!,
          }),
        ),
      );
    } catch (err) {
      console.error('Failed to create task-assignment notifications:', err);
    }
  };

  // Logs one entry per assignee (matches the "Manager assigned task to
  // John" example) — `assignees` is the already-fetched User docs from the
  // validation step above, so this doesn't re-query.
  private logTaskAssignments = async (actorId: string, task: ITask, assignees: (IUser | null)[]) => {
    await Promise.all(
      assignees
        .filter((user): user is IUser => !!user)
        .map((user) =>
          this.activity_log_service.log({
            businessId: task.businessId,
            projectId: task.projectId,
            taskId: task._id!,
            actorId,
            action: `assigned task "${task.title}" to ${user.name}`,
          }),
        ),
    );
  };

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

    let assignees: (IUser | null)[] = [];
    if (assignedTo && assignedTo.length > 0) {
      assignees = await Promise.all(
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

    await this.notifyAssignees(task, assignedTo ?? []);
    await this.activity_log_service.log({
      businessId,
      projectId,
      taskId: task._id!,
      actorId: req.userId!,
      action: `created task "${task.title}"`,
    });
    await this.logTaskAssignments(req.userId!, task, assignees);

    await populateAssignees(task);
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

    await populateAssignees(task);
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

    let assignees: (IUser | null)[] = [];
    if (assignedTo) {
      assignees = await Promise.all(
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

    // Only notify/log newly added assignees — someone already on the task
    // shouldn't get re-notified just because the assignee list was touched.
    if (assignedTo) {
      const previouslyAssigned = new Set((task.assignedTo ?? []).map((userId) => userId.toString()));
      const newlyAssigned = assignedTo.filter((userId) => !previouslyAssigned.has(userId));
      const newlyAssignedUsers = assignees.filter(
        (user): user is IUser => !!user && !previouslyAssigned.has(user._id!.toString()),
      );
      await this.notifyAssignees(updated, newlyAssigned);
      await this.logTaskAssignments(req.userId!, updated, newlyAssignedUsers);
    }

    await populateAssignees(updated);
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

    const previousStatus = task.status;
    const updated = await this.update_service.Task({ _id: id, businessId }, { status: parsed.status });
    if (!updated) {
      this.error(res, 404, error_message.task_not_found);
      return;
    }

    // "completed" gets its own phrasing (matches the "John completed task"
    // example); any other transition reads as "changed status A → B".
    const action =
      parsed.status === 'completed'
        ? `completed task "${updated.title}"`
        : `changed task "${updated.title}" status from ${previousStatus} to ${parsed.status}`;
    await this.activity_log_service.log({
      businessId,
      projectId: updated.projectId,
      taskId: updated._id!,
      actorId: req.userId!,
      action,
    });

    await populateAssignees(updated);
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

    // Logged before the delete, same reasoning as project delete — see
    // projectController.remove.
    await this.activity_log_service.log({
      businessId,
      projectId: task.projectId,
      taskId: task._id!,
      actorId: req.userId!,
      action: `deleted task "${task.title}"`,
    });

    await this.delete_service.Task({ _id: id, businessId });
    this.jsonResponse(res);
  });
}

export default new TaskController();
