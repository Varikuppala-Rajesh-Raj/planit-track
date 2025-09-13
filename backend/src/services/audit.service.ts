import { prisma } from '../db/prisma';
import { logger } from '../utils/logger';

interface AuditLogData {
  actorId: string;
  action: string;
  targetType: string;
  targetId?: string;
  subscriptionId?: string;
  metadata?: Record<string, any>;
}

export class AuditService {
  async log(data: AuditLogData): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          actorId: data.actorId,
          action: data.action,
          targetType: data.targetType,
          targetId: data.targetId,
          subscriptionId: data.subscriptionId,
          metadata: data.metadata || {},
        },
      });

      logger.info('Audit log created', data);
    } catch (error) {
      logger.error('Failed to create audit log:', error);
      // Don't throw error - audit logging should not break main functionality
    }
  }

  async getAuditLogs(filters?: {
    actorId?: string;
    action?: string;
    targetType?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }) {
    const where: any = {};

    if (filters?.actorId) where.actorId = filters.actorId;
    if (filters?.action) where.action = filters.action;
    if (filters?.targetType) where.targetType = filters.targetType;
    if (filters?.startDate || filters?.endDate) {
      where.timestamp = {};
      if (filters.startDate) where.timestamp.gte = filters.startDate;
      if (filters.endDate) where.timestamp.lte = filters.endDate;
    }

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

  // Helper methods for common audit actions
  async logSubscriptionAction(
    actorId: string,
    action: 'subscription_created' | 'subscription_updated' | 'subscription_cancelled' | 'subscription_renewed',
    subscriptionId: string,
    metadata?: Record<string, any>
  ) {
    await this.log({
      actorId,
      action,
      targetType: 'subscription',
      targetId: subscriptionId,
      subscriptionId,
      metadata,
    });
  }

  async logPlanAction(
    actorId: string,
    action: 'plan_created' | 'plan_updated' | 'plan_deleted',
    planId: string,
    metadata?: Record<string, any>
  ) {
    await this.log({
      actorId,
      action,
      targetType: 'plan',
      targetId: planId,
      metadata,
    });
  }
}

export const auditService = new AuditService();