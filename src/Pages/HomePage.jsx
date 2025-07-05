// src/Pages/HomePage.jsx - Updated registration with location support

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
    full_name: '',
    // NEW: Location fields for registration
    location: {
      country: '',
      city: '',
      state: '',
      area: ''
    },
    location_precision: 'city',
    search_radius: 25,
    // NEW: Contact preferences
    whatsapp_number: '',
    contact_preference: 'both',
    show_whatsapp_on_listings: false
  });
  const [loading, setLoading] = useState(false);
  const [registrationStep, setRegistrationStep] = useState(1); // 1: Basic info, 2: Location

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isLogin && registrationStep === 1) {
      // For registration, move to step 2 (location)
      setRegistrationStep(2);
      return;
    }
    
    setLoading(true);
    
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        toast.success('Welcome back to Tamatas!');
      } else {
        // Validate required location fields
        if (!formData.location.country || !formData.location.city) {
          toast.error('Please provide at least your country and city');
          setLoading(false);
          return;
        }
        
        // Register with full data
        await register(formData);
        toast.success('Welcome to Tamatas! Your account has been created.');
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast.error(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('location.')) {
      const locationField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [locationField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const useDemoAccount = () => {
    setFormData({ 
      email: 'farmer@example.com', 
      password: 'password123', 
      full_name: '',
      location: { country: '', city: '', state: '', area: '' },
      location_precision: 'city',
      search_radius: 25,
      whatsapp_number: '',
      contact_preference: 'both',
      show_whatsapp_on_listings: false
    });
    setIsLogin(true);
    setRegistrationStep(1);
  };

  const resetRegistration = () => {
    setRegistrationStep(1);
    setFormData(prev => ({
      ...prev,
      location: { country: '', city: '', state: '', area: '' }
    }));
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
            <div className="text-left">
              <div className="flex justify-center mb-4">
                <img 
                  src="/loggan.png" 
                  alt="Tamatas Logo" 
                  className="w-150 h-auto object-contain mx-auto" 
                />
              </div>
              <p className="text-sm text-gray-600 font-medium text-center mt-2">
                Fresh Local Exchange
              </p>
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
                {isLogin ? 'Welcome Back' : 
                  registrationStep === 1 ? 'Join Tamatas' : 'Your Location'}
              </h3>
              <p className="text-sm text-gray-600">
                {isLogin ? 'Sign in to your account' : 
                  registrationStep === 1 ? 'Create your account today' : 
                  'Help us connect you with local farmers'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {isLogin ? (
                // LOGIN FORM
                <>
                  <Input
                    label="Email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                  />
                  
                  <Input
                    label="Password"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                  />
                </>
              ) : registrationStep === 1 ? (
                // REGISTRATION STEP 1: Basic Info
                <>
                  <Input
                    label="Full Name"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                  />
                  
                  <Input
                    label="Email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                  />
                  
                  <Input
                    label="Password"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a password"
                    required
                  />
                  
                  <div className="pt-2">
                    <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <div className="text-sm text-blue-700">
                        <p className="font-medium">Next: Set Your Location</p>
                        <p className="text-xs">This helps you find local farmers near you</p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                // REGISTRATION STEP 2: Location
                <>
                  <Input
                    label="Country *"
                    name="location.country"
                    value={formData.location.country}
                    onChange={handleChange}
                    placeholder="e.g., United States"
                    required
                  />
                  
                  <Input
                    label="City *"
                    name="location.city"
                    value={formData.location.city}
                    onChange={handleChange}
                    placeholder="e.g., New York"
                    required
                  />
                  
                  <Input
                    label="State/Province"
                    name="location.state"
                    value={formData.location.state}
                    onChange={handleChange}
                    placeholder="e.g., New York"
                  />
                  
                  <Input
                    label="Area/Neighborhood"
                    name="location.area"
                    value={formData.location.area}
                    onChange={handleChange}
                    placeholder="e.g., Manhattan (optional)"
                  />
                  
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">
                      Search Radius (miles)
                    </label>
                    <select
                      name="search_radius"
                      value={formData.search_radius}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value={5}>5 miles</option>
                      <option value={10}>10 miles</option>
                      <option value={25}>25 miles</option>
                      <option value={50}>50 miles</option>
                      <option value={100}>100 miles</option>
                    </select>
                  </div>
                  
                  <div className="pt-2">
                    <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <Shield className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <div className="text-sm text-green-700">
                        <p className="font-medium">Privacy Protected</p>
                        <p className="text-xs">Your exact location is never shared publicly</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
              
              <div className="flex gap-2">
                {!isLogin && registrationStep === 2 && (
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={resetRegistration}
                    className="flex-1"
                  >
                    Back
                  </Button>
                )}
                
                <Button 
                  type="submit" 
                  variant="primary"
                  size="lg"
                  className="flex-1"
                  loading={loading}
                  icon={<ArrowRight />}
                >
                  {isLogin ? 'Sign In' : 
                    registrationStep === 1 ? 'Continue' : 'Create Account'}
                </Button>
              </div>
            </form>
            
            <div className="text-center mt-6">
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setRegistrationStep(1);
                }}
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
              onClick={() => {
                setIsLogin(false);
                setRegistrationStep(1);
              }}
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
              <div className="w-12 h-12 rounded-2xl overflow-hidden flex items-center justify-center shadow-lg">
                <img src="/logo.png" alt="Tamatas Logo" className="w-full h-full object-cover" />
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