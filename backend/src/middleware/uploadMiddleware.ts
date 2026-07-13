import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { controllerHandler } from '../utils/ControllerHandler';
import { error_message } from '../constants/errorMessages';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Only image files are allowed'));
      return;
    }
    cb(null, true);
  },
});

// No global Express error-handling middleware exists in this app (each
// controller catches its own errors), so multer's callback-style errors
// (bad file type, over the size limit) are normalized here into the same
// JSON error shape instead of falling through to Express's default HTML
// error page.
export function uploadSingleImage(req: Request, res: Response, next: NextFunction) {
  upload.single('image')(req, res, (err) => {
    if (!err) {
      next();
      return;
    }
    if (err instanceof multer.MulterError || err instanceof Error) {
      controllerHandler.error(res, 400, { message: err.message, code: error_message.body_validation_error.code });
      return;
    }
    controllerHandler.error(res, 500, null, err);
  });
}
