import { Request, Response, NextFunction } from 'express';
import { adminService } from '../services/admin.service';
import { AppError } from '../middleware/error.middleware';

export class AdminController {
  async getAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('User not authenticated', 401);
      }

      const { startDate, endDate } = req.query;

      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;

      const analytics = await adminService.getAnalytics(start, end);

      res.json({
        success: true,
        data: analytics,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAuditLogs(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('User not authenticated', 401);
      }

      const {
        startDate,
        endDate,
        action,
        actorId,
        limit = '50',
        offset = '0',
      } = req.query;

      const filters = {
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        action: action as string,
        actorId: actorId as string,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      };

      const result = await adminService.getAuditLogs(filters);

      res.json({
        success: true,
        data: result.logs,
        pagination: {
          total: result.total,
          limit: filters.limit,
          offset: filters.offset,
          pages: Math.ceil(result.total / filters.limit),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserMetrics(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('User not authenticated', 401);
      }

      const metrics = await adminService.getUserMetrics();

      res.json({
        success: true,
        data: metrics,
      });
    } catch (error) {
      next(error);
    }
  }

  async getSystemHealth(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('User not authenticated', 401);
      }

      // TODO: Implement system health checks
      // - Database connectivity
      // - External service status
      // - Performance metrics
      // - Error rates
      // - Memory and CPU usage

      const health = {
        status: 'healthy',
        timestamp: new Date(),
        services: {
          database: 'connected',
          redis: 'not_configured', // TODO: Add Redis
          email: 'not_configured', // TODO: Add email service
          payment: 'not_configured', // TODO: Add payment processor
        },
        metrics: {
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          cpu: process.cpuUsage(),
        },
      };

      res.json({
        success: true,
        data: health,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const adminController = new AdminController();