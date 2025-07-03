// src/config/api.js - Enhanced version with better auth handling
const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8001',
  
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me',
  },
  
  USERS: {
    UPDATE_ME: '/users/me',
    PROFILE: (userId) => `/users/${userId}`,
    REVIEWS: (userId) => `/reviews/user/${userId}`,
  },
  
  LISTINGS: {
    BASE: '/listings',
    CREATE: '/listings',
    MY_LISTINGS: '/listings/my',
    FEEDS: '/listings/feeds',
    BY_ID: (id) => `/listings/${id}`,
    UPDATE: (id) => `/listings/${id}`,
    DELETE: (id) => `/listings/${id}`,
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
  },
  
  CONTACT: {
    BASE: '/contact',
  },
};

class ApiClient {
  
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.token = localStorage.getItem('auth_token');
    this.refreshing = false;
    this.requestQueue = [];
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  // Enhanced token validation
  isTokenValid() {
    if (!this.token) return false;
    
    try {
      // Basic JWT structure check
      const parts = this.token.split('.');
      if (parts.length !== 3) return false;
      
      // Decode payload to check expiration
      const payload = JSON.parse(atob(parts[1]));
      const now = Date.now() / 1000;
      
      // Check if token expires within next 60 seconds
      return payload.exp && payload.exp > (now + 60);
    } catch (error) {
      console.error('Token validation failed:', error);
      return false;
    }
  }

  // Clear auth state and redirect to login
  handleAuthFailure() {
    this.setToken(null);
    // Don't redirect automatically, let the app handle it
    window.dispatchEvent(new CustomEvent('auth:expired'));
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    // Check token validity before making request
    if (this.token && !this.isTokenValid()) {
      console.warn('Token appears to be expired or invalid');
      this.handleAuthFailure();
      throw new Error('Authentication required');
    }

    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      console.log(`Making ${config.method || 'GET'} request to:`, url);
      if (config.body) {
        console.log('Request body:', config.body);
      }
      
      const response = await fetch(url, config);
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      // Handle different types of failures
      if (!response.ok) {
        // Handle auth failures specifically
        if (response.status === 401) {
          console.warn('Received 401 Unauthorized response');
          this.handleAuthFailure();
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
          console.log('Error response data:', errorData);
        } catch (jsonError) {
          console.log('Could not parse error response:', jsonError);
          errorData = { detail: `Request failed with status ${response.status} ${response.statusText}` };
        }
        
        const error = new Error('API Request Failed');
        error.status = response.status;
        error.data = errorData;
        
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
        console.log('Success response data:', responseData);
        return responseData;
      }
      
      return response;
    } catch (error) {
      console.error('API Request Error Details:', {
        url,
        method: config.method || 'GET',
        error: error.message,
        status: error.status,
        data: error.data
      });
      throw error;
    }
  }

  // Auth methods
  // In your API client, make sure the login method looks like this:

async login(email, password) {
  console.log('🔐 API Client: Starting login request');
  
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
  console.log('🔐 API Client: Login response data:', data);
  console.log('🔐 API Client: Access token received:', data.access_token ? 'YES' : 'NO');
  
  // CRITICAL: This line must be here and must work
  if (data.access_token) {
    console.log('🔐 API Client: Setting token...');
    this.setToken(data.access_token);
    
    // Verify token was set
    const tokenInStorage = localStorage.getItem('auth_token');
    console.log('🔐 API Client: Token in storage after setToken:', tokenInStorage ? 'SET' : 'MISSING');
    console.log('🔐 API Client: Token in this.token:', this.token ? 'SET' : 'MISSING');
    
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
    const data = await this.request(API_CONFIG.AUTH.REGISTER, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (data.access_token) {
      this.setToken(data.access_token);
    }
    
    return data;
  }

  async getCurrentUser() {
    return this.request(API_CONFIG.AUTH.ME);
  }

  logout() {
    this.setToken(null);
  }

  async updateProfile(updates) {
    return this.request(API_CONFIG.USERS.UPDATE_ME, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // User profile methods
  async getUserProfile(userId) {
    return this.request(API_CONFIG.USERS.PROFILE(userId));
  }

  async getUserReviews(userId) {
    return this.request(API_CONFIG.USERS.REVIEWS(userId));
  }

  // Listing methods - Fixed for real database
  async createListing(listingData) {
    const requiredFields = ['title', 'category', 'listing_type', 'images'];
    const missingFields = requiredFields.filter(field => {
      if (field === 'images') {
        return !listingData[field] || listingData[field].length === 0;
      }
      return !listingData[field] || listingData[field].trim() === '';
    });

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

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
      price: listingData.price || null,
      price_unit: listingData.price_unit || 'per_lb',
      quantity_available: listingData.quantity_available || '',
      trade_preference: listingData.trade_preference || 'both',
      images: listingData.images,
      status: 'active',
      harvest_date: formatDateForBackend(listingData.harvest_date),
      organic: Boolean(listingData.organic),
      location: {
        city: listingData.location?.city || '',
        state: listingData.location?.state || '',
        latitude: listingData.location?.latitude || null,
        longitude: listingData.location?.longitude || null
      },
      view_count: 0
    };

    console.log('Sending cleaned listing data:', cleanData);

    return this.request(API_CONFIG.LISTINGS.CREATE, {
      method: 'POST',
      body: JSON.stringify(cleanData),
    });
  }

  async getListings(filters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all' && value !== '') {
        params.append(key, value);
      }
    });
    
    const query = params.toString();
    const endpoint = query ? `${API_CONFIG.LISTINGS.BASE}?${query}` : API_CONFIG.LISTINGS.BASE;
    return this.request(endpoint);
  }

  async getMyListings() {
    return this.request(API_CONFIG.LISTINGS.MY_LISTINGS);
  }

  async getListing(id) {
    return this.request(API_CONFIG.LISTINGS.BY_ID(id));
  }

  async updateListing(id, updates) {
    return this.request(API_CONFIG.LISTINGS.UPDATE(id), {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteListing(id) {
    return this.request(API_CONFIG.LISTINGS.DELETE(id), {
      method: 'DELETE',
    });
  }

  async getFeeds() {
    return this.request(API_CONFIG.LISTINGS.FEEDS);
  }

  // Enhanced Messages methods with better error handling
  async getMessages() {
    try {
      const messages = await this.request(API_CONFIG.MESSAGES.BASE);
      // Ensure dates are properly parsed
      return messages.map(msg => ({
        ...msg,
        created_date: new Date(msg.created_date),
        read_date: msg.read_date ? new Date(msg.read_date) : null
      }));
    } catch (error) {
      console.error('Failed to get messages:', error);
      if (error.status === 401) {
        throw new Error('Please log in to view your messages');
      }
      throw new Error('Failed to load messages. Please try again.');
    }
  }

  async sendMessage(messageData) {
    // Validate required fields
    if (!messageData.recipient_id || !messageData.content) {
      throw new Error('Recipient and message content are required');
    }

    try {
      return await this.request(API_CONFIG.MESSAGES.BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...messageData,
          // Ensure dates are properly formatted if present
          created_date: messageData.created_date 
            ? new Date(messageData.created_date).toISOString() 
            : undefined
        }),
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      if (error.status === 401) {
        throw new Error('Please log in to send messages');
      }
      throw new Error('Failed to send message. Please check your connection and try again.');
    }
  }

  async getConversation(userId) {
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
      console.error(`Failed to get conversation with user ${userId}:`, error);
      if (error.status === 401) {
        throw new Error('Please log in to view conversations');
      }
      throw new Error('Failed to load conversation. Please try again.');
    }
  }

  async markMessageRead(messageId) {
    if (!messageId) {
      throw new Error('Message ID is required');
    }

    try {
      return await this.request(API_CONFIG.MESSAGES.MARK_READ(messageId), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error(`Failed to mark message ${messageId} as read:`, error);
      if (error.status === 401) {
        throw new Error('Please log in to mark messages as read');
      }
      throw new Error('Failed to update message status. Please try again.');
    }
  }

  // Reviews methods
  async createReview(reviewData) {
    return this.request(API_CONFIG.REVIEWS.BASE, {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  }

  // Favorites methods
  async getFavorites() {
    return this.request(API_CONFIG.FAVORITES.BASE);
  }

  async addToFavorites(listingId) {
    return this.request(API_CONFIG.FAVORITES.BASE, {
      method: 'POST',
      body: JSON.stringify({ listing_id: listingId }),
    });
  }

  async removeFromFavorites(favoriteId) {
    return this.request(API_CONFIG.FAVORITES.DELETE(favoriteId), {
      method: 'DELETE',
    });
  }

  // Forum methods
  async getForumTopics(filters = {}) {
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
    return this.request(API_CONFIG.FORUM.TOPIC_BY_ID(topicId));
  }

  async createForumTopic(topicData) {
    return this.request(API_CONFIG.FORUM.TOPICS, {
      method: 'POST',
      body: JSON.stringify(topicData),
    });
  }

  async getTopicPosts(topicId) {
    return this.request(API_CONFIG.FORUM.TOPIC_POSTS(topicId));
  }

  async createForumPost(postData) {
    return this.request(API_CONFIG.FORUM.POSTS, {
      method: 'POST',
      body: JSON.stringify(postData),
    });
  }

  // Contact method
  async sendContact(contactData) {
    return this.request(API_CONFIG.CONTACT.BASE, {
      method: 'POST',
      body: JSON.stringify(contactData),
    });
  }
}

// Create and export API client instance
export const apiClient = new ApiClient();
export default API_CONFIG;