import { z } from 'zod';

// User schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const signupSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(1, 'Name is required'),
});

// Plan schemas
export const createPlanSchema = z.object({
  name: z.string().min(1, 'Plan name is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.number().min(0, 'Price must be positive'),
  billingCycle: z.enum(['MONTHLY', 'YEARLY']),
  features: z.array(z.string()).min(1, 'At least one feature is required'),
  tier: z.enum(['BASIC', 'PRO', 'ENTERPRISE']),
});

export const updatePlanSchema = createPlanSchema.partial();

// Subscription schemas
export const createSubscriptionSchema = z.object({
  planId: z.string().min(1, 'Plan ID is required'),
  autoRenew: z.boolean().default(true),
});

export const updateSubscriptionSchema = z.object({
  planId: z.string().optional(),
  autoRenew: z.boolean().optional(),
  status: z.enum(['ACTIVE', 'CANCELLED', 'PAUSED']).optional(),
});

// Request/Response types
export type LoginRequest = z.infer<typeof loginSchema>;
export type SignupRequest = z.infer<typeof signupSchema>;
export type CreatePlanRequest = z.infer<typeof createPlanSchema>;
export type UpdatePlanRequest = z.infer<typeof updatePlanSchema>;
export type CreateSubscriptionRequest = z.infer<typeof createSubscriptionSchema>;
export type UpdateSubscriptionRequest = z.infer<typeof updateSubscriptionSchema>;

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Database model types (simplified)
export interface UserModel {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
  createdAt: Date;
  updatedAt: Date;
}

export interface PlanModel {
  id: string;
  name: string;
  description: string;
  price: number;
  billingCycle: 'MONTHLY' | 'YEARLY';
  features: string[];
  tier: 'BASIC' | 'PRO' | 'ENTERPRISE';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionModel {
  id: string;
  userId: string;
  planId: string;
  status: 'ACTIVE' | 'CANCELLED' | 'PAUSED' | 'EXPIRED';
  startDate: Date;
  endDate: Date;
  autoRenew: boolean;
  createdAt: Date;
  updatedAt: Date;
  user?: UserModel;
  plan?: PlanModel;
}