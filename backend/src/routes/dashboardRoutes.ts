import { Router } from 'express';
import dashboardController from '../controllers/dashboardController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

// No requireRole — these only ever return aggregate counts, never the
// underlying employee/manager records (unlike /api/employees and
// /api/managers, which are Admin-only), so every authenticated role can
// read its own scoped view. See dashboardController for the per-role rules.
router.use(requireAuth);
router.get('/stats', dashboardController.stats);
router.get('/charts', dashboardController.charts);

export default router;
