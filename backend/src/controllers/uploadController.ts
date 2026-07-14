import { Request, Response } from 'express';
import { ControllerHandler } from '../utils/ControllerHandler';
import { UploadService } from '../services/uploadService';
import { error_message } from '../constants/errorMessages';
import { asyncHandler } from '../utils/asyncHandler';

class UploadController extends ControllerHandler {
  private upload_service = new UploadService();

  image = asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      this.error(res, 400, error_message.image_required);
      return;
    }

    const url = await this.upload_service.Image(req.file.buffer);
    this.jsonResponse(res, { url });
  });
}

export default new UploadController();
