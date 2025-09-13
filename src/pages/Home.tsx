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
      <section className="relative py-24 px-4 bg-gradient-hero text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 opacity-30" style={{backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.05\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"2\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"}}></div>
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-6xl md:text-7xl font-bold mb-8 leading-tight">
              Choose Your Perfect
              <span className="block bg-gradient-to-r from-white via-white to-white/90 bg-clip-text text-transparent">
                Subscription Plan
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-2xl mx-auto leading-relaxed">
              Unlock powerful features and scale your business with our flexible subscription options designed for growth.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="lg" className="group text-lg">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="ghost" size="lg" className="text-white border-white/30 hover:bg-white/10 text-lg">
                View Plans
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section className="py-24 px-4 bg-background">
        <div className="container">
          <div className="text-center mb-20">
            <div className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6">
              Pricing Plans
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Simple, Transparent Pricing</h2>
            <p className="text-muted-foreground text-xl max-w-3xl mx-auto leading-relaxed">
              Choose the plan that's right for you. Upgrade or downgrade at any time with no hidden fees.
            </p>
          </div>

          {plans.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
                <Star className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-lg">No plans available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
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
      <section className="py-24 px-4 bg-gradient-card border-t">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20">
              <div className="inline-block px-4 py-2 bg-accent/10 text-accent rounded-full text-sm font-medium mb-6">
                Why Choose Us
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Why Choose SubManager?</h2>
              <p className="text-muted-foreground text-xl max-w-3xl mx-auto leading-relaxed">
                Built for modern businesses that need flexibility, control, and reliability at scale.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="group text-center p-8 rounded-2xl bg-card border hover:shadow-elegant transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-primary rounded-2xl mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Star className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">Flexible Plans</h3>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Switch between plans anytime. No long-term commitments or hidden fees.
                </p>
              </div>

              <div className="group text-center p-8 rounded-2xl bg-card border hover:shadow-elegant transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-primary rounded-2xl mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Star className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">24/7 Support</h3>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Get help when you need it with our dedicated support team.
                </p>
              </div>

              <div className="group text-center p-8 rounded-2xl bg-card border hover:shadow-elegant transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-primary rounded-2xl mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Star className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">Secure & Reliable</h3>
                <p className="text-muted-foreground text-lg leading-relaxed">
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