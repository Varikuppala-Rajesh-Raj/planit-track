import { Router } from 'express';
import authRoutes from './auth.routes';
import plansRoutes from './plans.routes';
import subscriptionsRoutes from './subscriptions.routes';
import adminRoutes from './admin.routes';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Subscription Management API is running',
    timestamp: new Date(),
    version: '1.0.0',
  });
});

// API routes
router.use('/auth', authRoutes);
router.use('/plans', plansRoutes);
router.use('/subscriptions', subscriptionsRoutes);
router.use('/admin', adminRoutes);

export default router;