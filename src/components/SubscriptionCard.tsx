import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, CreditCard, AlertCircle } from 'lucide-react';
import { Subscription } from '@/services/subscriptions';
import { format } from 'date-fns';

interface SubscriptionCardProps {
  subscription: Subscription;
  onUpgrade?: (subscription: Subscription) => void;
  onCancel?: (subscription: Subscription) => void;
  onRenew?: (subscription: Subscription) => void;
}

const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  subscription,
  onUpgrade,
  onCancel,
  onRenew,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-success text-success-foreground';
      case 'CANCELLED':
        return 'bg-destructive text-destructive-foreground';
      case 'PAUSED':
        return 'bg-warning text-warning-foreground';
      case 'EXPIRED':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const formatPrice = (price: number, cycle: string) => {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
    
    return cycle === 'MONTHLY' ? `${formatted}/mo` : `${formatted}/yr`;
  };

  const isExpiringSoon = () => {
    const endDate = new Date(subscription.endDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  };

  return (
    <Card className="transition-all duration-300 hover:shadow-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">{subscription.plan.name}</CardTitle>
          <Badge className={getStatusColor(subscription.status)}>
            {subscription.status}
          </Badge>
        </div>
        <CardDescription>
          {formatPrice(subscription.plan.price, subscription.plan.billingCycle)}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>
            {format(new Date(subscription.startDate), 'MMM dd, yyyy')} - {format(new Date(subscription.endDate), 'MMM dd, yyyy')}
          </span>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <CreditCard className="h-4 w-4" />
          <span>Auto-renew: {subscription.autoRenew ? 'Enabled' : 'Disabled'}</span>
        </div>

        {isExpiringSoon() && subscription.status === 'ACTIVE' && (
          <div className="flex items-center space-x-2 text-sm text-warning bg-warning/10 p-2 rounded-md">
            <AlertCircle className="h-4 w-4" />
            <span>Expires soon! Consider renewing.</span>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex space-x-2">
        {subscription.status === 'ACTIVE' && (
          <>
            <Button variant="outline" size="sm" onClick={() => onUpgrade?.(subscription)}>
              Upgrade
            </Button>
            <Button variant="destructive" size="sm" onClick={() => onCancel?.(subscription)}>
              Cancel
            </Button>
          </>
        )}
        
        {subscription.status === 'EXPIRED' && !subscription.autoRenew && (
          <Button className="w-full" onClick={() => onRenew?.(subscription)}>
            Renew
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default SubscriptionCard;