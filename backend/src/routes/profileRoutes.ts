import { Router } from 'express';
import profileController from '../controllers/profileController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.use(requireAuth);
router.get('/', profileController.me);

export default router;
