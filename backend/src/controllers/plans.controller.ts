import { Request, Response, NextFunction } from 'express';
import { plansService } from '../services/plans.service';
import { createPlanSchema, updatePlanSchema } from '../models/types';
import { AppError } from '../middleware/error.middleware';

export class PlansController {
  async getPlans(req: Request, res: Response, next: NextFunction) {
    try {
      const { isActive, tier, billingCycle } = req.query;

      const filters: any = {};
      if (isActive !== undefined) filters.isActive = isActive === 'true';
      if (tier) filters.tier = tier as any;
      if (billingCycle) filters.billingCycle = billingCycle as any;

      const plans = await plansService.getPlans(filters);

      res.json({
        success: true,
        data: plans,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPlan(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const plan = await plansService.getPlanById(id);

      res.json({
        success: true,
        data: plan,
      });
    } catch (error) {
      next(error);
    }
  }

  async createPlan(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('User not authenticated', 401);
      }

      // Validate request data
      const validatedData = createPlanSchema.parse(req.body);

      // Create plan
      const plan = await plansService.createPlan(validatedData, req.user.id);

      res.status(201).json({
        success: true,
        data: plan,
        message: 'Plan created successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async updatePlan(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('User not authenticated', 401);
      }

      const { id } = req.params;

      // Validate request data
      const validatedData = updatePlanSchema.parse(req.body);

      // Update plan
      const plan = await plansService.updatePlan(id, validatedData, req.user.id);

      res.json({
        success: true,
        data: plan,
        message: 'Plan updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async deletePlan(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('User not authenticated', 401);
      }

      const { id } = req.params;

      // Delete plan
      await plansService.deletePlan(id, req.user.id);

      res.json({
        success: true,
        message: 'Plan deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async getPopularPlans(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = parseInt(req.query.limit as string) || 3;
      const plans = await plansService.getPopularPlans(limit);

      res.json({
        success: true,
        data: plans,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const plansController = new PlansController();