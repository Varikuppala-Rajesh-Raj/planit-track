import * as XLSX from 'xlsx';
import { PrismaClient } from '@prisma/client';
import { config } from '../config';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

interface DatasetRow {
  // TODO: Define the structure based on your actual Excel file
  // This is a placeholder structure - adjust based on actual dataset
  plan_name?: string;
  plan_description?: string;
  plan_price?: number;
  plan_billing_cycle?: string;
  plan_tier?: string;
  plan_features?: string;
  user_email?: string;
  user_name?: string;
  subscription_status?: string;
  subscription_start_date?: string;
  subscription_end_date?: string;
  [key: string]: any;
}

async function importDataset() {
  try {
    logger.info(`Starting dataset import from: ${config.dataset.path}`);

    // Read Excel file
    const workbook = XLSX.readFile(config.dataset.path);
    const sheetName = workbook.SheetNames[0]; // Use first sheet
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const data: DatasetRow[] = XLSX.utils.sheet_to_json(worksheet);
    
    logger.info(`Found ${data.length} rows in dataset`);

    // Process plans
    const uniquePlans = new Map<string, any>();
    const uniqueUsers = new Map<string, any>();
    const subscriptions: any[] = [];

    for (const row of data) {
      // Extract plan information
      if (row.plan_name && !uniquePlans.has(row.plan_name)) {
        uniquePlans.set(row.plan_name, {
          name: row.plan_name,
          description: row.plan_description || 'Imported from dataset',
          price: parseFloat(row.plan_price?.toString() || '0'),
          billingCycle: (row.plan_billing_cycle?.toUpperCase() === 'YEARLY') ? 'YEARLY' : 'MONTHLY',
          tier: (row.plan_tier?.toUpperCase() as 'BASIC' | 'PRO' | 'ENTERPRISE') || 'BASIC',
          features: row.plan_features ? row.plan_features.split(',').map((f: string) => f.trim()) : [],
        });
      }

      // Extract user information
      if (row.user_email && !uniqueUsers.has(row.user_email)) {
        uniqueUsers.set(row.user_email, {
          email: row.user_email,
          name: row.user_name || 'Dataset User',
          password: '$2a$10$default.hashed.password', // TODO: Generate proper hash
          role: 'USER',
        });
      }

      // Extract subscription information
      if (row.user_email && row.plan_name) {
        subscriptions.push({
          userEmail: row.user_email,
          planName: row.plan_name,
          status: (row.subscription_status?.toUpperCase() as 'ACTIVE' | 'CANCELLED' | 'PAUSED' | 'EXPIRED') || 'ACTIVE',
          startDate: row.subscription_start_date ? new Date(row.subscription_start_date) : new Date(),
          endDate: row.subscription_end_date ? new Date(row.subscription_end_date) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          autoRenew: true,
        });
      }
    }

    // Insert plans
    logger.info(`Importing ${uniquePlans.size} unique plans...`);
    for (const [planName, planData] of uniquePlans) {
      await prisma.plan.upsert({
        where: { name: planName },
        update: planData,
        create: planData,
      });
    }

    // Insert users
    logger.info(`Importing ${uniqueUsers.size} unique users...`);
    for (const [userEmail, userData] of uniqueUsers) {
      await prisma.user.upsert({
        where: { email: userEmail },
        update: {},
        create: userData,
      });
    }

    // Insert subscriptions
    logger.info(`Importing ${subscriptions.length} subscriptions...`);
    for (const subData of subscriptions) {
      const user = await prisma.user.findUnique({
        where: { email: subData.userEmail },
      });
      
      const plan = await prisma.plan.findFirst({
        where: { name: subData.planName },
      });

      if (user && plan) {
        // Check if subscription already exists
        const existingSubscription = await prisma.subscription.findFirst({
          where: {
            userId: user.id,
            planId: plan.id,
          },
        });

        if (!existingSubscription) {
          await prisma.subscription.create({
            data: {
              userId: user.id,
              planId: plan.id,
              status: subData.status,
              startDate: subData.startDate,
              endDate: subData.endDate,
              autoRenew: subData.autoRenew,
            },
          });
        }
      }
    }

    logger.info('Dataset import completed successfully');
    
  } catch (error) {
    logger.error('Dataset import failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the import if this file is executed directly
if (require.main === module) {
  importDataset()
    .catch((error) => {
      logger.error('Import script failed:', error);
      process.exit(1);
    });
}

export { importDataset };