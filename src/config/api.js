// API Configuration - Centralized endpoint management
const API_CONFIG = {
  // Base URLs
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8001',
  
  // Auth endpoints
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me',
    REFRESH: '/auth/refresh'
  },
  
  // User endpoints
  USERS: {
    ME: '/users/me',
    PROFILE: (id) => `/users/${id}`,
    UPDATE_ME: '/users/me',
    REVIEWS: (id) => `/users/${id}/reviews`
  },
  
  // Listing endpoints
  LISTINGS: {
    BASE: '/listings',
    MY_LISTINGS: '/listings/my',
    FEEDS: '/listings/feeds',
    BY_ID: (id) => `/listings/${id}`,
    CREATE: '/listings',
    UPDATE: (id) => `/listings/${id}`,
    DELETE: (id) => `/listings/${id}`
  },
  
  // Message endpoints
  MESSAGES: {
    BASE: '/messages',
    CONVERSATION: (userId) => `/messages/conversations/${userId}`,
    MARK_READ: (messageId) => `/messages/${messageId}/read`
  },
  
  // Review endpoints
  REVIEWS: {
    BASE: '/reviews',
    USER_REVIEWS: (userId) => `/reviews/user/${userId}`
  },
  
  // Favorite endpoints
  FAVORITES: {
    BASE: '/favorites',
    DELETE: (id) => `/favorites/${id}`
  },
  
  // Forum endpoints
  FORUM: {
    TOPICS: '/forum/topics',
    TOPIC_BY_ID: (id) => `/forum/topics/${id}`,
    POSTS: '/forum/posts',
    TOPIC_POSTS: (topicId) => `/forum/topics/${topicId}/posts`
  },
  
  // Upload endpoints
  UPLOAD: {
    IMAGE: '/upload/image',
    IMAGES: '/upload/images'
  },
  
  // Contact endpoints
  CONTACT: {
    BASE: '/contact'
  }
};

// API Client class for making requests
class ApiClient {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.token = localStorage.getItem('auth_token');
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

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Request failed' }));
        throw new Error(errorData.detail || errorData.message || 'Request failed');
      }

      // Handle empty responses
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      return response;
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  // Auth methods
  async login(email, password) {
    const formData = new FormData();
    formData.append('username', email); // FastAPI OAuth2 uses 'username'
    formData.append('password', password);
    
    const response = await fetch(`${this.baseURL}${API_CONFIG.AUTH.LOGIN}`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Login failed');
    }
    
    const data = await response.json();
    this.setToken(data.access_token);
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

  // User methods
  async updateProfile(updates) {
    return this.request(API_CONFIG.USERS.UPDATE_ME, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async getUserProfile(userId) {
    return this.request(API_CONFIG.USERS.PROFILE(userId));
  }

  async getUserReviews(userId) {
    return this.request(API_CONFIG.USERS.REVIEWS(userId));
  }

  // Listing methods
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

  async getFeeds() {
    return this.request(API_CONFIG.LISTINGS.FEEDS);
  }

  async getListing(id) {
    return this.request(API_CONFIG.LISTINGS.BY_ID(id));
  }

  async createListing(listingData) {
    return this.request(API_CONFIG.LISTINGS.CREATE, {
      method: 'POST',
      body: JSON.stringify(listingData),
    });
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

  // Message methods
  async getMessages() {
    return this.request(API_CONFIG.MESSAGES.BASE);
  }

  async sendMessage(messageData) {
    return this.request(API_CONFIG.MESSAGES.BASE, {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  }

  async getConversation(userId) {
    return this.request(API_CONFIG.MESSAGES.CONVERSATION(userId));
  }

  async markMessageRead(messageId) {
    return this.request(API_CONFIG.MESSAGES.MARK_READ(messageId), {
      method: 'PUT',
    });
  }

  // Review methods
  async createReview(reviewData) {
    return this.request(API_CONFIG.REVIEWS.BASE, {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  }

  async getUserReviews(userId) {
    return this.request(API_CONFIG.REVIEWS.USER_REVIEWS(userId));
  }

  // Favorite methods
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
    const params = new URLSearchParams(filters);
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

  async createForumPost(postData) {
    return this.request(API_CONFIG.FORUM.POSTS, {
      method: 'POST',
      body: JSON.stringify(postData),
    });
  }

  async getTopicPosts(topicId, filters = {}) {
    const params = new URLSearchParams(filters);
    const query = params.toString();
    const endpoint = query 
      ? `${API_CONFIG.FORUM.TOPIC_POSTS(topicId)}?${query}` 
      : API_CONFIG.FORUM.TOPIC_POSTS(topicId);
    return this.request(endpoint);
  }

  // Upload methods
  async uploadImage(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${this.baseURL}${API_CONFIG.UPLOAD.IMAGE}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    return response.json();
  }

  async uploadImages(files) {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    
    const response = await fetch(`${this.baseURL}${API_CONFIG.UPLOAD.IMAGES}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    return response.json();
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