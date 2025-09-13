import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

router.get('/analytics', adminController.getAnalytics);
router.get('/audit-logs', adminController.getAuditLogs);
router.get('/user-metrics', adminController.getUserMetrics);
router.get('/system-health', adminController.getSystemHealth);

export default router;