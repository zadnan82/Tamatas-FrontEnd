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
  Users,
  HelpCircle,
  Filter,
  SortAsc,
  Calendar,
  ArrowRight
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
      
      // Load categories
      const fixedCategories = [
        { 
          id: 'all', 
          name: 'All Discussions', 
          icon: MessageSquare, 
          color: 'from-gray-400 to-gray-500',
          count: 0,
          description: 'View all forum topics'
        },
        { 
          id: 'gardening_tips', 
          name: 'Gardening Tips', 
          icon: Leaf, 
          color: 'from-green-400 to-emerald-500',
          count: 0,
          description: 'Share gardening knowledge and techniques'
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
          name: topic.creator?.full_name || 'Anonymous',
          avatar: topic.creator?.profile_image,
          reputation: Math.floor(Math.random() * 1000) + 100, // Placeholder
          isModerator: topic.creator?.is_moderator || false
        },
        isPinned: topic.is_pinned || false,
        isLocked: topic.is_locked || false,
        replies: topic.post_count || 0,
        views: topic.view_count || Math.floor(Math.random() * 100) + 10,
        likes: Math.floor(Math.random() * 20) + 1, // Placeholder
        lastActivity: new Date(topic.updated_date || topic.created_date),
        createdDate: new Date(topic.created_date),
        lastReply: {
          author: 'Recent User', // Placeholder
          timestamp: new Date(topic.updated_date || topic.created_date)
        },
        isNew: (new Date() - new Date(topic.created_date)) < 24 * 60 * 60 * 1000, // Less than 24 hours old
        isHot: (topic.post_count || 0) > 5 && (topic.view_count || 0) > 50 // Popular topics
      }));

      // Sort topics
      processedTopics.sort((a, b) => {
        // Always put pinned topics first
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        
        switch (sortBy) {
          case 'recent':
            return new Date(b.lastActivity) - new Date(a.lastActivity);
          case 'popular':
            return (b.likes + b.replies + b.views) - (a.likes + a.replies + a.views);
          case 'views':
            return b.views - a.views;
          case 'replies':
            return b.replies - a.replies;
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
        category: formData.category
      };

      const newTopic = await apiClient.createForumTopic(topicData);
      toast.success('Topic created successfully!');
      setShowCreateModal(false);
      loadForumData(); // Refresh the topics list
    } catch (error) {
      console.error('Error creating topic:', error);
      toast.error(error.message || 'Failed to create topic');
    }
  };

  const TopicCard = ({ topic }) => {
    const categoryInfo = getCategoryInfo(topic.category);
    
    return (
      <Link 
        to={`/forum/topic/${topic.id}`}
        className="block group"
      >
        <div className="clay-card p-6 bg-white/70 backdrop-blur-sm hover:bg-white/90 hover:scale-[1.02] transition-all duration-300 border border-transparent hover:border-green-200">
          <div className="flex gap-4">
            {/* Author Avatar */}
            <div className="flex-shrink-0">
              <div className="w-12 h-12 clay-card rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center overflow-hidden">
                {topic.author.avatar ? (
                  <img 
                    src={topic.author.avatar} 
                    alt={topic.author.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white font-semibold">
                    {topic.author.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              {/* Header with badges */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  {topic.isPinned && (
                    <div className="flex items-center gap-1 clay-badge clay-badge-orange text-xs px-2 py-1">
                      <Pin className="w-3 h-3" />
                      Pinned
                    </div>
                  )}
                  {topic.isLocked && (
                    <div className="flex items-center gap-1 clay-badge clay-badge-red text-xs px-2 py-1">
                      <Lock className="w-3 h-3" />
                      Locked
                    </div>
                  )}
                  {topic.isNew && (
                    <div className="clay-badge clay-badge-green text-xs px-2 py-1">
                      New
                    </div>
                  )}
                  {topic.isHot && (
                    <div className="clay-badge clay-badge-purple text-xs px-2 py-1">
                      🔥 Hot
                    </div>
                  )}
                  
                  <div className={`clay-badge text-xs px-2 py-1 bg-gradient-to-r ${categoryInfo.color} text-white`}>
                    {categoryInfo.name}
                  </div>
                </div>
                
                <ArrowRight className="w-4 h-4 clay-text-soft group-hover:text-green-600 transition-colors" />
              </div>
              
              {/* Title */}
              <h3 className="clay-text-title text-lg font-semibold mb-2 line-clamp-2 group-hover:text-green-600 transition-colors leading-tight">
                {topic.title}
              </h3>
              
              {/* Author Info */}
              <div className="flex items-center gap-2 mb-3">
                <span className="font-medium text-sm">{topic.author.name}</span>
                {topic.author.isModerator && (
                  <div className="clay-badge clay-badge-blue text-xs px-2 py-1">
                    Mod
                  </div>
                )}
                <span className="clay-text-soft text-xs">•</span>
                <span className="clay-text-soft text-xs">
                  {formatDistanceToNow(topic.createdDate, { addSuffix: true })}
                </span>
              </div>
              
              {/* Content Preview */}
              <p className="clay-text-soft text-sm mb-4 line-clamp-2 leading-relaxed">
                {topic.content}
              </p>
              
              {/* Stats */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
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
                    Last activity {formatDistanceToNow(topic.lastActivity, { addSuffix: true })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  };

  const CategoryCard = ({ category }) => {
    const IconComponent = category.icon;
    const isSelected = selectedCategory === category.id;
    
    return (
      <button
        onClick={() => setSelectedCategory(category.id)}
        className={`clay-card p-4 text-left w-full hover:scale-105 transition-all duration-300 ${
          isSelected 
            ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200' 
            : 'bg-white/60 hover:bg-white/80'
        }`}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className={`w-10 h-10 bg-gradient-to-br ${category.color} rounded-2xl flex items-center justify-center`}>
            <IconComponent className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className={`font-semibold text-sm ${isSelected ? 'text-green-700' : ''}`}>
              {category.name}
            </h3>
            <p className="clay-text-soft text-xs">{category.count} topics</p>
          </div>
          {isSelected && (
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          )}
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
      category: selectedCategory !== 'all' ? selectedCategory : 'general_discussion'
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
              className="clay-button p-2 rounded-xl hover:bg-gray-100"
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
                placeholder="Enter an engaging topic title..."
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
                className="clay-input w-full h-40 resize-none"
                placeholder="Share your thoughts, ask questions, or start a discussion..."
                required
              />
              <p className="clay-text-soft text-xs mt-1">
                Be descriptive and engaging to encourage participation
              </p>
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

  const getCategoryInfo = (categoryId) => {
    const categoryMap = {
      gardening_tips: { name: 'Gardening Tips', icon: Leaf, color: 'from-green-400 to-emerald-500' },
      trading_ideas: { name: 'Trading Ideas', icon: TrendingUp, color: 'from-blue-400 to-cyan-500' },
      general_discussion: { name: 'General Discussion', icon: Users, color: 'from-purple-400 to-violet-500' },
      site_feedback: { name: 'Site Feedback', icon: HelpCircle, color: 'from-orange-400 to-red-500' }
    };
    return categoryMap[categoryId] || { name: 'General', icon: MessageSquare, color: 'from-gray-400 to-gray-500' };
  };

  const filteredTopics = topics.filter(topic => 
    searchTerm === '' || 
    topic.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    topic.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    topic.author.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="clay-card p-12 text-center">
          <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="clay-text-soft">Loading community discussions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="clay-card p-6 mb-6 bg-gradient-to-br from-white/90 to-white/70">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="clay-text-title text-3xl font-bold mb-2">Community Forum</h1>
            <p className="clay-text-subtitle">Connect, share knowledge, and grow together</p>
          </div>
          {user && (
            <button 
              onClick={() => setShowCreateModal(true)}
              className="clay-button-primary px-6 py-3 font-semibold text-white flex items-center gap-2 hover:scale-105 transition-transform"
            >
              <Plus className="w-4 h-4" />
              New Topic
            </button>
          )}
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{topics.length}</div>
            <div className="clay-text-soft text-sm">Total Topics</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{topics.reduce((sum, t) => sum + t.replies, 0)}</div>
            <div className="clay-text-soft text-sm">Total Replies</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{topics.filter(t => t.isNew).length}</div>
            <div className="clay-text-soft text-sm">New Today</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{topics.filter(t => t.isHot).length}</div>
            <div className="clay-text-soft text-sm">Hot Topics</div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Categories */}
          <div className="clay-card p-6 bg-white/70">
            <h3 className="clay-text-title text-lg font-semibold mb-4 flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Categories
            </h3>
            <div className="space-y-3">
              {categories.map(category => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Search and Filters */}
          <div className="clay-card p-4 mb-6 bg-white/70">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 clay-text-soft w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search topics, content, or authors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="clay-input pl-10 w-full"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="clay-input"
                >
                  <option value="recent">Most Recent</option>
                  <option value="popular">Most Popular</option>
                  <option value="views">Most Viewed</option>
                  <option value="replies">Most Replies</option>
                </select>
              </div>
            </div>
          </div>

          {/* Topics List */}
          <div className="space-y-4">
            {filteredTopics.length > 0 ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="clay-text-title text-xl font-semibold">
                    {selectedCategory === 'all' ? 'All Discussions' : getCategoryInfo(selectedCategory).name}
                  </h2>
                  <span className="clay-text-soft text-sm">
                    {filteredTopics.length} topic{filteredTopics.length !== 1 ? 's' : ''}
                    {searchTerm && ` matching "${searchTerm}"`}
                  </span>
                </div>
                
                {filteredTopics.map(topic => (
                  <TopicCard key={topic.id} topic={topic} />
                ))}
              </>
            ) : (
              <div className="clay-card p-12 text-center bg-white/60">
                <div className="w-16 h-16 clay-card rounded-2xl bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-8 h-8 text-white" />
                </div>
                <h3 className="clay-text-title text-xl font-semibold mb-2">
                  {searchTerm ? 'No topics found' : 'No topics yet'}
                </h3>
                <p className="clay-text-soft mb-6">
                  {searchTerm 
                    ? `No topics match "${searchTerm}". Try different keywords.`
                    : selectedCategory === 'all' 
                      ? "Be the first to start a discussion in the community!"
                      : `No topics found in this category. Start the conversation!`
                  }
                </p>
                {user && !searchTerm && (
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
          {filteredTopics.length > 10 && (
            <div className="text-center mt-8">
              <button className="clay-button px-8 py-3 font-semibold hover:bg-white/80">
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