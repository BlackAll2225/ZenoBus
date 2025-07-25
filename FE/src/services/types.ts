// Common API response types
export interface ApiResponse<T = unknown> {
  status: number;
  message: string;
  data: T;
  success?: boolean; // Optional for backward compatibility
}

export interface ApiError {
  status: number;
  message: string;
  data?: unknown;
}

// Pagination types
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Common entity types
export interface BaseEntity {
  id: number;
  createdAt: string;
  updatedAt?: string;
}

// User types
export interface User extends BaseEntity {
  fullName: string;
  email: string;
  phoneNumber: string;
  status: 'active' | 'inactive';
}

// Admin types - Updated to match backend response
export interface Admin extends BaseEntity {
  fullName: string;
  username: string;
  role: 'admin' | 'manager' | 'support' | 'viewer';
  isActive: boolean;
  lastLoginAt?: string;
}

// Authentication specific types
export interface AuthUser {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  createdAt: string;
}

export interface AuthAdmin {
  id: number;
  fullName: string;
  username: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export interface BusType {
  id: number;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BusEntity {
  id: number;
  licensePlate: string;
  busTypeId: number;
  busType?: BusType;
  seatCount?: number;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateBusData {
  licensePlate: string;
  busTypeId: number;
  seatCount: number;
  status?: string;
}

export interface UpdateBusData {
  licensePlate?: string;
  busTypeId?: number;
  seatCount?: number;
  status?: string;
}

export interface CreateBusTypeData {
  name: string;
  description?: string;
}

export interface UpdateBusTypeData {
  name?: string;
  description?: string;
}

// Seat types
export interface SeatEntity {
  id: number;
  seatNumber: string;
  floor: 'upper' | 'lower' | 'main';
  status: 'available' | 'booked' | 'blocked';
  scheduleId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSeatData {
  seatNumber: string;
  floor: 'upper' | 'lower' | 'main';
  status?: 'available' | 'booked' | 'blocked';
  scheduleId?: number;
}

export interface UpdateSeatData {
  seatNumber?: string;
  floor?: 'upper' | 'lower' | 'main';
  status?: 'available' | 'booked' | 'blocked';
  scheduleId?: number;
}

export interface BulkCreateSeatData {
  scheduleId: number;
  seats: CreateSeatData[];
}

// Booking types - Match getBookingById response structure
export interface BookingUser {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  name: string;
  phone: string;
  schedule:BookingSchedule
}

export interface BookingSchedule {
  id: number;
  departureTime: string;
  price: number;
  seatPrice: number
}

export interface BookingBus {
  licensePlate: string;
  busType: string;
}

export interface BookingRoute {
  id: number;
  departureProvince: {
    id: number;
    name: string;
  };
  arrivalProvince: {
    id: number;
    name: string;
  };
  pickupStop?: string;
  dropoffStop?: string;
}

export interface BookingSeat {
  seatId: number;
  seatNumber: string;
  floor: string;
  price: number;
}

export interface BookingEntity {
  id: number;
  totalPrice: number;
  status: 'pending' | 'paid' | 'cancelled' | 'completed';
  bookedAt: string;
  paymentMethod?: string;
  // Payment related fields
  orderCode?: string;
  paymentStatus?: 'pending' | 'completed' | 'failed' | 'cancelled';
  paymentCompletedAt?: string;
  paymentRequestId?: string;
  paymentUrl?: string;
  user: BookingUser;
  schedule: BookingSchedule;
  bus: BookingBus;
  route: BookingRoute;
  seats?: BookingSeat[];
}

export interface BookingStats {
  total: number;
  pending: number;
  paid: number;
  cancelled: number;
  completed: number;
  totalRevenue: number;
}

export interface BookingFilters {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
  status?: 'pending' | 'paid' | 'cancelled' | 'completed';
  search?: string;
  startDate?: string;
  endDate?: string;
  routeId?: number;
}

export interface UpdateBookingStatusData {
  status: 'paid' | 'completed';
  reason?: string;
}

export interface CancelBookingData {
  reason: string;
} 