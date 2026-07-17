import { Request, Response } from 'express';
import { HydratedDocument } from 'mongoose';
import { ControllerHandler } from '../utils/ControllerHandler';
import { CreateService } from '../services/createService';
import { DetailService } from '../services/detailService';
import { ListService } from '../services/listService';
import { error_message } from '../constants/errorMessages';
import { IComment } from '../types';
import { createCommentSchema, listCommentsQuerySchema } from '../validators/comment.validators';
import { canViewTask } from '../utils/taskAccess';
import { buildPaginationMeta } from '../utils/pagination';
import { asyncHandler } from '../utils/asyncHandler';
import { PopulatedUserRef } from '../utils/populatedRef';

// Populates authorId with name+photo just before a response is built — see
// projectController/taskController for the same pattern. Safe to do
// unconditionally here (unlike Project/Task) since nothing in this
// controller ever compares comment.authorId against a raw id.
const populateAuthor = (comment: IComment) =>
  (comment as unknown as HydratedDocument<IComment>).populate([{ path: 'authorId', select: 'name photoUrl' }]);

const toCommentResponse = (comment: IComment) => {
  const author = comment.authorId as unknown as PopulatedUserRef;
  return {
    id: comment._id,
    taskId: comment.taskId,
    author: author ? { id: author._id, name: author.name, photoUrl: author.photoUrl } : undefined,
    text: comment.text,
    createdAt: comment.createdAt,
  };
};

class CommentController extends ControllerHandler {
  private create_service = new CreateService();
  private detail_service = new DetailService();
  private list_service = new ListService();

  create = asyncHandler(async (req: Request, res: Response) => {
    const parsed = this.validate(createCommentSchema, req.body, res);
    if (!parsed) return;

    const businessId = req.businessId!;
    // Express 5 types route params as `string | string[]` (to allow repeated
    // segments); a single `:taskId` is always a plain string in practice.
    const taskId = req.params.taskId as string;

    const task = await this.detail_service.Task({ _id: taskId, businessId });
    if (!task) {
      this.error(res, 404, error_message.task_not_found);
      return;
    }

    // Anyone who can see the task can comment on it — same rule as task
    // detail, not the stricter ownership check used for editing the task.
    if (!canViewTask(req, task)) {
      this.error(res, 403, error_message.forbidden);
      return;
    }

    const comment = await this.create_service.Comment({
      taskId,
      businessId,
      authorId: req.userId!,
      text: parsed.text,
    });

    await populateAuthor(comment);
    this.jsonResponse(res, toCommentResponse(comment));
  });

  list = asyncHandler(async (req: Request, res: Response) => {
    const parsedQuery = this.validate(listCommentsQuerySchema, req.query, res);
    if (!parsedQuery) return;

    const { page, limit } = parsedQuery;
    const businessId = req.businessId!;
    const taskId = req.params.taskId as string;

    const task = await this.detail_service.Task({ _id: taskId, businessId });
    if (!task) {
      this.error(res, 404, error_message.task_not_found);
      return;
    }

    if (!canViewTask(req, task)) {
      this.error(res, 403, error_message.forbidden);
      return;
    }

    const { data, total } = await this.list_service.Comment({ taskId, businessId }, { page, limit });

    this.jsonResponse(res, {
      data: data.map(toCommentResponse),
      pagination: buildPaginationMeta(total, page, limit),
    });
  });
}

export default new CommentController();
