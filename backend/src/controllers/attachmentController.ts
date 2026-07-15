import { Request, Response } from 'express';
import { ControllerHandler } from '../utils/ControllerHandler';
import { DetailService } from '../services/detailService';
import { UpdateService } from '../services/updateService';
import { UploadService } from '../services/uploadService';
import { error_message } from '../constants/errorMessages';
import { ITaskAttachment } from '../types';
import { canManageProject } from '../utils/projectAccess';
import { canViewTask } from '../utils/taskAccess';
import { asyncHandler } from '../utils/asyncHandler';

const toAttachmentResponse = (attachment: ITaskAttachment) => ({
  id: attachment._id,
  url: attachment.url,
  fileName: attachment.fileName,
  fileType: attachment.fileType,
  uploadedBy: attachment.uploadedBy,
  uploadedAt: attachment.uploadedAt,
});

class AttachmentController extends ControllerHandler {
  private detail_service = new DetailService();
  private update_service = new UpdateService();
  private upload_service = new UploadService();

  create = asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      this.error(res, 400, error_message.attachment_required);
      return;
    }

    const businessId = req.businessId!;
    const taskId = req.params.taskId as string;

    const task = await this.detail_service.Task({ _id: taskId, businessId });
    if (!task) {
      this.error(res, 404, error_message.task_not_found);
      return;
    }

    // Anyone who can see the task can attach a file to it — same rule as
    // comments, not the stricter ownership check used for editing the task.
    if (!canViewTask(req, task)) {
      this.error(res, 403, error_message.forbidden);
      return;
    }

    const url = await this.upload_service.File(req.file.buffer);

    const attachment: ITaskAttachment = {
      url,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      uploadedBy: req.userId!,
      uploadedAt: new Date(),
    };

    const updated = await this.update_service.Task(
      { _id: taskId, businessId },
      { $push: { attachments: attachment } },
    );

    if (!updated) {
      this.error(res, 404, error_message.task_not_found);
      return;
    }

    const created = updated.attachments?.[updated.attachments.length - 1];
    this.jsonResponse(res, toAttachmentResponse(created!));
  });

  remove = asyncHandler(async (req: Request, res: Response) => {
    const businessId = req.businessId!;
    const taskId = req.params.taskId as string;
    const attachmentId = req.params.attachmentId as string;

    const task = await this.detail_service.Task({ _id: taskId, businessId });
    if (!task) {
      this.error(res, 404, error_message.task_not_found);
      return;
    }

    const attachment = (task.attachments ?? []).find((a) => a._id?.toString() === attachmentId);
    if (!attachment) {
      this.error(res, 404, error_message.attachment_not_found);
      return;
    }

    // Removable by whoever uploaded it, or by Admin/the owning Manager —
    // same ownership gate as editing the task itself.
    const project = await this.detail_service.Project({ _id: task.projectId, businessId });
    const canManage = project ? await canManageProject(req, project) : false;
    const isUploader = attachment.uploadedBy.toString() === req.userId;

    if (!canManage && !isUploader) {
      this.error(res, 403, error_message.forbidden);
      return;
    }

    await this.update_service.Task({ _id: taskId, businessId }, { $pull: { attachments: { _id: attachmentId } } });
    this.jsonResponse(res);
  });
}

export default new AttachmentController();
