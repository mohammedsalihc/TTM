import { Request, Response } from 'express';
import { ControllerHandler } from '../utils/ControllerHandler';
import { CreateService } from '../services/createService';
import { DetailService } from '../services/detailService';
import { ListService } from '../services/listService';
import { UpdateService } from '../services/updateService';
import { DeleteService } from '../services/deleteService';
import { error_message } from '../constants/errorMessages';
import { UserRole, IProject } from '../types';
import { createProjectSchema, updateProjectSchema, listProjectsQuerySchema } from '../validators/project.validators';
import { hasProjectManagementPermission, canManageProject } from '../utils/projectAccess';
import { buildPaginationMeta } from '../utils/pagination';
import { asyncHandler } from '../utils/asyncHandler';

// Every other endpoint in this API returns `id`, never Mongoose's raw
// `_id` — keep Projects consistent with that contract.
const toProjectResponse = (project: IProject) => ({
  id: project._id,
  businessId: project.businessId,
  name: project.name,
  description: project.description,
  startDate: project.startDate,
  dueDate: project.dueDate,
  ownerId: project.ownerId,
  memberIds: project.memberIds,
  status: project.status,
  createdBy: project.createdBy,
  createdAt: project.createdAt,
});

class ProjectController extends ControllerHandler {
  private create_service = new CreateService();
  private detail_service = new DetailService();
  private list_service = new ListService();
  private update_service = new UpdateService();
  private delete_service = new DeleteService();

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

    await this.delete_service.Project({ _id: id, businessId });
    this.jsonResponse(res);
  });
}

export default new ProjectController();
