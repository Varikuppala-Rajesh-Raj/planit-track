import api from './api';

export interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  billingCycle: 'MONTHLY' | 'YEARLY';
  features: string[];
  tier: 'BASIC' | 'PRO' | 'ENTERPRISE';
  isActive: boolean;
  createdAt: string;
}

export interface CreatePlanData {
  name: string;
  description: string;
  price: number;
  billingCycle: 'MONTHLY' | 'YEARLY';
  features: string[];
  tier: 'BASIC' | 'PRO' | 'ENTERPRISE';
}

export const plansService = {
  async getPlans(): Promise<Plan[]> {
    const response = await api.get('/plans');
    return response.data;
  },

  async getPlan(id: string): Promise<Plan> {
    const response = await api.get(`/plans/${id}`);
    return response.data;
  },

  async createPlan(data: CreatePlanData): Promise<Plan> {
    const response = await api.post('/plans', data);
    return response.data;
  },

  async updatePlan(id: string, data: Partial<CreatePlanData>): Promise<Plan> {
    const response = await api.put(`/plans/${id}`, data);
    return response.data;
  },

  async deletePlan(id: string): Promise<void> {
    await api.delete(`/plans/${id}`);
  },
};