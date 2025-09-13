import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plan, plansService } from '@/services/plans';
import { subscriptionsService } from '@/services/subscriptions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { CreditCard, Lock, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Checkout: React.FC = () => {
  const { planId } = useParams<{ planId: string }>();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [autoRenew, setAutoRenew] = useState(true);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (planId) {
      fetchPlan(planId);
    }
  }, [planId]);

  const fetchPlan = async (id: string) => {
    try {
      const planData = await plansService.getPlan(id);
      setPlan(planData);
    } catch (error) {
      console.error('Failed to fetch plan:', error);
      toast({
        title: 'Error',
        description: 'Plan not found',
        variant: 'destructive',
      });
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (!plan) return;

    setProcessing(true);
    try {
      // TODO: Integrate with real payment processor
      await subscriptionsService.createSubscription({
        planId: plan.id,
        autoRenew,
      });

      toast({
        title: 'Success!',
        description: 'Subscription created successfully',
      });

      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create subscription',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Plan not found</h1>
          <Button onClick={() => navigate('/')}>Back to Plans</Button>
        </div>
      </div>
    );
  }

  const formatPrice = (price: number, cycle: string) => {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
    
    return cycle === 'MONTHLY' ? `${formatted}/mo` : `${formatted}/yr`;
  };

  const tax = plan.price * 0.1; // 10% tax (placeholder)
  const total = plan.price + tax;

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Complete Your Subscription</h1>
          <p className="text-muted-foreground">Review and confirm your plan selection</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Plan Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {plan.name}
                <Badge>{plan.tier}</Badge>
              </CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl font-bold">
                {formatPrice(plan.price, plan.billingCycle)}
              </div>
              
              <div className="space-y-2">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-success flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center space-x-2 pt-4">
                <Switch
                  id="auto-renew"
                  checked={autoRenew}
                  onCheckedChange={setAutoRenew}
                />
                <Label htmlFor="auto-renew" className="text-sm">
                  Enable auto-renewal
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Payment Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="mr-2 h-5 w-5" />
                Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Order Summary */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(plan.price, plan.billingCycle)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Simulated Payment Form */}
              <div className="space-y-4 p-4 bg-muted/50 rounded-lg border-2 border-dashed">
                <div className="text-center">
                  <Lock className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    This is a demo checkout. No real payment will be processed.
                  </p>
                </div>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handleSubscribe}
                disabled={processing}
              >
                {processing ? 'Processing...' : `Subscribe for ${formatPrice(plan.price, plan.billingCycle)}`}
              </Button>

              <div className="text-xs text-muted-foreground text-center">
                By subscribing, you agree to our Terms of Service and Privacy Policy.
                {autoRenew && ' Your subscription will renew automatically.'}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Checkout;