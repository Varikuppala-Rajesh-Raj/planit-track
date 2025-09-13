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
        'relative transition-all duration-300 hover:shadow-elegant hover:-translate-y-1 group border-2',
        isPopular && 'border-primary shadow-glow scale-105',
        currentPlan && 'bg-gradient-card border-success',
        !isPopular && !currentPlan && 'border-border hover:border-primary/50'
      )}
    >
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
          <Badge className="bg-gradient-primary text-primary-foreground px-4 py-1 text-sm font-semibold shadow-lg">
            Most Popular
          </Badge>
        </div>
      )}
      
      <CardHeader className="text-center pb-6 pt-8">
        <div className="w-16 h-16 bg-gradient-primary rounded-2xl mx-auto mb-4 flex items-center justify-center">
          <span className="text-2xl font-bold text-white">{plan.tier[0]}</span>
        </div>
        <CardTitle className="text-3xl font-bold">{plan.name}</CardTitle>
        <CardDescription className="text-muted-foreground text-lg leading-relaxed">
          {plan.description}
        </CardDescription>
        <div className="mt-6">
          <div className="flex items-baseline justify-center gap-2">
            <span className="text-5xl font-bold">{formatPrice(plan.price, plan.billingCycle).split('/')[0]}</span>
            <span className="text-muted-foreground text-lg">
              /{plan.billingCycle === 'MONTHLY' ? 'month' : 'year'}
            </span>
          </div>
          <Badge 
            variant="outline" 
            className={cn(
              'mt-3 border-2',
              plan.tier === 'BASIC' && 'border-tier-basic text-tier-basic',
              plan.tier === 'PRO' && 'border-tier-pro text-tier-pro',
              plan.tier === 'ENTERPRISE' && 'border-tier-enterprise text-tier-enterprise'
            )}
          >
            {plan.tier}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 px-6">
        {plan.features.map((feature, index) => (
          <div key={index} className="flex items-start space-x-3">
            <Check className={cn(
              'h-5 w-5 flex-shrink-0 mt-0.5',
              plan.tier === 'BASIC' && 'text-tier-basic',
              plan.tier === 'PRO' && 'text-tier-pro',
              plan.tier === 'ENTERPRISE' && 'text-tier-enterprise'
            )} />
            <span className="text-base leading-relaxed">{feature}</span>
          </div>
        ))}
      </CardContent>
      
      <CardFooter className="pt-6">
        <Button
          className={cn(
            'w-full h-12 text-base font-semibold',
            isPopular && 'bg-gradient-primary hover:opacity-90 shadow-glow',
            currentPlan && 'opacity-60 cursor-not-allowed bg-success'
          )}
          onClick={() => onSelect?.(plan)}
          disabled={currentPlan}
          variant={isPopular ? 'premium' : currentPlan ? 'default' : 'outline'}
          size="lg"
        >
          {currentPlan ? 'Current Plan' : 'Select Plan'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PlanCard;