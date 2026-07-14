import { Router } from 'express';
import projectController from '../controllers/projectController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

// No requireRole here — unlike Employee/Manager routes, Projects are
// readable by any role (scoped per-role inside the controller) and
// writable by Admin or a Manager who owns the project, which can't be
// decided by role alone. See utils/projectAccess.ts.
router.use(requireAuth);
router.post('/', projectController.create);
router.get('/', projectController.list);
router.get('/:id', projectController.detail);
router.patch('/:id', projectController.update);

export default router;
