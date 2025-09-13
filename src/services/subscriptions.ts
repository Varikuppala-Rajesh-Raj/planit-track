import api from './api';

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: 'ACTIVE' | 'CANCELLED' | 'PAUSED' | 'EXPIRED';
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  plan: {
    id: string;
    name: string;
    price: number;
    billingCycle: string;
    tier: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubscriptionData {
  planId: string;
  autoRenew: boolean;
}

export interface UpdateSubscriptionData {
  planId?: string;
  autoRenew?: boolean;
  status?: 'ACTIVE' | 'CANCELLED' | 'PAUSED';
}

export const subscriptionsService = {
  async getSubscriptions(): Promise<Subscription[]> {
    const response = await api.get('/subscriptions');
    return response.data;
  },

  async getSubscription(id: string): Promise<Subscription> {
    const response = await api.get(`/subscriptions/${id}`);
    return response.data;
  },

  async createSubscription(data: CreateSubscriptionData): Promise<Subscription> {
    const response = await api.post('/subscriptions', data);
    return response.data;
  },

  async updateSubscription(id: string, data: UpdateSubscriptionData): Promise<Subscription> {
    const response = await api.put(`/subscriptions/${id}`, data);
    return response.data;
  },

  async cancelSubscription(id: string): Promise<void> {
    await api.delete(`/subscriptions/${id}`);
  },

  async renewSubscription(id: string): Promise<Subscription> {
    const response = await api.post(`/subscriptions/${id}/renew`);
    return response.data;
  },
};