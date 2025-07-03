import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/ui/Toast';
import { apiClient } from '../config/api';
import { 
  MessageSquare, 
  Plus, 
  Search, 
  TrendingUp, 
  User, 
  Eye, 
  Pin, 
  Lock,
  Heart,
  MessageCircle,
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
      
      // Load categories (these are fixed in the UI for now)
      const fixedCategories = [
        { 
          id: 'all', 
          name: 'All Discussions', 
          icon: MessageSquare, 
          color: 'from-gray-400 to-gray-500',
          count: 0 
        },
        { 
          id: 'gardening_tips', 
          name: 'Gardening Tips', 
          icon: Leaf, 
          color: 'from-green-400 to-emerald-500',
          count: 0,
          description: 'Share and learn gardening techniques'
        },
        { 
          id: 'trading_ideas', 
          name: 'Trading Ideas', 
          icon: TrendingUp, 
          color: 'from-blue-400 to-cyan-500',
          count: 0,
          description: 'Discuss trading strategies and opportunities'
        },
        { 
          id: 'general_discussion', 
          name: 'General Discussion', 
          icon: Users, 
          color: 'from-purple-400 to-violet-500',
          count: 0,
          description: 'Community chat and general topics'
        },
        { 
          id: 'site_feedback', 
          name: 'Site Feedback', 
          icon: HelpCircle, 
          color: 'from-orange-400 to-red-500',
          count: 0,
          description: 'Suggestions and platform feedback'
        }
      ];

      // Load topics from API
      const filters = {};
      if (selectedCategory !== 'all') {
        filters.category = selectedCategory;
      }
      
      const apiTopics = await apiClient.getForumTopics(filters);
      
      // Update category counts
      const updatedCategories = fixedCategories.map(cat => {
        if (cat.id === 'all') {
          return { ...cat, count: apiTopics.length };
        }
        const count = apiTopics.filter(t => t.category === cat.id).length;
        return { ...cat, count };
      });

      // Process topics for UI
      const processedTopics = apiTopics.map(topic => ({
        id: topic.id,
        title: topic.title,
        content: topic.content || '',
        category: topic.category,
        author: {
          id: topic.created_by,
          name: topic.author?.name || 'Anonymous',
          avatar: topic.author?.avatar || '/placeholder-avatar.jpg',
          reputation: topic.author?.reputation || 0,
          isModerator: topic.author?.is_moderator || false
        },
        isPinned: topic.is_pinned || false,
        isLocked: topic.is_locked || false,
        replies: topic.post_count || 0,
        views: topic.view_count || 0,
        likes: topic.like_count || 0,
        lastActivity: new Date(topic.last_activity || topic.created_date),
        lastReply: {
          author: topic.last_reply_author?.name || 'No replies yet',
          timestamp: new Date(topic.last_activity || topic.created_date)
        },
        tags: topic.tags || []
      }));

      // Sort topics
      processedTopics.sort((a, b) => {
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

      setCategories(updatedCategories);
      setTopics(processedTopics);
    } catch (error) {
      console.error('Error loading forum data:', error);
      toast.error('Failed to load forum data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTopic = async (formData) => {
    try {
      const topicData = {
        title: formData.title,
        content: formData.content,
        category: formData.category,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };

      await apiClient.createForumTopic(topicData);
      toast.success('Topic created successfully!');
      setShowCreateModal(false);
      loadForumData(); // Refresh the topics list
    } catch (error) {
      console.error('Error creating topic:', error);
      toast.error(error.message || 'Failed to create topic');
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
      handleCreateTopic(formData);
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
                <span className="font-semibold">{categories.find(c => c.id === 'all')?.count || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="clay-text-soft text-sm">Total Posts</span>
                <span className="font-semibold">{topics.reduce((sum, topic) => sum + topic.replies, 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="clay-text-soft text-sm">Active Members</span>
                <span className="font-semibold">-</span>
              </div>
              <div className="flex justify-between">
                <span className="clay-text-soft text-sm">Today's Posts</span>
                <span className="font-semibold text-green-600">-</span>
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
              topics
                .filter(topic => 
                  searchTerm === '' || 
                  topic.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                  topic.content.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map(topic => (
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