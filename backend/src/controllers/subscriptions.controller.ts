import { Request, Response, NextFunction } from 'express';
import { subscriptionsService } from '../services/subscriptions.service';
import { createSubscriptionSchema, updateSubscriptionSchema } from '../models/types';
import { AppError } from '../middleware/error.middleware';

export class SubscriptionsController {
  async getSubscriptions(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('User not authenticated', 401);
      }

      const subscriptions = await subscriptionsService.getUserSubscriptions(req.user.id);

      res.json({
        success: true,
        data: subscriptions,
      });
    } catch (error) {
      next(error);
    }
  }

  async getSubscription(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('User not authenticated', 401);
      }

      const { id } = req.params;

      // Users can only access their own subscriptions, admins can access any
      const userId = req.user.role === 'ADMIN' ? undefined : req.user.id;
      const subscription = await subscriptionsService.getSubscriptionById(id, userId);

      res.json({
        success: true,
        data: subscription,
      });
    } catch (error) {
      next(error);
    }
  }

  async createSubscription(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('User not authenticated', 401);
      }

      // Validate request data
      const validatedData = createSubscriptionSchema.parse(req.body);

      // Create subscription
      const subscription = await subscriptionsService.createSubscription(
        req.user.id,
        validatedData
      );

      res.status(201).json({
        success: true,
        data: subscription,
        message: 'Subscription created successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async updateSubscription(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('User not authenticated', 401);
      }

      const { id } = req.params;

      // Validate request data
      const validatedData = updateSubscriptionSchema.parse(req.body);

      // Update subscription
      const subscription = await subscriptionsService.updateSubscription(
        id,
        validatedData,
        req.user.id
      );

      res.json({
        success: true,
        data: subscription,
        message: 'Subscription updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async cancelSubscription(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('User not authenticated', 401);
      }

      const { id } = req.params;

      // Cancel subscription
      await subscriptionsService.cancelSubscription(id, req.user.id);

      res.json({
        success: true,
        message: 'Subscription cancelled successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async renewSubscription(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('User not authenticated', 401);
      }

      const { id } = req.params;

      // Renew subscription
      const subscription = await subscriptionsService.renewSubscription(id, req.user.id);

      res.json({
        success: true,
        data: subscription,
        message: 'Subscription renewed successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const subscriptionsController = new SubscriptionsController();