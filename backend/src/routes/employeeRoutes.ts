import { Router } from 'express';
import employeeController from '../controllers/employeeController';
import { requireAuth, requireRole } from '../middleware/authMiddleware';
import { UserRole } from '../types';

const router = Router();

router.use(requireAuth, requireRole(UserRole.Admin));
router.post('/', employeeController.create);
router.get('/', employeeController.list);
router.get('/:id', employeeController.detail);
router.patch('/:id', employeeController.update);

export default router;
