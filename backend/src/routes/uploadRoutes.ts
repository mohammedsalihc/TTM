import { Router } from 'express';
import uploadController from '../controllers/uploadController';
import { requireAuth } from '../middleware/authMiddleware';
import { uploadSingleImage } from '../middleware/uploadMiddleware';

const router = Router();

router.post('/image', requireAuth, uploadSingleImage, uploadController.image);

export default router;
