import { prisma } from '../db/prisma';
import { AppError } from '../middleware/error.middleware';
import { CreateSubscriptionRequest, UpdateSubscriptionRequest, SubscriptionModel } from '../models/types';
import { auditService } from './audit.service';
import { plansService } from './plans.service';

export class SubscriptionsService {
  async getUserSubscriptions(userId: string): Promise<SubscriptionModel[]> {
    const subscriptions = await prisma.subscription.findMany({
      where: { userId },
      include: {
        plan: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return subscriptions;
  }

  async getSubscriptionById(subscriptionId: string, userId?: string): Promise<SubscriptionModel> {
    const where: any = { id: subscriptionId };
    if (userId) where.userId = userId; // Ensure user can only access their own subscriptions

    const subscription = await prisma.subscription.findUnique({
      where,
      include: {
        plan: true,
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    if (!subscription) {
      throw new AppError('Subscription not found', 404);
    }

    return subscription;
  }

  async createSubscription(userId: string, data: CreateSubscriptionRequest): Promise<SubscriptionModel> {
    // Validate plan exists and is active
    const plan = await plansService.getPlanById(data.planId);
    if (!plan.isActive) {
      throw new AppError('Plan is not available for subscription', 400);
    }

    // TODO: Business logic validation
    // - Check if user already has active subscription for this plan
    // - Validate payment method and process payment
    // - Apply discounts and promotional codes
    // - Check subscription limits per user

    // Check for existing active subscription
    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        userId,
        planId: data.planId,
        status: 'ACTIVE',
      },
    });

    if (existingSubscription) {
      throw new AppError('User already has an active subscription for this plan', 400);
    }

    // Calculate subscription dates
    const startDate = new Date();
    const endDate = new Date();
    
    if (plan.billingCycle === 'MONTHLY') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    // TODO: Process payment here
    // - Integrate with payment processor (Stripe, PayPal, etc.)
    // - Handle payment failures and retries
    // - Store payment information securely

    const subscription = await prisma.subscription.create({
      data: {
        userId,
        planId: data.planId,
        status: 'ACTIVE',
        startDate,
        endDate,
        autoRenew: data.autoRenew,
      },
      include: {
        plan: true,
      },
    });

    // Log audit event
    await auditService.logSubscriptionAction(
      userId,
      'subscription_created',
      subscription.id,
      {
        planName: plan.name,
        planPrice: plan.price,
        billingCycle: plan.billingCycle,
        autoRenew: data.autoRenew,
      }
    );

    // TODO: Send confirmation notifications
    // - Email confirmation
    // - SMS notification
    // - In-app notification

    return subscription;
  }

  async updateSubscription(
    subscriptionId: string,
    data: UpdateSubscriptionRequest,
    userId: string
  ): Promise<SubscriptionModel> {
    // Get current subscription
    const currentSubscription = await this.getSubscriptionById(subscriptionId, userId);

    // TODO: Business logic validation
    // - Handle plan upgrades/downgrades with prorated billing
    // - Validate status transitions
    // - Check upgrade/downgrade permissions
    // - Calculate billing adjustments

    const updateData: any = {};

    if (data.autoRenew !== undefined) {
      updateData.autoRenew = data.autoRenew;
    }

    if (data.status !== undefined) {
      // Validate status transition
      if (currentSubscription.status === 'CANCELLED' && data.status === 'ACTIVE') {
        throw new AppError('Cannot reactivate cancelled subscription', 400);
      }
      updateData.status = data.status;
    }

    if (data.planId && data.planId !== currentSubscription.planId) {
      // Handle plan change (upgrade/downgrade)
      const newPlan = await plansService.getPlanById(data.planId);
      
      // TODO: Implement upgrade/downgrade logic
      // - Calculate prorated charges
      // - Process payment difference
      // - Update billing cycle if needed
      
      updateData.planId = data.planId;
    }

    const subscription = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: updateData,
      include: {
        plan: true,
      },
    });

    // Log audit event
    await auditService.logSubscriptionAction(
      userId,
      'subscription_updated',
      subscription.id,
      {
        changes: data,
        previousStatus: currentSubscription.status,
        newStatus: subscription.status,
      }
    );

    return subscription;
  }

  async cancelSubscription(subscriptionId: string, userId: string): Promise<void> {
    // Get current subscription
    const subscription = await this.getSubscriptionById(subscriptionId, userId);

    if (subscription.status !== 'ACTIVE') {
      throw new AppError('Can only cancel active subscriptions', 400);
    }

    // TODO: Business logic for cancellation
    // - Handle immediate vs end-of-period cancellation
    // - Process refunds if applicable
    // - Cancel recurring payments
    // - Handle data retention policies

    await prisma.subscription.update({
      where: { id: subscriptionId },
      data: { 
        status: 'CANCELLED',
        autoRenew: false,
      },
    });

    // Log audit event
    await auditService.logSubscriptionAction(
      userId,
      'subscription_cancelled',
      subscriptionId,
      {
        planName: subscription.plan?.name,
        cancellationDate: new Date(),
      }
    );

    // TODO: Send cancellation notifications
    // - Cancellation confirmation email
    // - Feedback survey
    // - Retention offers
  }

  async renewSubscription(subscriptionId: string, userId: string): Promise<SubscriptionModel> {
    // Get current subscription
    const subscription = await this.getSubscriptionById(subscriptionId, userId);

    if (subscription.status !== 'EXPIRED') {
      throw new AppError('Can only renew expired subscriptions', 400);
    }

    // TODO: Business logic for renewal
    // - Process payment for renewal
    // - Handle pricing changes since last renewal
    // - Apply renewal discounts
    // - Update usage quotas

    const plan = subscription.plan!;
    const newStartDate = new Date();
    const newEndDate = new Date();
    
    if (plan.billingCycle === 'MONTHLY') {
      newEndDate.setMonth(newEndDate.getMonth() + 1);
    } else {
      newEndDate.setFullYear(newEndDate.getFullYear() + 1);
    }

    // TODO: Process renewal payment here

    const renewedSubscription = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: 'ACTIVE',
        startDate: newStartDate,
        endDate: newEndDate,
        autoRenew: true,
      },
      include: {
        plan: true,
      },
    });

    // Log audit event
    await auditService.logSubscriptionAction(
      userId,
      'subscription_renewed',
      subscriptionId,
      {
        planName: plan.name,
        renewalDate: newStartDate,
        newEndDate,
      }
    );

    return renewedSubscription;
  }

  // TODO: Implement automated renewal process
  async processAutomaticRenewals(): Promise<void> {
    // Find subscriptions that need renewal (ending soon and auto-renew enabled)
    // Process payments
    // Update subscription dates
    // Handle payment failures
    // Send notifications
  }

  // TODO: Implement usage tracking
  async trackUsage(subscriptionId: string, metricName: string, value: number): Promise<void> {
    // Record usage metrics
    // Check against plan limits
    // Send alerts for usage thresholds
    // Generate usage reports
  }
}

export const subscriptionsService = new SubscriptionsService();