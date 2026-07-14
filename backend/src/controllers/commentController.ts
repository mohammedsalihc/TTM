import { Request, Response } from 'express';
import { ControllerHandler } from '../utils/ControllerHandler';
import { CreateService } from '../services/createService';
import { DetailService } from '../services/detailService';
import { error_message } from '../constants/errorMessages';
import { IComment } from '../types';
import { createCommentSchema } from '../validators/comment.validators';
import { canViewTask } from '../utils/taskAccess';
import { asyncHandler } from '../utils/asyncHandler';

const toCommentResponse = (comment: IComment) => ({
  id: comment._id,
  taskId: comment.taskId,
  authorId: comment.authorId,
  text: comment.text,
  createdAt: comment.createdAt,
});

class CommentController extends ControllerHandler {
  private create_service = new CreateService();
  private detail_service = new DetailService();

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

    this.jsonResponse(res, toCommentResponse(comment));
  });
}

export default new CommentController();
