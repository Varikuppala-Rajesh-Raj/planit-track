import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

// Create Prisma client instance
export const prisma = new PrismaClient({
  log: [
    { level: 'warn', emit: 'event' },
    { level: 'info', emit: 'event' },
    { level: 'error', emit: 'event' },
  ],
});

// Log Prisma events
prisma.$on('warn', (e) => {
  logger.warn('Prisma warning', e);
});

prisma.$on('info', (e) => {
  logger.info('Prisma info', e);
});

prisma.$on('error', (e) => {
  logger.error('Prisma error', e);
});

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default prisma;