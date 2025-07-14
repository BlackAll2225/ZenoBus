import api from './api';
import adminApi from './adminApi';
import { ApiResponse } from './types';

export interface Route {
  id: number;
  departureProvinceId: number;
  arrivalProvinceId: number;
  distanceKm?: number;
  estimatedTime?: number;
  departureProvince?: {
    id: number;
    name: string;
    code: string;
  };
  arrivalProvince?: {
    id: number;
    name: string;
    code: string;
  };
}

export interface CreateRouteData {
  departureProvinceId: number;
  arrivalProvinceId: number;
  distanceKm?: number;
  estimatedTime?: number;
}

export interface UpdateRouteData {
  departureProvinceId?: number;
  arrivalProvinceId?: number;
  distanceKm?: number;
  estimatedTime?: number;
}

export interface Province {
  id: number;
  name: string;
  code: string;
}

export interface BusType {
  id: number;
  name: string;
  description: string;
}

export interface Bus {
  id: number;
  licensePlate: string;
  seatCount: number;
  description: string;
  busType: BusType;
}

export interface Driver {
  id: number;
  fullName: string;
  phoneNumber: string;
  licenseNumber: string;
}

export interface Trip {
  scheduleId: number;
  departureTime: string;
  price: number;
  status: string;
  route: Route;
  bus: Bus;
  driver: Driver;
}

export interface SearchCriteria {
  departureProvince: Province;
  arrivalProvince: Province;
  departureDate: string;
}

export interface SearchTripsResponse {
  searchCriteria: SearchCriteria;
  totalTrips: number;
  trips: Trip[];
}

// Interfaces for seat selection
export interface Seat {
  id: number;
  seatNumber: string;
  status: 'available' | 'booked' | 'pending' | 'blocked';
  floor: 'upper' | 'lower' | 'main';
  pendingSince?: string;
  pendingSeconds?: number;
}

export interface ScheduleInfo {
  id: number;
  departureTime: string;
  price: number;
  status: string;
  bus: {
    id: number;
    licensePlate: string;
    seatCount: number;
    description: string;
    busType: string;
  };
  route: {
    id: number;
    departureProvinceId: number;
    arrivalProvinceId: number;
    distanceKm: number;
    estimatedTime: number;
    departureProvince: string;
    arrivalProvince: string;
  };
}

export interface SeatsResponse {
  schedule: ScheduleInfo;
  seats: {
    total: number;
    available: number;
    booked: number;
    pending: number;
    blocked: number;
    byFloor: {
      upper: Seat[];
      lower: Seat[];
      main: Seat[];
    };
    allSeats: Seat[];
  };
}

class RouteService {
  // Lấy tất cả tuyến đường
  async getAllRoutes(): Promise<ApiResponse<Route[]>> {
    const response = await api.get<ApiResponse<Route[]>>('/routes');
    return response.data;
  }

  // Lấy tuyến đường theo ID
  async getRouteById(id: number): Promise<ApiResponse<Route>> {
    const response = await api.get<ApiResponse<Route>>(`/routes/${id}`);
    return response.data;
  }

  // Tạo tuyến đường mới (yêu cầu admin token)
  async createRoute(data: CreateRouteData): Promise<ApiResponse<Route>> {
    const response = await adminApi.post<ApiResponse<Route>>('/routes', data);
    return response.data;
  }

  // Cập nhật tuyến đường (yêu cầu admin token)
  async updateRoute(id: number, data: UpdateRouteData): Promise<ApiResponse<Route>> {
    const response = await adminApi.put<ApiResponse<Route>>(`/routes/${id}`, data);
    return response.data;
  }

  // Xóa tuyến đường (yêu cầu admin token)
  async deleteRoute(id: number): Promise<ApiResponse<{ message: string }>> {
    const response = await adminApi.delete<ApiResponse<{ message: string }>>(`/routes/${id}`);
    return response.data;
  }

  // Lấy tuyến đường theo tỉnh
  async getRoutesByProvince(provinceId: number): Promise<ApiResponse<Route[]>> {
    const response = await api.get<ApiResponse<Route[]>>(`/routes/province/${provinceId}`);
    return response.data;
  }

  // Tìm kiếm chuyến xe
  async searchTrips(
    departureProvinceId: number,
    arrivalProvinceId: number,
    departureDate: string
  ): Promise<SearchTripsResponse> {
    try {
      const response = await api.get('/routes/search', {
        params: {
          departureProvinceId,
          arrivalProvinceId,
          departureDate
        }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error searching trips:', error);
      throw error;
    }
  }

  // Lấy danh sách điểm đến từ một tỉnh
  async getDestinationsFromProvince(provinceId: number) {
    try {
      const response = await api.get(`/routes/destinations/${provinceId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching destinations:', error);
      throw error;
    }
  }

  // Lấy thông tin ghế của một schedule
  async getAvailableSeats(scheduleId: number): Promise<SeatsResponse> {
    try {
      const response = await api.get(`/routes/schedules/${scheduleId}/seats`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching available seats:', error);
      throw error;
    }
  }
}

export const routeService = new RouteService(); 