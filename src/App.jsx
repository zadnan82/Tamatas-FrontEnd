import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth.jsx';
import { ToastProvider } from './components/ui/Toast';

// Import pages
import HomePage from './Pages/HomePage.jsx';
import Dashboard from './Pages/Dashboard.jsx';
import Marketplace from './Pages/MarketPlace.jsx';
import CreateListing from './Pages/CreateListing.jsx';
import ListingDetails from './Pages/ListingDetails';
import Messages from './Pages/Messages.jsx';
import Profile from './Pages/Profile';
import UserProfile from './Pages/UserProfile';
import Favorites from './Pages/Favorites';
import Feeds from './Pages/Feeds';
import Forum from './Pages/Forum';
import Topic from './Pages/Topic';
import CreateForumTopic from './Pages/CreateForumTopic';
import Contact from './Pages/Contact';

// Import layout
import Layout from './Components/layout/layout.jsx';
import LoadingSpinner from './components/ui/LoadingSpinner';

const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-pink-50">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center shadow-lg mb-4 mx-auto animate-pulse">
  <img src="/logo.png" alt="Tamatas Logo" className="w-full h-full object-cover" />
</div>

          <div className="loading-spinner mx-auto mb-4"></div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent mb-2">
            Tamatas
          </h2>
          <p className="text-gray-600">Loading Fresh Local Exchange...</p>
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
        <div className="app">
          <AppContent />
        </div>
      </ToastProvider>
    </AuthProvider>
  );
}