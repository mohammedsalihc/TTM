import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { controllerHandler } from '../utils/ControllerHandler';
import { error_message } from '../constants/errorMessages';

// Shared by every upload route — only the field name and which mimetypes
// pass the filter differ between an image-only upload and a mixed
// image/PDF one. No global Express error-handling middleware exists in
// this app (each controller catches its own errors), so multer's
// callback-style errors (bad file type, over the size limit) are
// normalized here into the same JSON error shape instead of falling
// through to Express's default HTML error page.
function createSingleFileUploader(fieldName: string, isAllowedMimeType: (mimetype: string) => boolean, rejectionMessage: string) {
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      if (!isAllowedMimeType(file.mimetype)) {
        cb(new Error(rejectionMessage));
        return;
      }
      cb(null, true);
    },
  });

  return function (req: Request, res: Response, next: NextFunction) {
    upload.single(fieldName)(req, res, (err) => {
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
  };
}

export const uploadSingleImage = createSingleFileUploader(
  'image',
  (mimetype) => mimetype.startsWith('image/'),
  'Only image files are allowed',
);

export const uploadTaskAttachment = createSingleFileUploader(
  'file',
  (mimetype) => mimetype.startsWith('image/') || mimetype === 'application/pdf',
  'Only image or PDF files are allowed',
);
