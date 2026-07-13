import { Request, Response } from 'express';
import { ControllerHandler } from '../utils/ControllerHandler';
import { UploadService } from '../services/upload-service';
import { error_message } from '../constants/errorMessages';

class UploadController extends ControllerHandler {
  private upload_service = new UploadService();

  image = async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        this.error(res, 400, error_message.image_required);
        return;
      }

      const url = await this.upload_service.Image(req.file.buffer);
      this.jsonResponse(res, { url });
    } catch (err) {
      console.error(err);
      this.error(res, 500, null, err);
    }
  };
}

export default new UploadController();
