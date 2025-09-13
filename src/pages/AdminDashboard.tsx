import React, { useEffect, useState } from 'react';
import { Plan, plansService, CreatePlanData } from '@/services/plans';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import Modal from '@/components/Modal';
import { Plus, Edit, Trash2, Users, DollarSign, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AdminDashboard: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deletingPlan, setDeletingPlan] = useState<Plan | null>(null);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState<CreatePlanData>({
    name: '',
    description: '',
    price: 0,
    billingCycle: 'MONTHLY',
    features: [],
    tier: 'BASIC',
  });
  const [featuresText, setFeaturesText] = useState('');

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const data = await plansService.getPlans();
      setPlans(data);
    } catch (error) {
      console.error('Failed to fetch plans:', error);
      toast({
        title: 'Error',
        description: 'Failed to load plans',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = async () => {
    try {
      const planData = {
        ...formData,
        features: featuresText.split('\n').filter(f => f.trim()),
      };
      await plansService.createPlan(planData);
      await fetchPlans();
      resetForm();
      setShowCreateModal(false);
      toast({
        title: 'Success',
        description: 'Plan created successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create plan',
        variant: 'destructive',
      });
    }
  };

  const handleUpdatePlan = async () => {
    if (!editingPlan) return;

    try {
      const planData = {
        ...formData,
        features: featuresText.split('\n').filter(f => f.trim()),
      };
      await plansService.updatePlan(editingPlan.id, planData);
      await fetchPlans();
      resetForm();
      setEditingPlan(null);
      toast({
        title: 'Success',
        description: 'Plan updated successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update plan',
        variant: 'destructive',
      });
    }
  };

  const handleDeletePlan = async () => {
    if (!deletingPlan) return;

    try {
      await plansService.deletePlan(deletingPlan.id);
      await fetchPlans();
      setDeletingPlan(null);
      toast({
        title: 'Success',
        description: 'Plan deleted successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete plan',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      billingCycle: 'MONTHLY',
      features: [],
      tier: 'BASIC',
    });
    setFeaturesText('');
  };

  const openEditModal = (plan: Plan) => {
    setFormData({
      name: plan.name,
      description: plan.description,
      price: plan.price,
      billingCycle: plan.billingCycle,
      features: plan.features,
      tier: plan.tier,
    });
    setFeaturesText(plan.features.join('\n'));
    setEditingPlan(plan);
  };

  const formatPrice = (price: number, cycle: string) => {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
    
    return cycle === 'MONTHLY' ? `${formatted}/mo` : `${formatted}/yr`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage subscription plans and analytics</p>
          </div>
        </div>

        {/* Analytics Cards - Placeholder */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$12,345</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Subscribers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,234</div>
              <p className="text-xs text-muted-foreground">+8% from last month</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">15.3%</div>
              <p className="text-xs text-muted-foreground">+2.1% from last month</p>
            </CardContent>
          </Card>
        </div>

        {/* Plans Management */}
        <div className="grid gap-8">
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">Subscription Plans</h2>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Plan
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <Card key={plan.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{plan.name}</CardTitle>
                      <Badge>{plan.tier}</Badge>
                    </div>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="text-2xl font-bold">
                      {formatPrice(plan.price, plan.billingCycle)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      {plan.features.slice(0, 3).map((feature, index) => (
                        <div key={index} className="text-sm">{feature}</div>
                      ))}
                      {plan.features.length > 3 && (
                        <div className="text-sm text-muted-foreground">
                          +{plan.features.length - 3} more features
                        </div>
                      )}
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => openEditModal(plan)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeletingPlan(plan)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Create/Edit Plan Modal */}
      <Modal
        isOpen={showCreateModal || !!editingPlan}
        onClose={() => {
          setShowCreateModal(false);
          setEditingPlan(null);
          resetForm();
        }}
        title={editingPlan ? 'Edit Plan' : 'Create New Plan'}
        onConfirm={editingPlan ? handleUpdatePlan : handleCreatePlan}
        confirmText={editingPlan ? 'Update Plan' : 'Create Plan'}
        onCancel={() => {
          setShowCreateModal(false);
          setEditingPlan(null);
          resetForm();
        }}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Plan Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter plan name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter plan description"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="billing-cycle">Billing Cycle</Label>
              <Select
                value={formData.billingCycle}
                onValueChange={(value: 'MONTHLY' | 'YEARLY') =>
                  setFormData({ ...formData, billingCycle: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MONTHLY">Monthly</SelectItem>
                  <SelectItem value="YEARLY">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tier">Tier</Label>
            <Select
              value={formData.tier}
              onValueChange={(value: 'BASIC' | 'PRO' | 'ENTERPRISE') =>
                setFormData({ ...formData, tier: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BASIC">Basic</SelectItem>
                <SelectItem value="PRO">Pro</SelectItem>
                <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="features">Features (one per line)</Label>
            <Textarea
              id="features"
              value={featuresText}
              onChange={(e) => setFeaturesText(e.target.value)}
              placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
              rows={4}
            />
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingPlan}
        onClose={() => setDeletingPlan(null)}
        title="Delete Plan"
        description="Are you sure you want to delete this plan? This action cannot be undone."
        onConfirm={handleDeletePlan}
        confirmText="Delete Plan"
        confirmVariant="destructive"
        onCancel={() => setDeletingPlan(null)}
      >
        {deletingPlan && (
          <div className="space-y-2">
            <p className="font-medium">{deletingPlan.name}</p>
            <p className="text-sm text-muted-foreground">
              This will permanently delete the plan and all associated data.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminDashboard;