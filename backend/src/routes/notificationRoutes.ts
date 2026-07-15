import { Router } from 'express';
import notificationController from '../controllers/notificationController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

// No requireRole — every role gets their own notification feed, scoped to
// req.userId inside the controller, never trusted from a client-supplied id.
router.use(requireAuth);
router.get('/', notificationController.list);
router.patch('/read-all', notificationController.markAllRead);
router.patch('/:id/read', notificationController.markRead);

export default router;
