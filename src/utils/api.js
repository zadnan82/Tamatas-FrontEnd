
class ApiService {
  constructor() {
    // Use import.meta.env instead of process.env for Vite
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001';
    this.token = localStorage.getItem('token');
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || data.error || 'Request failed');
      }
      
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth methods - FIXED LOGIN METHOD
  async login(email, password) {
    // FastAPI OAuth2PasswordRequestForm expects form data, not JSON
    const formData = new FormData();
    formData.append('username', email); // OAuth2 uses 'username' field but we pass email
    formData.append('password', password);
    
    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      body: formData, // Send as form data, not JSON
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.detail || 'Login failed');
    }
    
    this.setToken(data.access_token);
    
    // Get user info after login
    const user = await this.getCurrentUser();
    return { token: data.access_token, user };
  }

  async register(email, password, full_name) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, full_name }),
    });
    this.setToken(data.access_token);
    return data;
  }

  logout() {
    this.clearToken();
  }

  // User methods
  async getCurrentUser() {
    return this.request('/auth/me');
  }

  async updateProfile(updates) {
    return this.request('/users/me', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async getUser(id) {
    return this.request(`/users/${id}`);
  }

  // Listings methods
  async getListings(filters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        params.append(key, value);
      }
    });
    return this.request(`/listings?${params}`);
  }

  async getListing(id) {
    return this.request(`/listings/${id}`);
  }

  async createListing(listingData) {
    return this.request('/listings', {
      method: 'POST',
      body: JSON.stringify(listingData),
    });
  }

  async updateListing(id, updates) {
    return this.request(`/listings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteListing(id) {
    return this.request(`/listings/${id}`, {
      method: 'DELETE',
    });
  }

  // Messages methods
  async getMessages() {
    return this.request('/messages');
  }

  async sendMessage(messageData) {
    return this.request('/messages', {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  }

  // Reviews methods
  async getUserReviews(userId) {
    return this.request(`/reviews/user/${userId}`);
  }

  async createReview(reviewData) {
    return this.request('/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  }

  // Favorites methods
  async getFavorites() {
    return this.request('/favorites');
  }

  async addToFavorites(listingId) {
    return this.request('/favorites', {
      method: 'POST',
      body: JSON.stringify({ listing_id: listingId }),
    });
  }

  async removeFromFavorites(favoriteId) {
    return this.request(`/favorites/${favoriteId}`, {
      method: 'DELETE',
    });
  }

  // Forum methods
  async getForumTopics(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/forum/topics?${params}`);
  }

  async getForumTopic(id) {
    return this.request(`/forum/topics/${id}`);
  }

  async createForumTopic(topicData) {
    return this.request('/forum/topics', {
      method: 'POST',
      body: JSON.stringify(topicData),
    });
  }

  async createForumPost(postData) {
    return this.request('/forum/posts', {
      method: 'POST',
      body: JSON.stringify(postData),
    });
  }

  // Upload method
  async uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${this.baseUrl}/upload/image`, {
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
}

export default new ApiService();