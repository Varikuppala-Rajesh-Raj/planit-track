import { Router } from 'express';
import { plansController } from '../controllers/plans.controller';
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.get('/', plansController.getPlans);
router.get('/popular', plansController.getPopularPlans);
router.get('/:id', plansController.getPlan);

// Admin-only routes
router.post('/', authenticateToken, requireAdmin, plansController.createPlan);
router.put('/:id', authenticateToken, requireAdmin, plansController.updatePlan);
router.delete('/:id', authenticateToken, requireAdmin, plansController.deletePlan);

export default router;