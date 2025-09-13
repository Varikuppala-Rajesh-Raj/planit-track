import { Router } from 'express';
import { subscriptionsController } from '../controllers/subscriptions.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// All subscription routes require authentication
router.use(authenticateToken);

router.get('/', subscriptionsController.getSubscriptions);
router.get('/:id', subscriptionsController.getSubscription);
router.post('/', subscriptionsController.createSubscription);
router.put('/:id', subscriptionsController.updateSubscription);
router.delete('/:id', subscriptionsController.cancelSubscription);
router.post('/:id/renew', subscriptionsController.renewSubscription);

export default router;