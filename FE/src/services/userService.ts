import api from './api';

export interface Customer {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'inactive';
  totalBookings?: number;
  phoneNumber: string;
}

export interface UserFilters {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  newUsersThisMonth: number;
  topUsers: Array<{
    id: string;
    fullName: string;
    totalBookings: number;
  }>;
}

export interface UserResponse {
  users: Customer[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Interface cho user profile
export interface UserProfile {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  createdAt: string;
  updatedAt: string;
}

// Interface cho update profile data
export interface UpdateProfileData {
  fullName?: string;
  phoneNumber?: string;
  // email không được phép cập nhật bởi user
}

class UserService {
  // Get all users with filtering and pagination
  async getUsers(filters: UserFilters = {}): Promise<UserResponse> {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    const response = await api.get(`/users?${params.toString()}`);
    return response.data.data;
  }

  // Get user by ID
  async getUserById(id: string): Promise<Customer> {
    const response = await api.get(`/users/${id}`);
    return response.data.data;
  }

  // Create new user
  async createUser(userData: Partial<Customer>): Promise<Customer> {
    const response = await api.post('/users', userData);
    return response.data.data;
  }

  // Update user
  async updateUser(id: string, userData: Partial<Customer>): Promise<Customer> {
    const response = await api.put(`/users/${id}`, userData);
    return response.data.data;
  }

  // Delete user
  async deleteUser(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  }

  // Get user statistics
  async getUserStats(filters?: UserFilters): Promise<UserStats> {
    const params = new URLSearchParams();
    
    if (filters?.search) params.append('search', filters.search);
    if (filters?.status) params.append('status', filters.status);

    const response = await api.get(`/users/stats?${params.toString()}`);
    return response.data.data;
  }

  // Get user with bookings
  async getUserWithBookings(id: string): Promise<Customer & { bookings: unknown[] }> {
    const response = await api.get(`/users/${id}/with-bookings`);
    return response.data.data;
  }

  // Get current user profile (authenticated user)
  async getCurrentUserProfile(): Promise<UserProfile> {
    const response = await api.get('/users/profile');
    return response.data.data;
  }

  // Update current user profile (authenticated user)
  async updateCurrentUserProfile(updateData: UpdateProfileData): Promise<UserProfile> {
    const response = await api.put('/users/profile', updateData);
    return response.data.data;
  }
}

export const userService = new UserService(); 