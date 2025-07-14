import api from './api';
import { ApiResponse, AuthUser, AuthAdmin } from './types';

export interface LoginCredentials {
  email: string;  // Đổi từ username thành email để phù hợp với API
  password: string;
}

export interface RegisterData {
  fullName: string;
  email: string;
  phoneNumber: string;  // Đảm bảo tên field đúng với API
  password: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface AdminAuthResponse {
  token: string;
  admin: AuthAdmin;
}

export const authService = {
  // User authentication
  login: async (credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    return response.data;
  },

  register: async (userData: RegisterData): Promise<ApiResponse<AuthResponse>> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', userData);
    return response.data;
  },

  forgotPassword: async (email: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await api.post<ApiResponse<{ message: string }>>('/auth/forgot-password', { email });
    return response.data;
  },

  // Admin authentication
  adminLogin: async (credentials: { username: string; password: string }): Promise<ApiResponse<AdminAuthResponse>> => {
    const response = await api.post<ApiResponse<AdminAuthResponse>>('/admin/login', credentials);
    return response.data;
  },

  // Logout (client-side only)
  logout: (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  },

  // Get current user token
  getToken: (): string | null => {
    return localStorage.getItem('token');
  },

  // Get current username
  getUsername: (): string | null => {
    return localStorage.getItem('username');
  }
}; 