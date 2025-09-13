import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { Plan } from '@/services/plans';
import { cn } from '@/lib/utils';

interface PlanCardProps {
  plan: Plan;
  onSelect?: (plan: Plan) => void;
  isPopular?: boolean;
  currentPlan?: boolean;
}

const PlanCard: React.FC<PlanCardProps> = ({ plan, onSelect, isPopular, currentPlan }) => {
  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'BASIC':
        return 'tier-basic';
      case 'PRO':
        return 'tier-pro';
      case 'ENTERPRISE':
        return 'tier-enterprise';
      default:
        return 'primary';
    }
  };

  const formatPrice = (price: number, cycle: string) => {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
    
    return cycle === 'MONTHLY' ? `${formatted}/mo` : `${formatted}/yr`;
  };

  return (
    <Card
      className={cn(
        'relative transition-all duration-300 hover:shadow-elegant',
        isPopular && 'border-primary shadow-glow',
        currentPlan && 'bg-gradient-card'
      )}
    >
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-gradient-primary text-primary-foreground">Most Popular</Badge>
        </div>
      )}
      
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl">{plan.name}</CardTitle>
        <CardDescription className="text-muted-foreground">{plan.description}</CardDescription>
        <div className="mt-4">
          <span className="text-4xl font-bold">{formatPrice(plan.price, plan.billingCycle)}</span>
          <Badge variant="outline" className={`ml-2 border-${getTierColor(plan.tier)}`}>
            {plan.tier}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {plan.features.map((feature, index) => (
          <div key={index} className="flex items-center space-x-2">
            <Check className={`h-4 w-4 text-${getTierColor(plan.tier)} flex-shrink-0`} />
            <span className="text-sm">{feature}</span>
          </div>
        ))}
      </CardContent>
      
      <CardFooter>
        <Button
          className={cn(
            'w-full',
            isPopular && 'bg-gradient-primary hover:opacity-90',
            currentPlan && 'opacity-60 cursor-not-allowed'
          )}
          onClick={() => onSelect?.(plan)}
          disabled={currentPlan}
          variant={isPopular ? 'default' : 'outline'}
        >
          {currentPlan ? 'Current Plan' : 'Select Plan'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PlanCard;