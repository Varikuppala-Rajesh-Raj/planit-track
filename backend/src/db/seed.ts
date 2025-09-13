import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

async function main() {
  logger.info('Starting database seed...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  // Create test user
  const userPassword = await bcrypt.hash('user123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      name: 'Test User',
      password: userPassword,
      role: 'USER',
    },
  });

  // Create sample plans
  const basicPlan = await prisma.plan.upsert({
    where: { id: 'basic-plan' },
    update: {},
    create: {
      id: 'basic-plan',
      name: 'Basic Plan',
      description: 'Perfect for individuals getting started',
      price: 9.99,
      billingCycle: 'MONTHLY',
      tier: 'BASIC',
      features: [
        'Up to 5 projects',
        '10GB storage',
        'Email support',
        'Basic analytics',
      ],
    },
  });

  const proPlan = await prisma.plan.upsert({
    where: { id: 'pro-plan' },
    update: {},
    create: {
      id: 'pro-plan',
      name: 'Pro Plan',
      description: 'Ideal for growing teams and businesses',
      price: 29.99,
      billingCycle: 'MONTHLY',
      tier: 'PRO',
      features: [
        'Unlimited projects',
        '100GB storage',
        'Priority support',
        'Advanced analytics',
        'Team collaboration',
        'API access',
      ],
    },
  });

  const enterprisePlan = await prisma.plan.upsert({
    where: { id: 'enterprise-plan' },
    update: {},
    create: {
      id: 'enterprise-plan',
      name: 'Enterprise Plan',
      description: 'For large organizations with custom needs',
      price: 99.99,
      billingCycle: 'MONTHLY',
      tier: 'ENTERPRISE',
      features: [
        'Everything in Pro',
        'Unlimited storage',
        '24/7 phone support',
        'Custom integrations',
        'Advanced security',
        'Dedicated account manager',
        'SLA guarantee',
      ],
    },
  });

  // Create sample subscription for test user
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + 1); // 1 month from now

  await prisma.subscription.upsert({
    where: { id: 'test-subscription' },
    update: {},
    create: {
      id: 'test-subscription',
      userId: user.id,
      planId: basicPlan.id,
      status: 'ACTIVE',
      startDate: new Date(),
      endDate,
      autoRenew: true,
    },
  });

  // Create sample discount
  const validTo = new Date();
  validTo.setMonth(validTo.getMonth() + 3); // 3 months from now

  await prisma.discount.upsert({
    where: { code: 'WELCOME20' },
    update: {},
    create: {
      code: 'WELCOME20',
      name: 'Welcome Discount',
      description: '20% off for new customers',
      type: 'PERCENTAGE',
      value: 20,
      validFrom: new Date(),
      validTo,
    },
  });

  logger.info('Database seeded successfully');
  logger.info(`Admin: admin@example.com / admin123`);
  logger.info(`User: user@example.com / user123`);
}

main()
  .catch((e) => {
    logger.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });