import { Router } from 'express';
import taskController from '../controllers/taskController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

// No requireRole here — like Projects, readable by any role (scoped
// per-role inside the controller) and writable by Admin or a Manager who
// owns the task's parent project, which can't be decided by role alone.
// See utils/projectAccess.ts.
router.use(requireAuth);
router.post('/', taskController.create);
router.get('/', taskController.list);
router.get('/:id', taskController.detail);

export default router;
