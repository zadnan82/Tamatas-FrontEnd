import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/ui/Toast';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { 
  MessageSquare, 
  Plus, 
  Search, 
  Filter, 
  TrendingUp, 
  Clock, 
  User, 
  Eye, 
  Pin, 
  Lock,
  Heart,
  MessageCircle,
  ArrowRight,
  Leaf,
  Lightbulb,
  Users,
  HelpCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const Forum = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [topics, setTopics] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadForumData();
  }, [selectedCategory, sortBy]);

  const loadForumData = async () => {
    try {
      setLoading(true);
      
      // Mock categories
      const mockCategories = [
        { 
          id: 'all', 
          name: 'All Discussions', 
          icon: MessageSquare, 
          color: 'from-gray-400 to-gray-500',
          count: 156 
        },
        { 
          id: 'gardening_tips', 
          name: 'Gardening Tips', 
          icon: Leaf, 
          color: 'from-green-400 to-emerald-500',
          count: 45,
          description: 'Share and learn gardening techniques'
        },
        { 
          id: 'trading_ideas', 
          name: 'Trading Ideas', 
          icon: TrendingUp, 
          color: 'from-blue-400 to-cyan-500',
          count: 32,
          description: 'Discuss trading strategies and opportunities'
        },
        { 
          id: 'general_discussion', 
          name: 'General Discussion', 
          icon: Users, 
          color: 'from-purple-400 to-violet-500',
          count: 67,
          description: 'Community chat and general topics'
        },
        { 
          id: 'site_feedback', 
          name: 'Site Feedback', 
          icon: HelpCircle, 
          color: 'from-orange-400 to-red-500',
          count: 12,
          description: 'Suggestions and platform feedback'
        }
      ];
      
      // Mock topics
      const mockTopics = [
        {
          id: 1,
          title: 'Best practices for organic tomato growing',
          content: 'Looking for advice on growing organic tomatoes in small spaces...',
          category: 'gardening_tips',
          author: {
            id: 1,
            name: 'John Farmer',
            avatar: '/placeholder-avatar.jpg',
            reputation: 245
          },
          isPinned: true,
          isLocked: false,
          replies: 23,
          views: 156,
          likes: 34,
          lastActivity: new Date(Date.now() - 1000 * 60 * 30),
          lastReply: {
            author: 'Sarah Green',
            timestamp: new Date(Date.now() - 1000 * 60 * 30)
          },
          tags: ['organic', 'tomatoes', 'small-space']
        },
        {
          id: 2,
          title: 'Trading surplus vegetables - coordination thread',
          content: 'Let\'s organize a weekly trading meetup for surplus vegetables...',
          category: 'trading_ideas',
          author: {
            id: 2,
            name: 'Jane Gardener',
            avatar: '/placeholder-avatar.jpg',
            reputation: 189
          },
          isPinned: false,
          isLocked: false,
          replies: 45,
          views: 234,
          likes: 67,
          lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 2),
          lastReply: {
            author: 'Chef Mike',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2)
          },
          tags: ['trading', 'meetup', 'vegetables']
        },
        {
          id: 3,
          title: 'Welcome new members! Introduce yourself here',
          content: 'This is the place for new community members to introduce themselves...',
          category: 'general_discussion',
          author: {
            id: 3,
            name: 'Community Manager',
            avatar: '/placeholder-avatar.jpg',
            reputation: 500,
            isModerator: true
          },
          isPinned: true,
          isLocked: false,
          replies: 89,
          views: 445,
          likes: 123,
          lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 4),
          lastReply: {
            author: 'New Farmer',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4)
          },
          tags: ['welcome', 'introductions']
        },
        {
          id: 4,
          title: 'Feature request: Mobile app notifications',
          content: 'Would love to have push notifications for new messages and trades...',
          category: 'site_feedback',
          author: {
            id: 4,
            name: 'Tech Enthusiast',
            avatar: '/placeholder-avatar.jpg',
            reputation: 156
          },
          isPinned: false,
          isLocked: false,
          replies: 12,
          views: 78,
          likes: 25,
          lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 6),
          lastReply: {
            author: 'Developer',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6)
          },
          tags: ['feature-request', 'mobile', 'notifications']
        },
        {
          id: 5,
          title: 'Seasonal gardening calendar for beginners',
          content: 'Creating a comprehensive guide for when to plant different crops...',
          category: 'gardening_tips',
          author: {
            id: 5,
            name: 'Master Gardener',
            avatar: '/placeholder-avatar.jpg',
            reputation: 378
          },
          isPinned: false,
          isLocked: false,
          replies: 56,
          views: 289,
          likes: 78,
          lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 8),
          lastReply: {
            author: 'Beginner Grower',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8)
          },
          tags: ['seasonal', 'calendar', 'beginners']
        }
      ];
      
      setCategories(mockCategories);
      
      // Filter topics
      let filteredTopics = mockTopics;
      if (selectedCategory !== 'all') {
        filteredTopics = mockTopics.filter(topic => topic.category === selectedCategory);
      }
      
      if (searchTerm) {
        filteredTopics = filteredTopics.filter(topic =>
          topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          topic.content.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      // Sort topics
      filteredTopics.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        
        switch (sortBy) {
          case 'recent':
            return new Date(b.lastActivity) - new Date(a.lastActivity);
          case 'popular':
            return (b.likes + b.replies) - (a.likes + a.replies);
          case 'views':
            return b.views - a.views;
          default:
            return new Date(b.lastActivity) - new Date(a.lastActivity);
        }
      });
      
      setTopics(filteredTopics);
    } catch (error) {
      console.error('Error loading forum data:', error);
      toast.error('Failed to load forum data');
    } finally {
      setLoading(false);
    }
  };

  const TopicCard = ({ topic }) => {
    return (
      <div className="clay-card p-6 bg-white/60 backdrop-blur-sm hover:scale-[1.01] transition-all duration-300 group">
        <div className="flex items-start gap-4">
          {/* Author Avatar */}
          <div className="flex-shrink-0">
            <div className="w-12 h-12 clay-card rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
              <span className="text-white font-semibold">
                {topic.author.name.charAt(0)}
              </span>
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                {topic.isPinned && (
                  <Pin className="w-4 h-4 text-orange-500" />
                )}
                {topic.isLocked && (
                  <Lock className="w-4 h-4 text-gray-500" />
                )}
                <Link 
                  to={`/forum/topic/${topic.id}`}
                  className="clay-text-title text-lg font-semibold hover:text-green-600 transition-colors line-clamp-2 group-hover:text-green-600"
                >
                  {topic.title}
                </Link>
              </div>
            </div>
            
            {/* Author Info */}
            <div className="flex items-center gap-2 mb-3">
              <span className="font-medium text-sm">{topic.author.name}</span>
              {topic.author.isModerator && (
                <div className="clay-badge clay-badge-purple text-xs px-2 py-1">
                  Moderator
                </div>
              )}
              <span className="clay-text-soft text-xs">•</span>
              <span className="clay-text-soft text-xs">
                {topic.author.reputation} reputation
              </span>
            </div>
            
            {/* Content Preview */}
            <p className="clay-text-soft text-sm mb-4 line-clamp-2 leading-relaxed">
              {topic.content}
            </p>
            
            {/* Tags */}
            {topic.tags && topic.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {topic.tags.map(tag => (
                  <div key={tag} className="clay-badge text-xs px-2 py-1">
                    #{tag}
                  </div>
                ))}
              </div>
            )}
            
            {/* Stats */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-1 clay-text-soft">
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">{topic.replies}</span>
                </div>
                <div className="flex items-center gap-1 clay-text-soft">
                  <Eye className="w-4 h-4" />
                  <span className="text-sm font-medium">{topic.views}</span>
                </div>
                <div className="flex items-center gap-1 clay-text-soft">
                  <Heart className="w-4 h-4" />
                  <span className="text-sm font-medium">{topic.likes}</span>
                </div>
              </div>
              
              <div className="text-right">
                <p className="clay-text-soft text-xs">
                  Last reply by {topic.lastReply.author}
                </p>
                <p className="clay-text-soft text-xs">
                  {formatDistanceToNow(topic.lastActivity, { addSuffix: true })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const CategoryCard = ({ category }) => {
    const IconComponent = category.icon;
    
    return (
      <button
        onClick={() => setSelectedCategory(category.id)}
        className={`clay-card p-4 text-left w-full hover:scale-105 transition-all duration-300 ${
          selectedCategory === category.id ? 'bg-gradient-to-br from-green-50 to-emerald-50' : 'bg-white/60'
        }`}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className={`w-10 h-10 bg-gradient-to-br ${category.color} rounded-2xl flex items-center justify-center`}>
            <IconComponent className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm">{category.name}</h3>
            <p className="clay-text-soft text-xs">{category.count} topics</p>
          </div>
        </div>
        {category.description && (
          <p className="clay-text-soft text-xs leading-relaxed">{category.description}</p>
        )}
      </button>
    );
  };

  const CreateTopicModal = () => {
    const [formData, setFormData] = useState({
      title: '',
      content: '',
      category: 'general_discussion',
      tags: ''
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      // Mock create topic
      toast.success('Topic created successfully!');
      setShowCreateModal(false);
      setFormData({ title: '', content: '', category: 'general_discussion', tags: '' });
    };

    if (!showCreateModal) return null;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="clay-card p-6 bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="clay-text-title text-2xl font-bold">Create New Topic</h2>
            <button 
              onClick={() => setShowCreateModal(false)}
              className="clay-button p-2 rounded-xl"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block clay-text-soft text-sm font-medium mb-2">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="clay-input w-full"
                placeholder="Enter topic title..."
                required
              />
            </div>

            <div>
              <label className="block clay-text-soft text-sm font-medium mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="clay-input w-full"
              >
                {categories.filter(cat => cat.id !== 'all').map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block clay-text-soft text-sm font-medium mb-2">Content</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                className="clay-input w-full h-32 resize-none"
                placeholder="Write your topic content..."
                required
              />
            </div>

            <div>
              <label className="block clay-text-soft text-sm font-medium mb-2">Tags (optional)</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({...formData, tags: e.target.value})}
                className="clay-input w-full"
                placeholder="Enter tags separated by commas..."
              />
              <p className="clay-text-soft text-xs mt-1">e.g., organic, tomatoes, small-space</p>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="clay-button-primary px-6 py-3 font-semibold text-white flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Topic
              </button>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="clay-button px-6 py-3 font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="clay-card p-8 text-center">
          <div className="clay-loading w-8 h-8 rounded-full mx-auto mb-4"></div>
          <p className="clay-text-soft">Loading community discussions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="clay-card p-6 mb-6 bg-gradient-to-br from-white/80 to-white/60">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="clay-text-title text-3xl font-bold mb-2">Community Forum</h1>
            <p className="clay-text-subtitle">Connect, share knowledge, and grow together</p>
          </div>
          {user && (
            <button 
              onClick={() => setShowCreateModal(true)}
              className="clay-button-primary px-6 py-3 font-semibold text-white flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Topic
            </button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Categories */}
          <div className="clay-card p-6 bg-white/60">
            <h3 className="clay-text-title text-lg font-semibold mb-4">Categories</h3>
            <div className="space-y-3">
              {categories.map(category => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          </div>

          {/* Forum Stats */}
          <div className="clay-card p-6 bg-gradient-to-br from-green-50 to-emerald-50">
            <h3 className="clay-text-title text-lg font-semibold mb-4">Forum Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="clay-text-soft text-sm">Total Topics</span>
                <span className="font-semibold">156</span>
              </div>
              <div className="flex justify-between">
                <span className="clay-text-soft text-sm">Total Posts</span>
                <span className="font-semibold">1,245</span>
              </div>
              <div className="flex justify-between">
                <span className="clay-text-soft text-sm">Active Members</span>
                <span className="font-semibold">89</span>
              </div>
              <div className="flex justify-between">
                <span className="clay-text-soft text-sm">Today's Posts</span>
                <span className="font-semibold text-green-600">23</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Search and Filters */}
          <div className="clay-card p-4 mb-6 bg-white/60">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 clay-text-soft w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search topics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="clay-input pl-10 w-full"
                />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="clay-input"
              >
                <option value="recent">Most Recent</option>
                <option value="popular">Most Popular</option>
                <option value="views">Most Viewed</option>
              </select>
            </div>
          </div>

          {/* Topics List */}
          <div className="space-y-4">
            {topics.length > 0 ? (
              topics.map(topic => (
                <TopicCard key={topic.id} topic={topic} />
              ))
            ) : (
              <div className="clay-card p-12 text-center bg-white/40">
                <div className="w-16 h-16 clay-card rounded-2xl bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-8 h-8 text-white" />
                </div>
                <h3 className="clay-text-title text-xl font-semibold mb-2">No topics found</h3>
                <p className="clay-text-soft mb-6">
                  {selectedCategory === 'all' 
                    ? "Be the first to start a discussion in the community!"
                    : `No topics found in this category. Start the conversation!`
                  }
                </p>
                {user && (
                  <button 
                    onClick={() => setShowCreateModal(true)}
                    className="clay-button-primary px-6 py-3 font-semibold text-white flex items-center gap-2 mx-auto"
                  >
                    <Plus className="w-4 h-4" />
                    Create First Topic
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Load More */}
          {topics.length > 0 && (
            <div className="text-center mt-8">
              <button className="clay-button px-8 py-3 font-semibold">
                Load More Topics
              </button>
            </div>
          )}
        </div>
      </div>

      <CreateTopicModal />
    </div>
  );
};

export default Forum;