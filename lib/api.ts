// API service layer for all endpoints
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

interface ApiResponse<T> {
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

interface ApiError {
  message: string;
  status: number;
}

// Generic API client with authentication
class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      // For Next.js API routes, we need to handle server-side vs client-side differently
      let url: string;
      
      if (typeof window === 'undefined') {
        // Server-side: construct full URL for internal API calls
        const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
        const host = process.env.VERCEL_URL || 'localhost:3000';
        url = `${protocol}://${host}${endpoint}`;
      } else {
        // Client-side: use relative URL
        url = endpoint;
      }
      
      const config: RequestInit = {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      };

      console.log('API request URL:', url);
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      };
    }
  }

  // Products API
  async getProducts(params?: {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: number;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    sortOrder?: string;
  }) {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }

    return this.request<{
      products: any[];
      pagination: any;
    }>(`/api/products?${searchParams.toString()}`);
  }

  async getProduct(id: string) {
    const response = await this.request<any>(`/api/products/${id}`);
    
    // Log for debugging
    if (response.error) {
      console.error(`Failed to fetch product ${id}:`, response.error);
    }
    
    return response;
  }

  async searchProducts(query: string) {
    return this.request<any[]>(`/api/products/search?q=${encodeURIComponent(query)}`);
  }

  // Categories API
  async getCategories() {
    return this.request<any[]>('/api/categories');
  }

  async getCategory(id: string) {
    return this.request<any>(`/api/categories/${id}`);
  }

  // Orders API
  async getOrders(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }) {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }

    return this.request<{orders: any[], pagination: any}>(`/api/orders?${searchParams.toString()}`);
  }

  async getOrder(id: string) {
    return this.request<any>(`/api/orders/${id}`);
  }

  async createOrder(orderData: any) {
    return this.request<any>('/api/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  // Cart API
  async getCart() {
    return this.request<any>('/api/cart');
  }

  async addToCart(productId: string, quantity: number = 1) {
    return this.request<any>(`/api/cart/${productId}`, {
      method: 'POST',
      body: JSON.stringify({ quantity }),
    });
  }

  async updateCartItem(productId: string, quantity: number) {
    return this.request<any>(`/api/cart/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  }

  async removeFromCart(productId: string) {
    return this.request<any>(`/api/cart/${productId}`, {
      method: 'DELETE',
    });
  }

  async mergeCart(guestCart: any[]) {
    return this.request<any>('/api/cart/merge', {
      method: 'POST',
      body: JSON.stringify({ items: guestCart }),
    });
  }

  // Wishlist API
  async getWishlist() {
    return this.request<any[]>('/api/wishlist');
  }

  async addToWishlist(productId: string) {
    return this.request<any>(`/api/wishlist/${productId}`, {
      method: 'POST',
    });
  }

  async removeFromWishlist(productId: string) {
    return this.request<any>(`/api/wishlist/${productId}`, {
      method: 'DELETE',
    });
  }

  // Reviews API
  async getProductReviews(productId: string) {
    return this.request<any[]>(`/api/reviews?productId=${productId}`);
  }

  async createReview(reviewData: any) {
    return this.request<any>('/api/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  }

  async markReviewHelpful(reviewId: string) {
    return this.request<any>(`/api/reviews/${reviewId}/helpful`, {
      method: 'POST',
    });
  }

  // User API
  async getUserProfile() {
    return this.request<any>('/api/users/me');
  }

  async updateUserProfile(userData: any) {
    return this.request<any>('/api/users/me', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // Admin Stats
  async getStats() {
    return this.request<any>('/api/admin/stats');
  }

  async getAllUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }) {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }

    return this.request<{
      users: any[];
      pagination: any;
    }>(`/api/users?${searchParams.toString()}`);
  }

  async getUserById(id: string) {
    return this.request<any>(`/api/users/${id}`);
  }

  // Addresses API
  async getUserAddresses() {
    return this.request<any[]>('/api/addresses');
  }

  async createAddress(addressData: any) {
    return this.request<any>('/api/addresses', {
      method: 'POST',
      body: JSON.stringify(addressData),
    });
  }

  async updateAddress(id: string, addressData: any) {
    return this.request<any>(`/api/addresses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(addressData),
    });
  }

  async deleteAddress(id: string) {
    return this.request<any>(`/api/addresses/${id}`, {
      method: 'DELETE',
    });
  }

  // Coupons API
  async getCoupons(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }) {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }

    return this.request<{coupons: any[], pagination: any}>(`/api/coupons?${searchParams.toString()}`);
  }

  async getCoupon(id: string) {
    return this.request<any>(`/api/coupons/${id}`);
  }

  async createCoupon(couponData: any) {
    return this.request<any>('/api/coupons', {
      method: 'POST',
      body: JSON.stringify(couponData),
    });
  }

  async updateCoupon(id: string, couponData: any) {
    return this.request<any>(`/api/coupons/${id}`, {
      method: 'PUT',
      body: JSON.stringify(couponData),
    });
  }

  async deleteCoupon(id: string) {
    return this.request<any>(`/api/coupons/${id}`, {
      method: 'DELETE',
    });
  }

  async validateCoupon(code: string) {
    return this.request<any>(`/api/coupons/validate?code=${encodeURIComponent(code)}`);
  }

  // Shipping API
  async getShippingMethods() {
    return this.request<any[]>('/api/shipping/methods');
  }

  async calculateShipping(data: any) {
    return this.request<any>('/api/shipping/calculate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Payments API
  async createPaymentIntent(data: any) {
    return this.request<any>('/api/payments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getAllPayments(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    method?: string;
  }) {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }

    return this.request<{
      payments: any[];
      pagination: any;
    }>(`/api/payments?${searchParams.toString()}`);
  }

  async updatePayment(paymentId: number, data: any) {
    return this.request<any>('/api/payments', {
      method: 'PUT',
      body: JSON.stringify({ paymentId, ...data }),
    });
  }

  // Settings API
  async getSettings() {
    return this.request<any>('/api/settings');
  }

  async getSetting(key: string) {
    return this.request<any>(`/api/settings/${key}`);
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Convenience functions for common operations
export const api = {
  products: {
    getAll: (params?: any) => apiClient.getProducts(params),
    getById: (id: string) => apiClient.getProduct(id),
    search: (query: string) => apiClient.searchProducts(query),
  },
  categories: {
    getAll: () => apiClient.getCategories(),
    getById: (id: string) => apiClient.getCategory(id),
  },
  orders: {
    getAll: (params?: any) => apiClient.getOrders(params),
    getById: (id: string) => apiClient.getOrder(id),
    create: (orderData: any) => apiClient.createOrder(orderData),
  },
  cart: {
    get: () => apiClient.getCart(),
    addItem: (productId: string, quantity?: number) => apiClient.addToCart(productId, quantity),
    updateItem: (productId: string, quantity: number) => apiClient.updateCartItem(productId, quantity),
    removeItem: (productId: string) => apiClient.removeFromCart(productId),
    merge: (guestCart: any[]) => apiClient.mergeCart(guestCart),
  },
  wishlist: {
    get: () => apiClient.getWishlist(),
    addItem: (productId: string) => apiClient.addToWishlist(productId),
    removeItem: (productId: string) => apiClient.removeFromWishlist(productId),
  },
  reviews: {
    getByProduct: (productId: string) => apiClient.getProductReviews(productId),
    create: (reviewData: any) => apiClient.createReview(reviewData),
    markHelpful: (reviewId: string) => apiClient.markReviewHelpful(reviewId),
  },
  user: {
    getProfile: () => apiClient.getUserProfile(),
    updateProfile: (userData: any) => apiClient.updateUserProfile(userData),
  },
  users: {
    getAll: (params?: any) => apiClient.getAllUsers(params),
    getById: (id: string) => apiClient.getUserById(id),
  },
  addresses: {
    getAll: () => apiClient.getUserAddresses(),
    create: (addressData: any) => apiClient.createAddress(addressData),
    update: (id: string, addressData: any) => apiClient.updateAddress(id, addressData),
    delete: (id: string) => apiClient.deleteAddress(id),
  },
  coupons: {
    getAll: (params?: any) => apiClient.getCoupons(params),
    getById: (id: string) => apiClient.getCoupon(id),
    create: (couponData: any) => apiClient.createCoupon(couponData),
    update: (id: string, couponData: any) => apiClient.updateCoupon(id, couponData),
    delete: (id: string) => apiClient.deleteCoupon(id),
    validate: (code: string) => apiClient.validateCoupon(code),
  },
  shipping: {
    getMethods: () => apiClient.getShippingMethods(),
    calculate: (data: any) => apiClient.calculateShipping(data),
  },
  payments: {
    createIntent: (data: any) => apiClient.createPaymentIntent(data),
    getAll: (params?: any) => apiClient.getAllPayments(params),
    update: (paymentId: number, data: any) => apiClient.updatePayment(paymentId, data),
  },
  settings: {
    getAll: () => apiClient.getSettings(),
    getByKey: (key: string) => apiClient.getSetting(key),
  },
  admin: {
    getStats: () => apiClient.getStats(),
  },
};
