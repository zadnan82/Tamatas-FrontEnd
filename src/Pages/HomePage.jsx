import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/ui/Toast';
import Button from '../Components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, FeatureCard, StatsCard } from '../components/ui/Card';
import { 
  ShoppingBag, 
  MessageSquare, 
  Heart, 
  Users, 
  Globe, 
  TrendingUp, 
  Star, 
  ArrowRight,
  Leaf,
  Shield,
  Clock,
  MapPin
} from 'lucide-react';

const HomePage = () => {
  const { login, register } = useAuth();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ 
    email: '', 
    password: '', 
    full_name: '' 
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        toast.success('Welcome back to Tamatas!');
      } else {
        await register(formData.email, formData.password, formData.full_name);
        toast.success('Welcome to Tamatas! Your account has been created.');
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const useDemoAccount = () => {
    setFormData({ 
      email: 'farmer@example.com', 
      password: 'password123', 
      full_name: '' 
    });
  };

  const features = [
    {
      icon: <ShoppingBag />,
      title: "Local Marketplace",
      description: "Browse fresh produce from your neighbors and local farmers."
    },
    {
      icon: <MessageSquare />,
      title: "Direct Communication", 
      description: "Message sellers directly to arrange trades and pickups."
    },
    {
      icon: <Shield />,
      title: "Trusted Community",
      description: "Join verified local growers with ratings and reviews."
    },
    {
      icon: <Heart />,
      title: "Community Driven",
      description: "Build lasting relationships with local food producers."
    },
    {
      icon: <Globe />,
      title: "Sustainable Trading",
      description: "Support local agriculture and reduce food waste."
    },
    {
      icon: <Clock />,
      title: "Fresh & Fast",
      description: "Get the freshest produce delivered quickly from nearby."
    }
  ];

  const stats = [
    { 
      title: "Active Users", 
      value: "5,000+", 
      icon: <Users />,
      trend: 15
    },
    { 
      title: "Successful Trades", 
      value: "15,000+", 
      icon: <ShoppingBag />,
      trend: 23
    },
    { 
      title: "Cities", 
      value: "50+", 
      icon: <MapPin />,
      trend: 8
    },
    { 
      title: "Average Rating", 
      value: "4.9", 
      icon: <Star />,
      trend: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12">
        {/* Hero Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 via-red-400 to-pink-400 flex items-center justify-center shadow-lg">
              <span className="text-2xl">🍅</span>
            </div>
            <div className="text-left">
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent">
                Tamatas
              </h1>
              <p className="text-sm text-gray-600 font-medium">Fresh Local Exchange</p>
            </div>
          </div>
          
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 max-w-4xl mx-auto leading-tight">
            Connect with Local Farmers & Fresh Produce
          </h2>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed">
            The marketplace where backyard gardeners and local farmers trade fresh, seasonal produce directly with their community.
          </p>
          
          <div className="flex flex-wrap gap-3 justify-center mb-8">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-orange-200 text-sm font-medium text-orange-700">
              🌱 100% Local
            </span>
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-blue-200 text-sm font-medium text-blue-700">
              🤝 Community Driven
            </span>
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-green-200 text-sm font-medium text-green-700">
              🌍 Sustainable
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {stats.map((stat, index) => (
            <StatsCard
              key={index}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              trend={stat.trend}
              className="text-center"
            />
          ))}
        </div>

        {/* Auth Form */}
        <div className="max-w-md mx-auto">
          <Card gradient className="p-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {isLogin ? 'Welcome Back' : 'Join Tamatas'}
              </h3>
              <p className="text-sm text-gray-600">
                {isLogin ? 'Sign in to your account' : 'Create your account today'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <Input
                  label="Full Name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  placeholder="Enter your full name"
                  required={!isLogin}
                />
              )}
              
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="Enter your email"
                required
              />
              
              <Input
                label="Password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder="Enter your password"
                required
              />
              
              <Button 
                type="submit" 
                variant="primary"
                size="lg"
                fullWidth
                loading={loading}
                icon={<ArrowRight />}
              >
                {isLogin ? 'Sign In' : 'Create Account'}
              </Button>
            </form>
            
            <div className="text-center mt-6">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-gray-600 hover:text-orange-600 font-medium transition-colors"
              >
                {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
              </button>
            </div>
            
            {/* Demo Account */}
            <Card className="mt-6 p-4 bg-gradient-to-r from-orange-50 to-pink-50 border-orange-200">
              <p className="text-sm font-medium text-center mb-3 text-gray-700">Try with demo account:</p>
              <div className="bg-white/80 rounded-lg p-3 mb-3 backdrop-blur-sm border border-white/50">
                <p className="text-xs text-gray-600">Email: farmer@example.com</p>
                <p className="text-xs text-gray-600">Password: password123</p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                fullWidth
                onClick={useDemoAccount}
              >
                Use Demo Account
              </Button>
            </Card>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Tamatas?</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join thousands of farmers and gardeners creating a sustainable local food network
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <Card gradient className="p-12 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Start Trading?</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Join our growing community of local food enthusiasts and start making meaningful connections today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="primary"
              size="lg"
              onClick={() => setIsLogin(false)}
              icon={<ArrowRight />}
            >
              Get Started Free
            </Button>
            <Button 
              variant="outline"
              size="lg"
            >
              Learn More
            </Button>
          </div>
        </Card>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8">
        <Card className="p-6 bg-white/60">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-400 via-red-400 to-pink-400 flex items-center justify-center">
                <span className="text-lg">🍅</span>
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                Tamatas
              </span>
            </div>
            <p className="text-sm text-gray-600">
              © 2024 Tamatas. Building sustainable local food communities.
            </p>
          </div>
        </Card>
      </footer>
    </div>
  );
};

export default HomePage;