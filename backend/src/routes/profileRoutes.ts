import { Router } from 'express';
import profileController from '../controllers/profileController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.use(requireAuth);
router.get('/', profileController.me);
router.patch('/', profileController.update);
router.patch('/password', profileController.changePassword);

export default router;
