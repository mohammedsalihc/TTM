import { Request, Response } from 'express';
import { HydratedDocument } from 'mongoose';
import { ControllerHandler } from '../utils/ControllerHandler';
import { CreateService } from '../services/createService';
import { DetailService } from '../services/detailService';
import { ListService } from '../services/listService';
import { UpdateService } from '../services/updateService';
import { DeleteService } from '../services/deleteService';
import { error_message } from '../constants/errorMessages';
import { UserRole, IProject } from '../types';
import {
  createProjectSchema,
  updateProjectSchema,
  listProjectsQuerySchema,
  listActivityQuerySchema,
} from '../validators/project.validators';
import { hasProjectManagementPermission, canManageProject } from '../utils/projectAccess';
import { buildPaginationMeta } from '../utils/pagination';
import { asyncHandler } from '../utils/asyncHandler';
import { ActivityLogService } from '../utils/activityLogService';
import { PopulatedUserRef } from '../utils/populatedRef';

// Populates owner/members with name+photo just before a response is built —
// deliberately NOT done inside DetailService.Project itself, since that
// method is also used for ownership checks elsewhere (canManageProject,
// isProjectOwner, task authorization) that need raw ids to compare against
// req.userId. Call this only after any such check has already run. Members
// also get `role` so the frontend can tell Employees apart from Managers
// (e.g. task-assignee pickers only want Employees).
const populateOwnerAndMembers = (project: IProject) =>
  (project as unknown as HydratedDocument<IProject>).populate([
    { path: 'ownerId', select: 'name photoUrl' },
    { path: 'memberIds', select: 'name photoUrl role' },
  ]);

// Every other endpoint in this API returns `id`, never Mongoose's raw
// `_id` — keep Projects consistent with that contract. owner/members are
// embedded (name+photo) via populateOwnerAndMembers/ListService.Project's
// query-level populate, so the frontend never resolves raw ids itself.
const toProjectResponse = (project: IProject) => {
  const owner = project.ownerId as unknown as PopulatedUserRef;
  const members = (project.memberIds as unknown as PopulatedUserRef[]) ?? [];

  return {
    id: project._id,
    businessId: project.businessId,
    name: project.name,
    description: project.description,
    startDate: project.startDate,
    dueDate: project.dueDate,
    owner: owner ? { id: owner._id, name: owner.name, photoUrl: owner.photoUrl } : undefined,
    members: members.map((member) => ({ id: member._id, name: member.name, photoUrl: member.photoUrl, role: member.role })),
    createdBy: project.createdBy,
    createdAt: project.createdAt,
  };
};

class ProjectController extends ControllerHandler {
  private create_service = new CreateService();
  private detail_service = new DetailService();
  private list_service = new ListService();
  private update_service = new UpdateService();
  private delete_service = new DeleteService();
  private activity_log_service = new ActivityLogService();

  create = asyncHandler(async (req: Request, res: Response) => {
    const parsed = this.validate(createProjectSchema, req.body, res);
    if (!parsed) return;

    if (!(await hasProjectManagementPermission(req))) {
      this.error(res, 403, error_message.forbidden);
      return;
    }

    const { name, description, startDate, dueDate, ownerId, memberIds } = parsed;
    const businessId = req.businessId!;

    // Owner must be an Admin or Manager within the caller's own business —
    // never trust a client-supplied id without checking both.
    const owner = await this.detail_service.User({ _id: ownerId, businessId });
    if (!owner || (owner.role !== UserRole.Admin && owner.role !== UserRole.Manager)) {
      this.error(res, 400, error_message.invalid_project_owner);
      return;
    }

    const project = await this.create_service.Project({
      businessId,
      name,
      description,
      startDate,
      dueDate,
      ownerId,
      memberIds,
      createdBy: req.userId!,
    });

    await this.activity_log_service.log({
      businessId,
      projectId: project._id!,
      actorId: req.userId!,
      action: `created project "${project.name}"`,
    });

    await populateOwnerAndMembers(project);
    this.jsonResponse(res, toProjectResponse(project));
  });

  list = asyncHandler(async (req: Request, res: Response) => {
    const parsedQuery = this.validate(listProjectsQuerySchema, req.query, res);
    if (!parsedQuery) return;

    const { page, limit, search } = parsedQuery;
    const businessId = req.businessId!;

    // Admin/Manager see every project in the business (coordination
    // visibility); an Employee only sees projects they're a member of.
    const filter = req.role === UserRole.Employee ? { businessId, memberIds: req.userId } : { businessId };

    const { data, total } = await this.list_service.Project(filter, { page, limit, search });

    this.jsonResponse(res, {
      data: data.map(toProjectResponse),
      pagination: buildPaginationMeta(total, page, limit),
    });
  });

  detail = asyncHandler(async (req: Request, res: Response) => {
    const businessId = req.businessId!;
    const { id } = req.params;

    const project = await this.detail_service.Project({ _id: id, businessId });
    if (!project) {
      this.error(res, 404, error_message.project_not_found);
      return;
    }

    const isMember = (project.memberIds ?? []).some((memberId) => memberId.toString() === req.userId);
    if (req.role === UserRole.Employee && !isMember) {
      this.error(res, 403, error_message.forbidden);
      return;
    }

    await populateOwnerAndMembers(project);
    this.jsonResponse(res, toProjectResponse(project));
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const parsed = this.validate(updateProjectSchema, req.body, res);
    if (!parsed) return;

    const businessId = req.businessId!;
    const { id } = req.params;

    const existing = await this.detail_service.Project({ _id: id, businessId });
    if (!existing) {
      this.error(res, 404, error_message.project_not_found);
      return;
    }

    if (!(await canManageProject(req, existing))) {
      this.error(res, 403, error_message.forbidden);
      return;
    }

    const { ownerId, ...rest } = parsed;

    if (ownerId) {
      const owner = await this.detail_service.User({ _id: ownerId, businessId });
      if (!owner || (owner.role !== UserRole.Admin && owner.role !== UserRole.Manager)) {
        this.error(res, 400, error_message.invalid_project_owner);
        return;
      }
    }

    const project = await this.update_service.Project({ _id: id, businessId }, { ...rest, ownerId });
    if (!project) {
      this.error(res, 404, error_message.project_not_found);
      return;
    }

    await populateOwnerAndMembers(project);
    this.jsonResponse(res, toProjectResponse(project));
  });

  remove = asyncHandler(async (req: Request, res: Response) => {
    const businessId = req.businessId!;
    const { id } = req.params;

    const existing = await this.detail_service.Project({ _id: id, businessId });
    if (!existing) {
      this.error(res, 404, error_message.project_not_found);
      return;
    }

    if (!(await canManageProject(req, existing))) {
      this.error(res, 403, error_message.forbidden);
      return;
    }

    // Logged before the delete — once the project is gone, this project's
    // own activity feed can no longer be read (the GET below 404s first),
    // so this entry is only useful if a future business-wide feed reads it.
    await this.activity_log_service.log({
      businessId,
      projectId: existing._id!,
      actorId: req.userId!,
      action: `deleted project "${existing.name}"`,
    });

    await this.delete_service.Project({ _id: id, businessId });
    this.jsonResponse(res);
  });

  activity = asyncHandler(async (req: Request, res: Response) => {
    const parsedQuery = this.validate(listActivityQuerySchema, req.query, res);
    if (!parsedQuery) return;

    const { page, limit } = parsedQuery;
    const businessId = req.businessId!;
    const { projectId } = req.params;

    const project = await this.detail_service.Project({ _id: projectId, businessId });
    if (!project) {
      this.error(res, 404, error_message.project_not_found);
      return;
    }

    // Same view-visibility rule as project detail — Admin/Manager always,
    // an Employee only if they're a member of this project.
    const isMember = (project.memberIds ?? []).some((memberId) => memberId.toString() === req.userId);
    if (req.role === UserRole.Employee && !isMember) {
      this.error(res, 403, error_message.forbidden);
      return;
    }

    const { data, total } = await this.list_service.ActivityLog({ businessId, projectId }, { page, limit });

    this.jsonResponse(res, {
      data: data.map((log) => ({
        id: log._id,
        projectId: log.projectId,
        taskId: log.taskId,
        actorId: log.actorId,
        message: log.message,
        createdAt: log.createdAt,
      })),
      pagination: buildPaginationMeta(total, page, limit),
    });
  });
}

export default new ProjectController();
