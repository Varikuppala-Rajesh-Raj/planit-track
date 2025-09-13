import React, { useEffect, useState } from 'react';
import { Subscription, subscriptionsService } from '@/services/subscriptions';
import SubscriptionCard from '@/components/SubscriptionCard';
import Modal from '@/components/Modal';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const Dashboard: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelModal, setCancelModal] = useState<Subscription | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const data = await subscriptionsService.getSubscriptions();
      setSubscriptions(data);
    } catch (error) {
      console.error('Failed to fetch subscriptions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load subscriptions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (subscription: Subscription) => {
    try {
      await subscriptionsService.cancelSubscription(subscription.id);
      await fetchSubscriptions();
      toast({
        title: 'Success',
        description: 'Subscription cancelled successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to cancel subscription',
        variant: 'destructive',
      });
    }
    setCancelModal(null);
  };

  const handleRenew = async (subscription: Subscription) => {
    try {
      await subscriptionsService.renewSubscription(subscription.id);
      await fetchSubscriptions();
      toast({
        title: 'Success',
        description: 'Subscription renewed successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to renew subscription',
        variant: 'destructive',
      });
    }
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
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {user?.name}</p>
          </div>
          
          <Button asChild>
            <Link to="/">
              <Plus className="mr-2 h-4 w-4" />
              Browse Plans
            </Link>
          </Button>
        </div>

        <div className="grid gap-8">
          <section>
            <div className="flex items-center mb-6">
              <CreditCard className="mr-2 h-5 w-5" />
              <h2 className="text-2xl font-semibold">Your Subscriptions</h2>
            </div>

            {subscriptions.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-muted rounded-lg">
                <CreditCard className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No subscriptions yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start by choosing a plan that fits your needs.
                </p>
                <Button asChild>
                  <Link to="/">Browse Plans</Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subscriptions.map((subscription) => (
                  <SubscriptionCard
                    key={subscription.id}
                    subscription={subscription}
                    onUpgrade={(sub) => {
                      // Navigate to plans page with upgrade context
                      // TODO: Implement upgrade flow
                      toast({
                        title: 'Coming Soon',
                        description: 'Upgrade functionality will be implemented',
                      });
                    }}
                    onCancel={(sub) => setCancelModal(sub)}
                    onRenew={handleRenew}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={!!cancelModal}
        onClose={() => setCancelModal(null)}
        title="Cancel Subscription"
        description="Are you sure you want to cancel this subscription? This action cannot be undone."
        onConfirm={() => cancelModal && handleCancel(cancelModal)}
        confirmText="Cancel Subscription"
        confirmVariant="destructive"
        onCancel={() => setCancelModal(null)}
      >
        {cancelModal && (
          <div className="space-y-2">
            <p className="font-medium">{cancelModal.plan.name}</p>
            <p className="text-sm text-muted-foreground">
              Your subscription will remain active until the end of your billing period.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Dashboard;