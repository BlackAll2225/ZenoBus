import adminApi from './adminApi';
import api from './api';
import { 
  BookingEntity, 
  BookingStats, 
  BookingFilters, 
  UpdateBookingStatusData, 
  CancelBookingData 
} from './types';
import { convertVNDateToUTCString } from '../lib/dateUtils';

export const bookingService = {
  getAllBookings: async (filters: BookingFilters = {}): Promise<{
    bookings: BookingEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    sortBy?: string;
    sortOrder?: string;
  }> => {
    const params = new URLSearchParams();
    
    if (filters.status) params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);
    // Convert VN dates to UTC for API
    if (filters.startDate) params.append('startDate', convertVNDateToUTCString(filters.startDate));
    if (filters.endDate) params.append('endDate', convertVNDateToUTCString(filters.endDate));
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    console.log('Original booking filters:', filters);
    console.log('Converted API params:', params.toString());

    const response = await adminApi.get(`/admin/bookings?${params.toString()}`);
    return response.data.data;
  },

  getBookingStats: async (filters: BookingFilters = {}): Promise<BookingStats> => {
    const params = new URLSearchParams();
    
    if (filters.status) params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);
    // Convert VN dates to UTC for API
    if (filters.startDate) params.append('startDate', convertVNDateToUTCString(filters.startDate));
    if (filters.endDate) params.append('endDate', convertVNDateToUTCString(filters.endDate));

    console.log('Original booking stats filters:', filters);
    console.log('Converted API params:', params.toString());

    const response = await adminApi.get(`/admin/bookings/stats?${params.toString()}`);
    return response.data.data;
  },

  getBookingById: async (id: number): Promise<BookingEntity> => {
    const response = await adminApi.get(`/admin/bookings/${id}`);
    return response.data.data;
  },

  updateBookingStatus: async (id: number, data: UpdateBookingStatusData): Promise<{ message: string }> => {
    const response = await adminApi.patch(`/admin/bookings/${id}/status`, data);
    return response.data.data;
  },

  cancelBooking: async (id: number, data: CancelBookingData): Promise<{ message: string }> => {
    const response = await adminApi.post(`/admin/bookings/${id}/cancel`, data);
    return response.data.data;
  },

  getBookingsBySchedule: async (scheduleId: number, filters: { page?: number; limit?: number } = {}): Promise<{
    bookings: BookingEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> => {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const response = await adminApi.get(`/admin/bookings/schedule/${scheduleId}?${params.toString()}`);
    return response.data.data;
  },

  // API cho user đăng nhập lấy lịch sử mua vé của chính mình
  getUserBookings: async (filters: { page?: number; limit?: number } = {}): Promise<{
    bookings: BookingEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> => {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const response = await api.get(`/users/profile/bookings?${params.toString()}`);
    return response.data.data;
  },

  // API cho user đăng nhập xem chi tiết booking của chính mình
  getUserBookingDetail: async (bookingId: number): Promise<BookingEntity> => {
    const response = await api.get(`/users/profile/bookings/${bookingId}`);
    return response.data.data;
  }
}; 