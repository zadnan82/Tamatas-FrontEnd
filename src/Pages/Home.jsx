import React from 'react';
import { Button } from '../Components/ui/button';
import { Link } from 'react-router-dom'; 
import { User } from '../Entities/User';
import { ArrowRight, ShoppingCart, Users, MessageCircle } from 'lucide-react';

export default function HomePage() {
  const handleLogin = () => {
    User.login();
  };

  const FeatureCard = ({ icon, title, description }) => (
    <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-green-100 dark:border-gray-700 transition-transform transform hover:-translate-y-2">
      <div className="flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-black dark:to-gray-800 text-gray-800 dark:text-gray-200">
      {/* Hero Section */}
      <section className="text-center py-20 md:py-32">
        <div className="container mx-auto px-6">
          <div className="bg-green-500 text-white font-semibold py-1 px-3 rounded-full inline-block mb-4">
            Now Serving Fresh Connections!
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 text-gray-900 dark:text-white">
            Trade Fresh, Eat Local.
          </h1>
          <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-2xl mx-auto mb-8">
            The marketplace for backyard gardeners and local farmers to sell, buy, and trade fresh produce directly with their community.
          </p>
          <div className="space-x-4">
            <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg" asChild>
              <Link to={createPageUrl("Marketplace")}>
                Explore Marketplace <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="rounded-full shadow-lg" onClick={handleLogin}>
              Join the Community
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white dark:bg-gray-900/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">How It Works</h2>
            <p className="text-gray-600 dark:text-gray-400">Get started in just a few simple steps.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <div className="text-5xl font-bold text-green-200 dark:text-green-800 mb-2">1</div>
              <h3 className="text-xl font-semibold mb-2">Create an Account</h3>
              <p className="text-gray-600 dark:text-gray-400">Sign up and set up your profile to let the community know who you are.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-5xl font-bold text-green-200 dark:text-green-800 mb-2">2</div>
              <h3 className="text-xl font-semibold mb-2">List Your Produce</h3>
              <p className="text-gray-600 dark:text-gray-400">Post ads for produce you're selling or things you're looking for.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-5xl font-bold text-green-200 dark:text-green-800 mb-2">3</div>
              <h3 className="text-xl font-semibold mb-2">Connect &amp; Trade</h3>
              <p className="text-gray-600 dark:text-gray-400">Message other users directly to arrange sales or trades in your area.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Everything You Need to Trade</h2>
            <p className="text-gray-600 dark:text-gray-400">All the tools for a thriving local food economy.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<ShoppingCart className="w-6 h-6 text-green-600 dark:text-green-400" />}
              title="Local Marketplace"
              description="Browse listings from your neighbors. Filter by category, price, and location to find exactly what you need."
            />
            <FeatureCard 
              icon={<Users className="w-6 h-6 text-green-600 dark:text-green-400" />}
              title="Community Profiles"
              description="Get to know other members. View their listings, ratings, and reviews to trade with confidence."
            />
            <FeatureCard 
              icon={<MessageCircle className="w-6 h-6 text-green-600 dark:text-green-400" />}
              title="Direct Messaging"
              description="Communicate securely with other users to ask questions and coordinate meetups for your trade."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-900/50 border-t border-green-100 dark:border-gray-800 py-8">
          <div className="container mx-auto px-6 text-center text-gray-600 dark:text-gray-400">
              <p>&copy; {new Date().getFullYear()} Fresh Trade. All Rights Reserved.</p>
          </div>
      </footer>
    </div>
  );
}