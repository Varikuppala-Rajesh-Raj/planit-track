import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plan, plansService } from '@/services/plans';
import PlanCard from '@/components/PlanCard';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowRight, Star } from 'lucide-react';

const Home: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const planData = await plansService.getPlans();
        setPlans(planData);
      } catch (error) {
        console.error('Failed to fetch plans:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const handleSelectPlan = (plan: Plan) => {
    if (!user) {
      navigate('/login', { state: { selectedPlan: plan.id } });
      return;
    }
    navigate(`/checkout/${plan.id}`);
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
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-hero text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">
              Choose Your Perfect
              <span className="block bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                Subscription Plan
              </span>
            </h1>
            <p className="text-xl text-white/90 mb-8">
              Unlock powerful features and scale your business with our flexible subscription options.
            </p>
            <Button variant="secondary" size="lg" className="group">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section className="py-20 px-4">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Choose the plan that's right for you. Upgrade or downgrade at any time.
            </p>
          </div>

          {plans.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No plans available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {plans.map((plan, index) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  onSelect={handleSelectPlan}
                  isPopular={index === 1} // Make middle plan popular
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Why Choose SubManager?</h2>
              <p className="text-muted-foreground text-lg">
                Built for modern businesses that need flexibility and control.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <div className="w-12 h-12 bg-gradient-primary rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <Star className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Flexible Plans</h3>
                <p className="text-muted-foreground">
                  Switch between plans anytime. No long-term commitments.
                </p>
              </div>

              <div className="text-center p-6">
                <div className="w-12 h-12 bg-gradient-primary rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <Star className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">24/7 Support</h3>
                <p className="text-muted-foreground">
                  Get help when you need it with our dedicated support team.
                </p>
              </div>

              <div className="text-center p-6">
                <div className="w-12 h-12 bg-gradient-primary rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <Star className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Secure & Reliable</h3>
                <p className="text-muted-foreground">
                  Enterprise-grade security with 99.9% uptime guarantee.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;