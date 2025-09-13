import { prisma } from '../db/prisma';

export interface AnalyticsData {
  revenue: {
    total: number;
    monthly: number;
    growth: number;
  };
  subscriptions: {
    active: number;
    cancelled: number;
    total: number;
    growth: number;
  };
  plans: {
    mostPopular: Array<{
      planName: string;
      subscriptionCount: number;
      revenue: number;
    }>;
  };
  users: {
    total: number;
    newThisMonth: number;
  };
}

export class AdminService {
  async getAnalytics(startDate?: Date, endDate?: Date): Promise<AnalyticsData> {
    // Default to last 30 days if no dates provided
    const end = endDate || new Date();
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // TODO: Implement comprehensive analytics
    // - Revenue calculations with accurate financial data
    // - User acquisition metrics
    // - Churn rate analysis
    // - Cohort analysis
    // - Conversion funnel metrics

    // Get basic metrics (placeholder implementation)
    const [
      totalSubscriptions,
      activeSubscriptions,
      cancelledSubscriptions,
      totalUsers,
      newUsers,
      planStats,
    ] = await Promise.all([
      prisma.subscription.count(),
      prisma.subscription.count({ where: { status: 'ACTIVE' } }),
      prisma.subscription.count({ where: { status: 'CANCELLED' } }),
      prisma.user.count(),
      prisma.user.count({
        where: {
          createdAt: {
            gte: start,
            lte: end,
          },
        },
      }),
      this.getPlanAnalytics(),
    ]);

    // TODO: Calculate actual revenue from payment records
    const estimatedRevenue = await this.calculateRevenue(start, end);

    return {
      revenue: {
        total: estimatedRevenue.total,
        monthly: estimatedRevenue.monthly,
        growth: estimatedRevenue.growth,
      },
      subscriptions: {
        active: activeSubscriptions,
        cancelled: cancelledSubscriptions,
        total: totalSubscriptions,
        growth: 12, // TODO: Calculate actual growth rate
      },
      plans: {
        mostPopular: planStats,
      },
      users: {
        total: totalUsers,
        newThisMonth: newUsers,
      },
    };
  }

  private async calculateRevenue(startDate: Date, endDate: Date) {
    // TODO: Implement proper revenue calculation
    // - Sum actual payments from payment records
    // - Handle refunds and chargebacks
    // - Calculate MRR and ARR
    // - Account for different billing cycles

    // Placeholder calculation based on active subscriptions
    const subscriptions = await prisma.subscription.findMany({
      where: {
        status: 'ACTIVE',
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        plan: true,
      },
    });

    const monthlyRevenue = subscriptions.reduce((total, sub) => {
      const monthlyAmount = sub.plan.billingCycle === 'YEARLY' 
        ? sub.plan.price / 12 
        : sub.plan.price;
      return total + monthlyAmount;
    }, 0);

    return {
      total: monthlyRevenue * 12, // Annualized
      monthly: monthlyRevenue,
      growth: 15.5, // TODO: Calculate actual growth
    };
  }

  private async getPlanAnalytics() {
    const plans = await prisma.plan.findMany({
      include: {
        _count: {
          select: { subscriptions: true },
        },
        subscriptions: {
          where: { status: 'ACTIVE' },
          select: { plan: { select: { price: true, billingCycle: true } } },
        },
      },
      orderBy: {
        subscriptions: {
          _count: 'desc',
        },
      },
      take: 5,
    });

    return plans.map(plan => ({
      planName: plan.name,
      subscriptionCount: plan._count.subscriptions,
      revenue: plan.subscriptions.reduce((total, sub) => {
        return total + sub.plan.price;
      }, 0),
    }));
  }

  async getAuditLogs(filters?: {
    startDate?: Date;
    endDate?: Date;
    action?: string;
    actorId?: string;
    limit?: number;
    offset?: number;
  }) {
    const where: any = {};

    if (filters?.startDate || filters?.endDate) {
      where.timestamp = {};
      if (filters.startDate) where.timestamp.gte = filters.startDate;
      if (filters.endDate) where.timestamp.lte = filters.endDate;
    }

    if (filters?.action) where.action = filters.action;
    if (filters?.actorId) where.actorId = filters.actorId;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          actor: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { timestamp: 'desc' },
        take: filters?.limit || 50,
        skip: filters?.offset || 0,
      }),
      prisma.auditLog.count({ where }),
    ]);

    return { logs, total };
  }

  async getUserMetrics() {
    // TODO: Implement detailed user metrics
    // - User lifetime value
    // - Churn prediction
    // - User engagement scores
    // - Geographic distribution
    // - Usage patterns

    const [
      totalUsers,
      activeUsers,
      usersByRole,
      userGrowth,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: {
          subscriptions: {
            some: { status: 'ACTIVE' },
          },
        },
      }),
      prisma.user.groupBy({
        by: ['role'],
        _count: { role: true },
      }),
      this.getUserGrowthMetrics(),
    ]);

    return {
      total: totalUsers,
      active: activeUsers,
      byRole: usersByRole,
      growth: userGrowth,
    };
  }

  private async getUserGrowthMetrics() {
    // TODO: Implement sophisticated growth analysis
    // - Monthly active users
    // - User retention rates
    // - Cohort analysis
    // - Segmentation analysis

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

    const [lastMonth, previousMonth] = await Promise.all([
      prisma.user.count({
        where: {
          createdAt: { gte: thirtyDaysAgo },
        },
      }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: sixtyDaysAgo,
            lt: thirtyDaysAgo,
          },
        },
      }),
    ]);

    const growthRate = previousMonth > 0 
      ? ((lastMonth - previousMonth) / previousMonth) * 100 
      : 0;

    return {
      lastMonth,
      previousMonth,
      growthRate,
    };
  }
}

export const adminService = new AdminService();