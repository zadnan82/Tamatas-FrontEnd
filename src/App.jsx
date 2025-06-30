import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth.jsx';
import { ToastProvider } from './components/ui/Toast';

// Import pages
import HomePage from './pages/HomePage';
import Dashboard from './pages/Dashboard';
import Marketplace from './pages/Marketplace';
import CreateListing from './pages/CreateListing';
import ListingDetails from './pages/ListingDetails';
import Messages from './pages/Messages';
import Profile from './pages/Profile';
import UserProfile from './pages/UserProfile';
import Favorites from './pages/Favorites';
import Feeds from './pages/Feeds';
import Forum from './pages/Forum';
import Topic from './pages/Topic';
import CreateForumTopic from './pages/CreateForumTopic';
import Contact from './pages/Contact';

// Import layout
import Layout from './components/layout/Layout';
import LoadingSpinner from './components/ui/LoadingSpinner';

const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="text-center">
          <LoadingSpinner size="xl" />
          <p className="text-gray-600 mt-4">Loading Fresh Trade...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={user ? <Navigate to="/dashboard" /> : <HomePage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/" />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/create-listing" element={user ? <CreateListing /> : <Navigate to="/" />} />
          <Route path="/listing/:id" element={<ListingDetails />} />
          <Route path="/messages" element={user ? <Messages /> : <Navigate to="/" />} />
          <Route path="/profile" element={user ? <Profile /> : <Navigate to="/" />} />
          <Route path="/user/:id" element={<UserProfile />} />
          <Route path="/favorites" element={user ? <Favorites /> : <Navigate to="/" />} />
          <Route path="/feeds" element={<Feeds />} />
          <Route path="/forum" element={<Forum />} />
          <Route path="/forum/topic/:id" element={<Topic />} />
          <Route path="/forum/create" element={user ? <CreateForumTopic /> : <Navigate to="/" />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
}