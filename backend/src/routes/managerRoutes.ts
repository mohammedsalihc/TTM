import { Router } from 'express';
import managerController from '../controllers/managerController';
import { requireAuth, requireRole } from '../middleware/authMiddleware';
import { UserRole } from '../types';

const router = Router();

router.use(requireAuth, requireRole(UserRole.Admin));
router.post('/', managerController.create);
router.get('/', managerController.list);
router.get('/:id', managerController.detail);
router.patch('/:id', managerController.update);

export default router;
