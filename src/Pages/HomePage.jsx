import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/ui/Toast';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input'; 
import { Card , CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { ShoppingBag, MessageSquare, Heart, Leaf } from 'lucide-react';

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <div className="container mx-auto px-6 py-20">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
              <Leaf className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 ml-4">Fresh Trade</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            The marketplace for backyard gardeners and local farmers to sell, buy, and trade fresh produce directly with their community.
          </p>
        </div>

        {/* Auth Form */}
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>{isLogin ? 'Sign In' : 'Create Account'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Full Name</label>
                    <Input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                      required={!isLogin}
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Password</label>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
                </Button>
              </form>
              
              <div className="text-center mt-4">
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-green-600 hover:underline text-sm"
                >
                  {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                </button>
              </div>
              
              {/* Demo login */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Demo credentials:</p>
                <p className="text-xs text-gray-500">farmer@example.com / password123</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 w-full"
                  onClick={useDemoAccount}
                >
                  Use Demo Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <ShoppingBag className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Local Marketplace</h3>
            <p className="text-gray-600">Browse listings from your neighbors and find fresh produce nearby.</p>
          </div>
          <div className="text-center p-6">
            <MessageSquare className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Direct Communication</h3>
            <p className="text-gray-600">Message sellers directly to arrange trades and ask questions.</p>
          </div>
          <div className="text-center p-6">
            <Heart className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Community Driven</h3>
            <p className="text-gray-600">Build relationships with local growers and food enthusiasts.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;