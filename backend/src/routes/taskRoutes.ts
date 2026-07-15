import { Router } from 'express';
import taskController from '../controllers/taskController';
import commentController from '../controllers/commentController';
import attachmentController from '../controllers/attachmentController';
import { requireAuth } from '../middleware/authMiddleware';
import { uploadTaskAttachment } from '../middleware/uploadMiddleware';

const router = Router();

// No requireRole here — like Projects, readable by any role (scoped
// per-role inside the controller) and writable by Admin or a Manager who
// owns the task's parent project, which can't be decided by role alone.
// See utils/projectAccess.ts and utils/taskAccess.ts.
router.use(requireAuth);
router.post('/', taskController.create);
router.get('/', taskController.list);
router.get('/:id', taskController.detail);
router.patch('/:id', taskController.update);
router.patch('/:id/status', taskController.updateStatus);
router.delete('/:id', taskController.remove);
router.post('/:taskId/comments', commentController.create);
router.get('/:taskId/comments', commentController.list);
router.post('/:taskId/attachments', uploadTaskAttachment, attachmentController.create);
router.delete('/:taskId/attachments/:attachmentId', attachmentController.remove);

export default router;
