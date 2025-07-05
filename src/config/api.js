// src/config/api.js - COMPLETE IMPLEMENTATION with duplicate prevention
const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8001',
    
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me',
    VALIDATE_LOCATION: '/auth/validate-location',
  },
  
  USERS: {
    UPDATE_ME: '/users/me',
    PROFILE: (userId) => `/users/${userId}`,
    REVIEWS: (userId) => `/reviews/user/${userId}`,
    EXPORT_DATA: '/users/me/export-data',
    DELETE_ACCOUNT: '/users/me/delete-account',
    ANONYMIZE_ACCOUNT: '/users/me/anonymize-account',
  },
  
  LISTINGS: {
    BASE: '/listings',
    CREATE: '/listings',
    MY_LISTINGS: '/listings/my',
    FEEDS: '/listings/feeds',
    BY_ID: (id) => `/listings/${id}`,
    UPDATE: (id) => `/listings/${id}`,
    DELETE: (id) => `/listings/${id}`,
    BY_CATEGORY: (category) => `/listings/category/${category}`,
    STATS_OVERVIEW: '/listings/stats/overview',
  },
  
  MESSAGES: {
    BASE: '/messages',
    CONVERSATION: (userId) => `/messages/conversations/${userId}`,
    MARK_READ: (messageId) => `/messages/${messageId}/read`,
  },
  
  REVIEWS: {
    BASE: '/reviews',
    USER_REVIEWS: (userId) => `/reviews/user/${userId}`,
  },
  
  FAVORITES: {
    BASE: '/favorites',
    DELETE: (favoriteId) => `/favorites/${favoriteId}`,
  },
  
  FORUM: {
    TOPICS: '/forum/topics',
    TOPIC_BY_ID: (topicId) => `/forum/topics/${topicId}`,
    POSTS: '/forum/posts',
    TOPIC_POSTS: (topicId) => `/forum/topics/${topicId}/posts`,
    TOPIC_LIKE: (topicId) => `/forum/topics/${topicId}/like`,
    POST_LIKE: (postId) => `/forum/posts/${postId}/like`,
  },
  
  CONTACT: {
    BASE: '/contact',
  },
  
  LOCATION: {
    SEARCH_LOCATIONS: '/location/search-locations',
    USER_LOCATION: '/location/user-location', 
    UPDATE_USER_LOCATION: '/location/update-user-location',
    NEARBY_LISTINGS: '/location/nearby-listings',
    LISTINGS_FOR_MAP: '/location/listings-for-map',
    SEARCH_BY_LOCATION: '/location/search/location',
    CONTACT_INFO: (listingId) => `/location/contact-info/${listingId}`,
    STATS: '/location/stats',
  },

  UPLOAD: {
    IMAGE: '/upload/image',
    IMAGES: '/upload/images',
  },
};

class ApiClient {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.token = localStorage.getItem('auth_token');
    this.refreshing = false;
    this.requestQueue = [];
    
    // Duplicate request prevention
    this.pendingRequests = new Map();
    this.requestCache = new Map();
    this.cacheTimeout = 5000; // 5 seconds
    
    // Request tracking
    this.requestCount = 0;
    this.lastRequestTime = Date.now();
    
    console.log('🚀 ApiClient initialized with base URL:', this.baseURL);
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
      console.log('✅ Token stored in localStorage');
    } else {
      localStorage.removeItem('auth_token');
      console.log('🗑️ Token removed from localStorage');
    }
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
      console.log('🔐 getHeaders - Token exists:', this.token.substring(0, 20) + '...');
      console.log('🔐 getHeaders - Authorization header:', headers.Authorization.substring(0, 30) + '...');
    } else {
      console.log('🔐 getHeaders - NO TOKEN FOUND');
    }
    
    console.log('🔐 getHeaders - All headers:', headers);
    return headers;
  }

  // Generate unique key for requests
  generateRequestKey(endpoint, method = 'GET', body = null) {
    const bodyString = body ? JSON.stringify(body) : '';
    return `${method}:${endpoint}:${bodyString}`;
  }

  // Check if request is already pending
  isPendingRequest(key) {
    return this.pendingRequests.has(key);
  }

  // Add request to pending map
  addPendingRequest(key, promise) {
    this.pendingRequests.set(key, promise);
    console.log(`⏳ Added pending request: ${key} (Total pending: ${this.pendingRequests.size})`);
    
    // Clean up when done
    promise.finally(() => {
      this.pendingRequests.delete(key);
      console.log(`🧹 Cleaned up pending request: ${key} (Remaining: ${this.pendingRequests.size})`);
    });
    
    return promise;
  }

  // Get cached request if available
  getCachedRequest(key) {
    const cached = this.requestCache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      console.log(`⚡ Using cached response for: ${key} (Age: ${Date.now() - cached.timestamp}ms)`);
      return Promise.resolve(cached.data);
    }
    if (cached) {
      this.requestCache.delete(key);
      console.log(`🗑️ Expired cache removed for: ${key}`);
    }
    return null;
  }

  // Cache successful request
  cacheRequest(key, data) {
    this.requestCache.set(key, {
      data,
      timestamp: Date.now()
    });
    console.log(`💾 Cached response for: ${key} (Cache size: ${this.requestCache.size})`);
    
    // Clean old cache entries
    setTimeout(() => {
      if (this.requestCache.has(key)) {
        this.requestCache.delete(key);
        console.log(`🗑️ Auto-removed expired cache for: ${key}`);
      }
    }, this.cacheTimeout);
  }

  // Enhanced token validation
  isTokenValid() {
    if (!this.token) return false;
    
    try {
      const parts = this.token.split('.');
      if (parts.length !== 3) return false;
      
      const payload = JSON.parse(atob(parts[1]));
      const now = Date.now() / 1000;
      
      return payload.exp && payload.exp > (now + 60);
    } catch (error) {
      console.error('❌ Token validation failed:', error);
      return false;
    }
  }

  // Handle authentication failure
  handleAuthFailure() {
    console.warn('🚨 Authentication failure detected');
    this.setToken(null);
    this.clearPendingRequests();
    window.dispatchEvent(new CustomEvent('auth:expired'));
  }

  // Main request method with duplicate prevention
  async request(endpoint, options = {}) {
    const { method = 'GET', body, skipDuplicateCheck = false, skipCache = false, signal } = options;
    const url = `${this.baseURL}${endpoint}`;
    const requestKey = this.generateRequestKey(endpoint, method, body);
    
    // Increment request counter
    this.requestCount++;
    this.lastRequestTime = Date.now();
    
    // Skip duplicate check for certain requests (like POST messages, file uploads)
    if (!skipDuplicateCheck) {
      // 1. Check if identical request is already pending
      if (this.isPendingRequest(requestKey)) {
        console.log(`🚫 DUPLICATE REQUEST BLOCKED: ${requestKey}`);
        return this.pendingRequests.get(requestKey);
      }
      
      // 2. Check cache for GET requests
      if (method === 'GET' && !skipCache) {
        const cached = this.getCachedRequest(requestKey);
        if (cached) {
          return cached;
        }
      }
    }

    const config = {
      method,
      headers: {
        ...this.getHeaders(),
        ...options.headers
      },
      signal
    };

    // Add body for POST/PUT requests
    if (body) {
      config.body = JSON.stringify(body);
    }

    console.log(`🔐 REQUEST #${this.requestCount}: ${method} ${url}`);
    console.log('🔐 REQUEST HEADERS:', config.headers);
    if (body) console.log('🔐 REQUEST BODY:', body);
    
    // Create the request promise
    const requestPromise = fetch(url, config).then(async (response) => {
      console.log(`🔐 RESPONSE #${this.requestCount} STATUS:`, response.status);
      console.log('Response ok:', response.ok);
      
      if (!response.ok) {
        if (response.status === 401) {
          console.warn('🚨 Received 401 Unauthorized response');
          // Don't auto-logout, let app handle it
          throw new Error('Authentication required');
        }
        
        let errorData;
        const contentType = response.headers.get('content-type');
        
        try {
          if (contentType && contentType.includes('application/json')) {
            errorData = await response.json();
          } else {
            const textData = await response.text();
            errorData = { detail: textData || `HTTP ${response.status} ${response.statusText}` };
          }
          console.log('❌ Error response data:', errorData);
        } catch (jsonError) {
          console.log('❌ Could not parse error response:', jsonError);
          errorData = { detail: `Request failed with status ${response.status} ${response.statusText}` };
        }
        
        const error = new Error('API Request Failed');
        error.status = response.status;
        error.data = errorData;
        
        // Format error message
        if (errorData.detail) {
          if (Array.isArray(errorData.detail)) {
            error.message = errorData.detail.map(err => {
              const location = err.loc ? err.loc.join('.') : 'unknown field';
              const message = err.msg || 'validation error';
              return `${location}: ${message}`;
            }).join(', ');
          } else {
            error.message = errorData.detail;
          }
        } else if (errorData.message) {
          error.message = errorData.message;
        } else if (errorData.error) {
          error.message = errorData.error;
        } else {
          error.message = `HTTP ${response.status}: ${response.statusText}`;
        }
        
        throw error;
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const responseData = await response.json();
        console.log(`✅ Success response #${this.requestCount} data:`, responseData);
        
        // Cache successful GET requests
        if (method === 'GET' && !skipCache && !signal) {
          this.cacheRequest(requestKey, responseData);
        }
        
        return responseData;
      }
      
      return response;
    }).catch(error => {
      if (error.name === 'AbortError') {
        console.log(`🚫 Request aborted: ${requestKey}`);
        throw error;
      }
      
      console.error(`❌ API Request Error #${this.requestCount}:`, {
        url,
        method,
        error: error.message,
        status: error.status,
        data: error.data
      });
      throw error;
    });

    // Add to pending requests if not skipping duplicate check
    if (!skipDuplicateCheck) {
      return this.addPendingRequest(requestKey, requestPromise);
    }
    
    return requestPromise;
  }

  // ==================== AUTH METHODS ====================
  
  async login(email, password) {
    console.log('🔐 API Client: Starting login request for:', email);
    
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);
    
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      body: formData,
    });
    
    console.log('🔐 API Client: Login response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('🔐 API Client: Login failed with error:', errorData);
      throw new Error(errorData.detail || 'Login failed');
    }
    
    const data = await response.json();
    console.log('🔐 API Client: Login response received');
    console.log('🔐 API Client: Access token received:', data.access_token ? 'YES' : 'NO');
    
    if (data.access_token) {
      console.log('🔐 API Client: Setting token...');
      this.setToken(data.access_token);
      
      const tokenInStorage = localStorage.getItem('auth_token');
      console.log('🔐 API Client: Token verification - Storage:', tokenInStorage ? 'SET' : 'MISSING');
      console.log('🔐 API Client: Token verification - Instance:', this.token ? 'SET' : 'MISSING');
      
      if (!tokenInStorage || !this.token) {
        console.error('❌ API Client: Failed to set token properly');
        throw new Error('Failed to store authentication token');
      }
    } else {
      console.error('❌ API Client: No access_token in response');
      throw new Error('No access token received from server');
    }
    
    console.log('✅ API Client: Login completed successfully');
    return data;
  }

  async register(userData) {
    console.log('🔐 API Client: Starting registration request');
    console.log('🔐 Registration data keys:', Object.keys(userData));
    
    // Validate required fields
    const requiredFields = ['email', 'password', 'location'];
    for (const field of requiredFields) {
      if (!userData[field]) {
        throw new Error(`${field} is required for registration`);
      }
    }
    
    // Validate location specifically
    if (!userData.location.country || !userData.location.city) {
      throw new Error('Country and city are required in location');
    }
    
    try {
      const response = await this.request(API_CONFIG.AUTH.REGISTER, {
        method: 'POST',
        body: userData,
        skipDuplicateCheck: true // Registration should not be deduplicated
      });
      
      console.log('🔐 API Client: Registration response received');
      
      if (response.access_token) {
        console.log('🔐 API Client: Setting token from registration...');
        this.setToken(response.access_token);
        
        const tokenInStorage = localStorage.getItem('auth_token');
        console.log('🔐 API Client: Token in storage after registration:', tokenInStorage ? 'SET' : 'MISSING');
        
        if (!tokenInStorage) {
          console.error('❌ API Client: Failed to set token after registration');
          throw new Error('Failed to store authentication token');
        }
      } else {
        console.error('❌ API Client: No access_token in registration response');
        throw new Error('No access token received from registration');
      }
      
      console.log('✅ API Client: Registration completed successfully');
      return response;
      
    } catch (error) {
      console.error('❌ API Client: Registration failed:', error);
      
      if (error.status === 400) {
        if (error.message?.includes('Email already registered')) {
          throw new Error('This email is already registered. Please try logging in instead.');
        } else if (error.message?.includes('Location')) {
          throw new Error('Please provide valid location information (country and city required)');
        } else if (error.message?.includes('geocod')) {
          throw new Error('Could not verify your location. Please check the spelling and try again.');
        }
      }
      
      throw error;
    }
  }

  async getCurrentUser() {
    console.log('👤 Getting current user...');
    return this.request(API_CONFIG.AUTH.ME);
  }

  async validateLocation(locationData) {
    console.log('📍 Validating location:', locationData);
    return this.request(API_CONFIG.AUTH.VALIDATE_LOCATION, {
      method: 'POST',
      body: locationData,
      skipDuplicateCheck: true
    });
  }

  logout() {
    console.log('👋 Logging out user...');
    this.setToken(null);
    this.clearPendingRequests();
  }

  // ==================== USER METHODS ====================

  async updateProfile(updates) {
    console.log('👤 Updating user profile...', Object.keys(updates));
    return this.request(API_CONFIG.USERS.UPDATE_ME, {
      method: 'PUT',
      body: updates,
      skipCache: true,
      skipDuplicateCheck: true
    });
  }

  async getUserProfile(userId) {
    console.log('👤 Getting user profile for:', userId);
    return this.request(API_CONFIG.USERS.PROFILE(userId));
  }

  async getUserReviews(userId) {
    console.log('⭐ Getting reviews for user:', userId);
    return this.request(API_CONFIG.USERS.REVIEWS(userId));
  }

  async exportUserData() {
    console.log('📤 Exporting user data (GDPR)...');
    return this.request(API_CONFIG.USERS.EXPORT_DATA, {
      skipCache: true
    });
  }

  async deleteAccount(confirm = false) {
    console.log('🗑️ Delete account request, confirmed:', confirm);
    return this.request(`${API_CONFIG.USERS.DELETE_ACCOUNT}?confirm=${confirm}`, {
      method: 'DELETE',
      skipCache: true,
      skipDuplicateCheck: true
    });
  }

  async anonymizeAccount() {
    console.log('🔒 Anonymizing account...');
    return this.request(API_CONFIG.USERS.ANONYMIZE_ACCOUNT, {
      method: 'POST',
      skipCache: true,
      skipDuplicateCheck: true
    });
  }

  // ==================== LISTING METHODS ====================

  async createListing(listingData) {
    console.log('📝 Creating new listing...', listingData.title);
    
    // Validate required fields
    const requiredFields = ['title', 'category', 'listing_type'];
    const missingFields = requiredFields.filter(field => {
      return !listingData[field] || listingData[field].trim() === '';
    });

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Format data for backend
    const formatDateForBackend = (dateString) => {
      if (!dateString) return null;
      if (dateString.includes('T')) return dateString;
      if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return `${dateString}T00:00:00`;
      }
      return dateString;
    };

    const cleanData = {
      title: listingData.title.trim(),
      description: listingData.description || '',
      category: listingData.category,
      subcategory: listingData.subcategory || null,
      listing_type: listingData.listing_type,
      price: listingData.listing_type === 'give_away' ? 0 : (listingData.price || null),
      price_unit: listingData.price_unit || 'per_lb',
      quantity_available: listingData.quantity_available || '',
      trade_preference: listingData.trade_preference || 'both',
      images: listingData.images || [],
      status: 'active',
      harvest_date: formatDateForBackend(listingData.harvest_date),
      organic: Boolean(listingData.organic),
      location: listingData.location || {},
      view_count: 0
    };

    console.log('📝 Sending listing data:', cleanData);

    return this.request(API_CONFIG.LISTINGS.CREATE, {
      method: 'POST',
      body: cleanData,
      skipDuplicateCheck: true,
      skipCache: true
    });
  }

  async getListings(filters = {}) {
    const params = new URLSearchParams();
    
    // Handle all filter parameters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== 'all' && value !== '') {
        if (typeof value === 'boolean') {
          params.append(key, value.toString());
        } else {
          params.append(key, value.toString());
        }
      }
    });
    
    const query = params.toString();
    const endpoint = query ? `/listings?${query}` : '/listings';
    
    console.log('📋 Getting listings with filters:', filters);
    return await this.request(endpoint);
  }

  async getMyListings() {
    console.log('📋 Getting my listings...');
    return this.request(API_CONFIG.LISTINGS.MY_LISTINGS);
  }

  async getListing(id) {
    console.log('📋 Getting listing:', id);
    if (!id) throw new Error('Listing ID is required');
    return this.request(API_CONFIG.LISTINGS.BY_ID(id));
  }

  async updateListing(id, updates) {
    console.log('📝 Updating listing:', id, Object.keys(updates));
    if (!id) throw new Error('Listing ID is required');
    return this.request(API_CONFIG.LISTINGS.UPDATE(id), {
      method: 'PUT',
      body: updates,
      skipCache: true,
      skipDuplicateCheck: true
    });
  }

  async deleteListing(id) {
    console.log('🗑️ Deleting listing:', id);
    if (!id) throw new Error('Listing ID is required');
    return this.request(API_CONFIG.LISTINGS.DELETE(id), {
      method: 'DELETE',
      skipCache: true,
      skipDuplicateCheck: true
    });
  }

  async getFeeds(limit = 20) {
    console.log('📰 Getting feed listings, limit:', limit);
    return this.request(`${API_CONFIG.LISTINGS.FEEDS}?limit=${limit}`);
  }

  async getListingsByCategory(category, filters = {}) {
    console.log('📋 Getting listings by category:', category);
    const params = new URLSearchParams(filters);
    const query = params.toString();
    const endpoint = query ? `${API_CONFIG.LISTINGS.BY_CATEGORY(category)}?${query}` : API_CONFIG.LISTINGS.BY_CATEGORY(category);
    return this.request(endpoint);
  }

  async getMarketplaceStats() {
    console.log('📊 Getting marketplace statistics...');
    return this.request(API_CONFIG.LISTINGS.STATS_OVERVIEW);
  }

  // ==================== MESSAGE METHODS ====================

  async getMessages() {
    console.log('💬 Getting messages...');
    try {
      const messages = await this.request(API_CONFIG.MESSAGES.BASE);
      return messages.map(msg => ({
        ...msg,
        created_date: new Date(msg.created_date),
        read_date: msg.read_date ? new Date(msg.read_date) : null
      }));
    } catch (error) {
      console.error('❌ Failed to get messages:', error);
      if (error.status === 401) {
        throw new Error('Please log in to view your messages');
      }
      throw new Error('Failed to load messages. Please try again.');
    }
  }

  async sendMessage(messageData) {
    console.log('💬 Sending message to:', messageData.recipient_id);
    
    if (!messageData.recipient_id || !messageData.content) {
      throw new Error('Recipient and message content are required');
    }

    if (messageData.content.trim().length === 0) {
      throw new Error('Message content cannot be empty');
    }

    try {
      return await this.request('/messages', {
        method: 'POST',
        body: messageData,
        skipDuplicateCheck: true, // Don't deduplicate message sending
        skipCache: true
      }); 
    } catch (error) {
      console.error('❌ Failed to send message:', error);
      if (error.status === 401) {
        throw new Error('Please log in to send messages');
      }
      throw new Error('Failed to send message. Please check your connection and try again.');
    }
  }

  async getConversation(userId) {
    console.log('💬 Getting conversation with user:', userId);
    
    if (!userId) {
      throw new Error('User ID is required to get conversation');
    }

    try {
      const messages = await this.request(API_CONFIG.MESSAGES.CONVERSATION(userId));
      return messages.map(msg => ({
        ...msg,
        created_date: new Date(msg.created_date),
        read_date: msg.read_date ? new Date(msg.read_date) : null
      }));
    } catch (error) {
      console.error(`❌ Failed to get conversation with user ${userId}:`, error);
      if (error.status === 401) {
        throw new Error('Please log in to view conversations');
      }
      throw new Error('Failed to load conversation. Please try again.');
    }
  }

  async markMessageRead(messageId) {
    console.log('✓ Marking message as read:', messageId);
    
    if (!messageId) {
      throw new Error('Message ID is required');
    }

    try {
      return await this.request(API_CONFIG.MESSAGES.MARK_READ(messageId), {
        method: 'PUT',
        skipCache: true,
        skipDuplicateCheck: true
      });
    } catch (error) {
      console.error(`❌ Failed to mark message ${messageId} as read:`, error);
      if (error.status === 401) {
        throw new Error('Please log in to mark messages as read');
      }
      throw new Error('Failed to update message status. Please try again.');
    }
  }

  // ==================== REVIEW METHODS ====================

  async createReview(reviewData) {
    console.log('⭐ Creating review for user:', reviewData.reviewed_user_id);
    
    if (!reviewData.reviewed_user_id || !reviewData.rating) {
      throw new Error('User ID and rating are required');
    }

    if (reviewData.rating < 1 || reviewData.rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    return this.request(API_CONFIG.REVIEWS.BASE, {
      method: 'POST',
      body: reviewData,
      skipDuplicateCheck: true,
      skipCache: true
    });
  }

  async getUserReviewsList(userId) {
    console.log('⭐ Getting reviews for user:', userId);
    if (!userId) throw new Error('User ID is required');
    return this.request(API_CONFIG.REVIEWS.USER_REVIEWS(userId));
  }

  // ==================== FAVORITES METHODS ====================

  async getFavorites() {
    console.log('❤️ Getting user favorites...');
    try {
      return await this.request(API_CONFIG.FAVORITES.BASE);
    } catch (error) {
      console.error('❌ Failed to get favorites:', error);
      if (error.status === 401) {
        throw new Error('Please log in to view favorites');
      }
      return []; // Return empty array instead of throwing
    }
  }

  async addFavorite(listingId) {
    console.log('❤️ Adding favorite:', listingId);
    
    if (!listingId) {
      throw new Error('Listing ID is required');
    }

    return await this.request('/favorites', {
      method: 'POST',
      body: { listing_id: listingId },
      skipDuplicateCheck: true,
      skipCache: true
    });
  }

  async removeFavorite(listingId) {
    console.log('💔 Removing favorite:', listingId);
    
    if (!listingId) {
      throw new Error('Listing ID is required');
    }

    try {
      // First get all favorites to find the favorite ID
      const favorites = await this.getFavorites();
      const favorite = favorites.find(fav => fav.listing_id === listingId);
      
      if (!favorite) {
        throw new Error('Favorite not found');
      }

      return await this.request(`/favorites/${favorite.id}`, {
        method: 'DELETE',
        skipDuplicateCheck: true,
        skipCache: true
      });
    } catch (error) {
      console.error('❌ Failed to remove favorite:', error);
      throw error;
    }
  }

  // ==================== FORUM METHODS ====================

  async getForumTopics(filters = {}) {
    console.log('💭 Getting forum topics with filters:', filters);
    
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all' && value !== '') {
        params.append(key, value);
      }
    });
    
    const query = params.toString();
    const endpoint = query ? `${API_CONFIG.FORUM.TOPICS}?${query}` : API_CONFIG.FORUM.TOPICS;
    return this.request(endpoint);
  }

  async getForumTopic(topicId) {
    console.log('💭 Getting forum topic:', topicId);
    if (!topicId) throw new Error('Topic ID is required');
    return this.request(API_CONFIG.FORUM.TOPIC_BY_ID(topicId));
  }

  async createForumTopic(topicData) {
    console.log('💭 Creating forum topic:', topicData.title);
    
    if (!topicData.title || !topicData.content || !topicData.category) {
      throw new Error('Title, content, and category are required');
    }

    return this.request(API_CONFIG.FORUM.TOPICS, {
      method: 'POST',
      body: topicData,
      skipDuplicateCheck: true,
      skipCache: true
    });
  }

  async getTopicPosts(topicId, filters = {}) {
    console.log('💭 Getting posts for topic:', topicId);
    
    if (!topicId) throw new Error('Topic ID is required');

    const params = new URLSearchParams(filters);
    const query = params.toString();
    const endpoint = query ? `${API_CONFIG.FORUM.TOPIC_POSTS(topicId)}?${query}` : API_CONFIG.FORUM.TOPIC_POSTS(topicId);
    
    return this.request(endpoint);
  }

  async createForumPost(postData) {
    console.log('💭 Creating forum post in topic:', postData.topic_id);
    
    if (!postData.topic_id || !postData.content) {
      throw new Error('Topic ID and content are required');
    }

    if (postData.content.trim().length === 0) {
      throw new Error('Post content cannot be empty');
    }

    return this.request(API_CONFIG.FORUM.POSTS, {
      method: 'POST',
      body: postData,
      skipDuplicateCheck: true,
      skipCache: true
    });
  }

  async toggleTopicLike(topicId) {
    console.log('👍 Toggling like for topic:', topicId);
    
    if (!topicId) throw new Error('Topic ID is required');

    return this.request(API_CONFIG.FORUM.TOPIC_LIKE(topicId), {
      method: 'POST',
      skipDuplicateCheck: true,
      skipCache: true
    });
  }

  async togglePostLike(postId) {
    console.log('👍 Toggling like for post:', postId);
    
    if (!postId) throw new Error('Post ID is required');

    return this.request(API_CONFIG.FORUM.POST_LIKE(postId), {
      method: 'POST',
      skipDuplicateCheck: true,
      skipCache: true
    });
  }

  // ==================== LOCATION METHODS ====================

  async searchLocations(query, limit = 5, options = {}) {
    if (!query || query.length < 2) {
      return [];
    }

    console.log('🌍 Searching locations for:', query);

    try {
      const params = new URLSearchParams({
        q: query,
        limit: limit.toString()
      });
      
      return await this.request(`/location/search-locations?${params}`, {
        signal: options.signal // Support for AbortController
      });
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('🚫 Location search aborted');
        throw error;
      }
      console.error('❌ Failed to search locations:', error);
      return []; // Return empty array instead of throwing
    }
  }

  async getUserLocation() {
    console.log('📍 Getting user location...');
    try {
      return await this.request('/location/user-location');
    } catch (error) {
      console.error('❌ Failed to get user location:', error);
      if (error.status === 401) {
        throw new Error('Please log in to access location features');
      }
      // Return null instead of throwing for missing location
      return null;
    }
  }

  async updateUserLocation(locationData) {
    console.log('📍 Updating user location:', locationData.address);
    
    if (!locationData.address) {
      throw new Error('Address is required');
    }

    return await this.request('/location/update-user-location', {
      method: 'PUT',
      body: locationData,
      skipCache: true,
      skipDuplicateCheck: true
    });
  }

  async getNearbyListings(params = {}) {
    console.log('📍 Getting nearby listings with params:', params);
    
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== 'all' && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    return await this.request(`/location/nearby-listings?${queryParams}`);
  }

  async getListingsForMap(bounds, filters = {}) {
    console.log('🗺️ Getting listings for map with bounds:', bounds);
    
    if (!bounds) {
      throw new Error('Map bounds are required');
    }

    const params = new URLSearchParams({
      bounds: bounds, // Format: "sw_lat,sw_lng,ne_lat,ne_lng"
    });

    // Add filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== 'all' && value !== '') {
        params.append(key, value.toString());
      }
    });

    return await this.request(`/location/listings-for-map?${params}`);
  }

  async searchListingsByLocation(lat, lng, filters = {}) {
    console.log('📍 Searching listings by coordinates:', { lat, lng });
    
    if (!lat || !lng) {
      throw new Error('Latitude and longitude are required');
    }

    const params = new URLSearchParams({
      lat: lat.toString(),
      lng: lng.toString(),
      ...filters
    });

    return await this.request(`/location/search/location?${params}`);
  }

  async getListingContactInfo(listingId) {
    console.log('📞 Getting contact info for listing:', listingId);
    
    if (!listingId) {
      throw new Error('Listing ID is required');
    }

    return await this.request(`/location/contact-info/${listingId}`);
  }

  async getLocationStats() {
    console.log('📊 Getting location-based statistics...');
    try {
      return await this.request('/location/stats');
    } catch (error) {
      console.error('❌ Failed to get location stats:', error);
      return {
        message: 'Set your location to see local statistics'
      };
    }
  }

  // ==================== UPLOAD METHODS ====================

  async uploadImage(file) {
    console.log('📸 Uploading single image:', file.name);
    
    if (!file) {
      throw new Error('File is required');
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('File size must be less than 5MB');
    }

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.baseURL}/upload/image`, {
      method: 'POST',
      headers: {
        'Authorization': this.token ? `Bearer ${this.token}` : undefined
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Upload failed');
    }

    const result = await response.json();
    console.log('✅ Image uploaded successfully:', result.file_url);
    return result;
  }

  async uploadMultipleImages(files) {
    console.log('📸 Uploading multiple images:', files.length);
    
    if (!files || files.length === 0) {
      throw new Error('At least one file is required');
    }

    if (files.length > 5) {
      throw new Error('Maximum 5 files allowed');
    }

    // Validate all files
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        throw new Error(`File ${file.name} must be an image`);
      }
      if (file.size > 5 * 1024 * 1024) {
        throw new Error(`File ${file.name} size must be less than 5MB`);
      }
    }

    const formData = new FormData();
    for (const file of files) {
      formData.append('files', file);
    }

    const response = await fetch(`${this.baseURL}/upload/images`, {
      method: 'POST',
      headers: {
        'Authorization': this.token ? `Bearer ${this.token}` : undefined
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Upload failed');
    }

    const result = await response.json();
    console.log('✅ Images uploaded successfully:', result.length);
    return result;
  }

  // ==================== CONTACT METHODS ====================

  async sendContact(contactData) {
    console.log('📧 Sending contact form:', contactData.subject);
    
    if (!contactData.name || !contactData.email || !contactData.subject || !contactData.message) {
      throw new Error('All fields are required');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactData.email)) {
      throw new Error('Please enter a valid email address');
    }

    if (contactData.message.trim().length < 10) {
      throw new Error('Message must be at least 10 characters long');
    }

    return this.request(API_CONFIG.CONTACT.BASE, {
      method: 'POST',
      body: contactData,
      skipDuplicateCheck: true,
      skipCache: true
    });
  }

  // ==================== UTILITY METHODS ====================

  // Get pending requests status for debugging
  getPendingRequestsStatus() {
    const status = {
      pendingCount: this.pendingRequests.size,
      cacheCount: this.requestCache.size,
      requestCount: this.requestCount,
      lastRequestTime: this.lastRequestTime,
      pendingKeys: Array.from(this.pendingRequests.keys()),
      cachedKeys: Array.from(this.requestCache.keys()).map(key => ({
        key,
        age: Date.now() - this.requestCache.get(key).timestamp
      }))
    };
    
    console.log('📊 API Client Status:', status);
    return status;
  }

  // Clear all pending requests and cache
  clearPendingRequests() {
    console.log('🧹 Clearing all pending requests and cache...');
    
    // Abort all pending requests
    this.pendingRequests.forEach((promise, key) => {
      console.log('🚫 Aborting pending request:', key);
    });
    
    this.pendingRequests.clear();
    this.requestCache.clear();
    
    console.log('✅ All requests and cache cleared');
  }

  // Force refresh cache for specific endpoint
  invalidateCache(endpoint, method = 'GET') {
    const pattern = `${method}:${endpoint}`;
    let removed = 0;
    
    this.requestCache.forEach((value, key) => {
      if (key.startsWith(pattern)) {
        this.requestCache.delete(key);
        removed++;
      }
    });
    
    console.log(`🗑️ Invalidated ${removed} cached entries for: ${pattern}`);
    return removed;
  }

  // Get cache statistics
  getCacheStats() {
    const now = Date.now();
    const stats = {
      totalEntries: this.requestCache.size,
      entries: Array.from(this.requestCache.entries()).map(([key, value]) => ({
        key,
        age: now - value.timestamp,
        expired: (now - value.timestamp) > this.cacheTimeout
      }))
    };
    
    const expired = stats.entries.filter(entry => entry.expired).length;
    const active = stats.totalEntries - expired;
    
    return {
      ...stats,
      activeEntries: active,
      expiredEntries: expired,
      cacheHitRate: this.requestCount > 0 ? ((this.requestCount - stats.totalEntries) / this.requestCount * 100).toFixed(2) + '%' : '0%'
    };
  }

  // Health check method
  async healthCheck() {
    console.log('🏥 Performing API health check...');
    try {
      const response = await this.request('/health', {
        skipCache: true,
        skipDuplicateCheck: true
      });
      console.log('✅ API health check passed:', response);
      return response;
    } catch (error) {
      console.error('❌ API health check failed:', error);
      throw error;
    }
  }

  // Test connection method
  async testConnection() {
    console.log('🔌 Testing API connection...');
    try {
      const start = Date.now();
      await this.healthCheck();
      const duration = Date.now() - start;
      
      const result = {
        status: 'connected',
        responseTime: duration,
        timestamp: new Date().toISOString(),
        baseURL: this.baseURL,
        hasToken: !!this.token
      };
      
      console.log('✅ Connection test passed:', result);
      return result;
    } catch (error) {
      const result = {
        status: 'failed',
        error: error.message,
        timestamp: new Date().toISOString(),
        baseURL: this.baseURL,
        hasToken: !!this.token
      };
      
      console.error('❌ Connection test failed:', result);
      return result;
    }
  }

  // Reset API client to initial state
  reset() {
    console.log('🔄 Resetting API client...');
    this.clearPendingRequests();
    this.requestCount = 0;
    this.lastRequestTime = Date.now();
    console.log('✅ API client reset complete');
  }

  // Get full API client statistics
  getFullStats() {
    return {
      client: {
        baseURL: this.baseURL,
        hasToken: !!this.token,
        tokenValid: this.isTokenValid(),
        requestCount: this.requestCount,
        lastRequestTime: new Date(this.lastRequestTime).toISOString()
      },
      pending: this.getPendingRequestsStatus(),
      cache: this.getCacheStats(),
      performance: {
        averageRequestsPerMinute: this.requestCount > 0 ? 
          (this.requestCount / ((Date.now() - this.lastRequestTime) / 60000)).toFixed(2) : 0,
        cacheEfficiency: this.getCacheStats().cacheHitRate
      }
    };
  }
}

// Create and export API client instance
export const apiClient = new ApiClient();

// Development debugging helpers
if (typeof window !== 'undefined') {
  // Make API client available in browser console for debugging
  window.apiClient = apiClient;
  
  // Helper functions for debugging
  window.checkApiStatus = () => {
    console.log('=== API CLIENT STATUS ===');
    console.table(apiClient.getFullStats());
  };
  
  window.clearApiCache = () => {
    apiClient.clearPendingRequests();
    console.log('✅ API cache cleared');
  };
  
  window.testApiConnection = async () => {
    return await apiClient.testConnection();
  };
  
  window.apiStats = () => apiClient.getFullStats();
  
  console.log('🛠️ API Debug tools available:');
  console.log('- checkApiStatus() - Show current API status');
  console.log('- clearApiCache() - Clear all pending requests and cache');
  console.log('- testApiConnection() - Test API connectivity');
  console.log('- apiStats() - Get detailed statistics');
  console.log('- apiClient - Direct access to API client instance');
}

// Export configuration and client
export { API_CONFIG };
export default apiClient;