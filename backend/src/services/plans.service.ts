import { prisma } from '../db/prisma';
import { AppError } from '../middleware/error.middleware';
import { CreatePlanRequest, UpdatePlanRequest, PlanModel } from '../models/types';
import { auditService } from './audit.service';

export class PlansService {
  async getPlans(filters?: {
    isActive?: boolean;
    tier?: 'BASIC' | 'PRO' | 'ENTERPRISE';
    billingCycle?: 'MONTHLY' | 'YEARLY';
  }): Promise<PlanModel[]> {
    const where: any = {};
    
    if (filters?.isActive !== undefined) where.isActive = filters.isActive;
    if (filters?.tier) where.tier = filters.tier;
    if (filters?.billingCycle) where.billingCycle = filters.billingCycle;

    const plans = await prisma.plan.findMany({
      where,
      orderBy: [
        { tier: 'asc' },
        { price: 'asc' },
      ],
    });

    return plans;
  }

  async getPlanById(planId: string): Promise<PlanModel> {
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      throw new AppError('Plan not found', 404);
    }

    return plan;
  }

  async createPlan(data: CreatePlanRequest, actorId: string): Promise<PlanModel> {
    // TODO: Add business logic validation
    // - Check for duplicate plan names
    // - Validate pricing rules
    // - Ensure feature consistency

    const plan = await prisma.plan.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        billingCycle: data.billingCycle,
        features: data.features,
        tier: data.tier,
        isActive: true,
      },
    });

    // Log audit event
    await auditService.logPlanAction(actorId, 'plan_created', plan.id, {
      planName: plan.name,
      price: plan.price,
      tier: plan.tier,
    });

    return plan;
  }

  async updatePlan(planId: string, data: UpdatePlanRequest, actorId: string): Promise<PlanModel> {
    // Check if plan exists
    await this.getPlanById(planId);

    // TODO: Add business logic validation
    // - Check if plan has active subscriptions before major changes
    // - Validate price changes against business rules
    // - Handle feature changes for existing subscribers

    const plan = await prisma.plan.update({
      where: { id: planId },
      data,
    });

    // Log audit event
    await auditService.logPlanAction(actorId, 'plan_updated', plan.id, {
      planName: plan.name,
      changes: data,
    });

    return plan;
  }

  async deletePlan(planId: string, actorId: string): Promise<void> {
    // Check if plan exists
    const plan = await this.getPlanById(planId);

    // TODO: Add business logic validation
    // - Check if plan has active subscriptions
    // - Handle existing subscriptions (migrate or cancel)
    // - Prevent deletion of essential plans

    // Check for active subscriptions
    const activeSubscriptions = await prisma.subscription.count({
      where: {
        planId,
        status: 'ACTIVE',
      },
    });

    if (activeSubscriptions > 0) {
      throw new AppError(
        `Cannot delete plan with ${activeSubscriptions} active subscriptions`,
        400
      );
    }

    // Soft delete by marking as inactive instead of hard delete
    await prisma.plan.update({
      where: { id: planId },
      data: { isActive: false },
    });

    // Log audit event
    await auditService.logPlanAction(actorId, 'plan_deleted', planId, {
      planName: plan.name,
    });
  }

  async getPopularPlans(limit: number = 3): Promise<(PlanModel & { subscriptionCount: number })[]> {
    // TODO: Implement sophisticated popularity algorithm
    // - Consider subscription count, revenue, user engagement
    // - Time-based weighting (recent subscriptions matter more)
    // - A/B testing support

    const plans = await prisma.plan.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { subscriptions: true },
        },
      },
      orderBy: {
        subscriptions: {
          _count: 'desc',
        },
      },
      take: limit,
    });

    return plans.map(plan => ({
      ...plan,
      subscriptionCount: plan._count.subscriptions,
      _count: undefined,
    }));
  }
}

export const plansService = new PlansService();