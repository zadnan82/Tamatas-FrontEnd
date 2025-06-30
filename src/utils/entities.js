// Mock entities to replace @/entities/all imports
// This provides the same interface as the old Base44 entities

class MockEntity {
  constructor(name) {
    this.name = name;
  }

  static async filter(query = {}, sort = '', limit = null) {
    // Mock filter method - return empty array for now
    console.log(`Mock ${this.name}: filter called with`, { query, sort, limit });
    return [];
  }

  static async list(sort = '', limit = null) {
    // Mock list method - return empty array for now
    console.log(`Mock ${this.name}: list called with`, { sort, limit });
    return [];
  }

  static async get(id) {
    // Mock get method - return null for now
    console.log(`Mock ${this.name}: get called with id`, id);
    return null;
  }

  static async create(data) {
    // Mock create method - return mock object
    console.log(`Mock ${this.name}: create called with`, data);
    return { id: Date.now(), ...data, created_date: new Date().toISOString() };
  }

  static async update(id, data) {
    // Mock update method - return mock object
    console.log(`Mock ${this.name}: update called with`, { id, data });
    return { id, ...data, updated_date: new Date().toISOString() };
  }

  static async delete(id) {
    // Mock delete method
    console.log(`Mock ${this.name}: delete called with id`, id);
    return { success: true };
  }

  static logout() {
    // Mock logout for User entity
    localStorage.removeItem('token');
    window.location.href = '/';
  }

  static login() {
    // Mock login for User entity
    console.log('Mock login triggered');
  }

  static async me() {
    // Mock me method for User entity
    const token = localStorage.getItem('token');
    if (token) {
      return {
        id: '1',
        email: 'demo@example.com',
        full_name: 'Demo User',
        profile_image: null
      };
    }
    throw new Error('Not authenticated');
  }

  static async updateMyUserData(data) {
    // Mock update user data
    console.log('Mock updateMyUserData called with', data);
    return { ...data, updated_date: new Date().toISOString() };
  }
}

// Create mock entities
export const User = class extends MockEntity {
  static name = 'User';
};

export const Listing = class extends MockEntity {
  static name = 'Listing';
};

export const Message = class extends MockEntity {
  static name = 'Message';
};

export const Review = class extends MockEntity {
  static name = 'Review';
};

export const Favorite = class extends MockEntity {
  static name = 'Favorite';
};

export const ForumTopic = class extends MockEntity {
  static name = 'ForumTopic';
};

export const ForumPost = class extends MockEntity {
  static name = 'ForumPost';
};

// Export all entities as a single object (for @/entities/all compatibility)
export default {
  User,
  Listing,
  Message,
  Review,
  Favorite,
  ForumTopic,
  ForumPost
};