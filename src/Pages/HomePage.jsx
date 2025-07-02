import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/ui/Toast';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input'; 
import { Card , CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { ShoppingBag, MessageSquare, Heart, Leaf, Users, Globe, TrendingUp, Star, ArrowRight } from 'lucide-react';

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
        toast.success('Welcome back!');
      } else {
        await register(formData.email, formData.password, formData.full_name);
        toast.success('Account created successfully!');
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
      icon: ShoppingBag,
      title: "Local Marketplace",
      description: "Browse listings from your neighbors and find fresh produce nearby.",
      color: "from-green-400 to-emerald-500"
    },
    {
      icon: MessageSquare,
      title: "Direct Communication",
      description: "Message sellers directly to arrange trades and ask questions.",
      color: "from-blue-400 to-cyan-500"
    },
    {
      icon: Heart,
      title: "Community Driven",
      description: "Build relationships with local growers and food enthusiasts.",
      color: "from-pink-400 to-rose-500"
    },
    {
      icon: Users,
      title: "Trusted Network",
      description: "Join a verified community of local farmers and gardeners.",
      color: "from-purple-400 to-violet-500"
    },
    {
      icon: Globe,
      title: "Sustainable Trading",
      description: "Support local agriculture and reduce your carbon footprint.",
      color: "from-teal-400 to-green-500"
    },
    {
      icon: TrendingUp,
      title: "Growing Community",
      description: "Be part of the fastest-growing local food network.",
      color: "from-orange-400 to-red-500"
    }
  ];

  const stats = [
    { number: "5,000+", label: "Active Users", icon: Users },
    { number: "15,000+", label: "Successful Trades", icon: ShoppingBag },
    { number: "50+", label: "Cities", icon: Globe },
    { number: "4.9", label: "Average Rating", icon: Star }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="container mx-auto px-3 py-8">
        <div className="text-center mb-8">
          <div className="clay-animate-float inline-block mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center clay-card">
              <Leaf className="w-6 h-6 text-white drop-shadow-lg" />
            </div>
          </div>
          
          <h1 className="clay-text-title text-2xl md:text-3xl font-bold mb-3 max-w-4xl mx-auto leading-tight">
            Fresh Trade
          </h1>
          
          <p className="clay-text-subtitle text-sm md:text-base max-w-2xl mx-auto mb-4 leading-relaxed">
            The marketplace for backyard gardeners and local farmers to sell, buy, and trade fresh produce directly with their community.
          </p>
          
          <div className="flex flex-wrap gap-2 justify-center mb-6">
            <div className="clay-badge clay-badge-green px-2 py-1 text-xs font-semibold">
              🌱 100% Local
            </div>
            <div className="clay-badge clay-badge-blue px-2 py-1 text-xs font-semibold">
              🤝 Community Driven
            </div>
            <div className="clay-badge clay-badge-purple px-2 py-1 text-xs font-semibold">
              🌍 Sustainable
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="clay-grid clay-grid-2 md:clay-grid-4 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="clay-card p-3 text-center group hover:scale-105 transition-transform duration-300">
              <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                <stat.icon className="w-4 h-4 text-white" />
              </div>
              <div className="clay-text-title text-lg font-bold mb-1">{stat.number}</div>
              <div className="clay-text-soft text-xs font-medium">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Auth Form */}
        <div className="max-w-sm mx-auto">
          <div className="clay-card p-4 bg-white/60 backdrop-blur-sm">
            <div className="text-center mb-4">
              <h3 className="clay-text-title text-lg font-bold mb-1">
                {isLogin ? 'Welcome Back' : 'Join Fresh Trade'}
              </h3>
              <p className="clay-text-soft text-xs">
                {isLogin ? 'Sign in to your account' : 'Create your account today'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {!isLogin && (
                <div>
                  <label className="block clay-text-soft text-xs font-medium mb-1">Full Name</label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    className="clay-input w-full"
                    placeholder="Enter your full name"
                    required={!isLogin}
                  />
                </div>
              )}
              
              <div>
                <label className="block clay-text-soft text-xs font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="clay-input w-full"
                  placeholder="Enter your email"
                  required
                />
              </div>
              
              <div>
                <label className="block clay-text-soft text-xs font-medium mb-1">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="clay-input w-full"
                  placeholder="Enter your password"
                  required
                />
              </div>
              
              <button 
                type="submit" 
                className={`clay-button-primary w-full py-2 font-semibold text-white text-sm ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="clay-loading w-3 h-3 rounded-full"></div>
                    Please wait...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    {isLogin ? 'Sign In' : 'Create Account'}
                    <ArrowRight className="w-3 h-3" />
                  </div>
                )}
              </button>
            </form>
            
            <div className="text-center mt-3">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="clay-text-soft hover:text-gray-700 text-xs font-medium transition-colors"
              >
                {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
              </button>
            </div>
            
            {/* Demo Account */}
            <div className="mt-3 clay-card p-2 bg-gradient-to-br from-green-50 to-emerald-50">
              <p className="clay-text-soft text-xs font-medium mb-2 text-center">Try with demo account:</p>
              <div className="bg-white/80 rounded-lg p-2 mb-2 backdrop-blur-sm">
                <p className="text-xs clay-text-soft">Email: farmer@example.com</p>
                <p className="text-xs clay-text-soft">Password: password123</p>
              </div>
              <button
                onClick={useDemoAccount}
                className="clay-button w-full text-xs font-medium"
              >
                Use Demo Account
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-3 py-8">
        <div className="text-center mb-8">
          <h2 className="clay-text-title text-xl font-bold mb-2">Why Choose Fresh Trade?</h2>
          <p className="clay-text-subtitle text-sm max-w-2xl mx-auto">
            Join thousands of farmers and gardeners creating a sustainable local food network
          </p>
        </div>
        
        <div className="clay-grid clay-grid-2 md:clay-grid-3 mb-8">
          {features.map((feature, index) => (
            <div key={index} className="clay-card p-4 text-center group hover:scale-105 transition-all duration-300">
              <div className={`w-10 h-10 bg-gradient-to-br ${feature.color} rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-5 h-5 text-white drop-shadow-sm" />
              </div>
              <h3 className="clay-text-title text-sm font-bold mb-2">{feature.title}</h3>
              <p className="clay-text-soft leading-relaxed text-xs">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-3 py-8">
        <div className="clay-card p-6 text-center bg-gradient-to-br from-green-50 to-emerald-50">
          <h2 className="clay-text-title text-xl font-bold mb-2">Ready to Start Trading?</h2>
          <p className="clay-text-subtitle text-sm mb-4 max-w-2xl mx-auto">
            Join our growing community of local food enthusiasts and start making meaningful connections today.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <button 
              onClick={() => setIsLogin(false)}
              className="clay-button-primary px-4 py-2 font-semibold text-white flex items-center gap-2 justify-center text-sm"
            >
              Get Started Free
              <ArrowRight className="w-3 h-3" />
            </button>
            <button className="clay-button px-4 py-2 font-semibold text-sm">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-3 py-6">
        <div className="clay-card p-4 bg-white/40">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center">
                <Leaf className="w-3 h-3 text-white" />
              </div>
              <span className="clay-text-title text-sm font-bold">Fresh Trade</span>
            </div>
            <p className="clay-text-soft text-xs">
              © 2024 Fresh Trade. Building sustainable local food communities.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;