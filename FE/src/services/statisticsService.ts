import api from './api';

// Types cho statistics API
export interface DashboardStats {
  bookings: {
    total: number;
    pending: number;
    paid: number;
    cancelled: number;
    completed: number;
    totalRevenue: number;
    completedRevenue: number;
  };
  schedules: {
    total: number;
    scheduled: number;
    completed: number;
    cancelled: number;
  };
  users: {
    total: number;
  };
  routes: {
    total: number;
  };
  buses: {
    total: number;
  };
}

export interface PeriodStats {
  totalBookings: number;
  pendingBookings: number;
  paidBookings: number;
  cancelledBookings: number;
  completedBookings: number;
  totalRevenue: number;
  completedRevenue: number;
  period: {
    startDate: string;
    endDate: string;
  };
}

export interface TopRoute {
  routeId: number;
  departureProvince: string;
  arrivalProvince: string;
  bookingCount: number;
  revenue: number;
}

export interface MonthlyStats {
  year: number;
  months: Array<{
    month: number;
    monthName: string;
    totalBookings: number;
    revenue: number;
  }>;
}

export interface WeeklyStats {
  dayOfWeek: number;
  dayName: string;
  totalBookings: number;
  revenue: number;
}

export interface PaymentMethodStats {
  method: string;
  count: number;
  totalAmount: number;
}

export interface AllStatistics {
  dashboard: DashboardStats;
  topRoutes: TopRoute[];
  monthly: MonthlyStats;
  weekly: WeeklyStats[];
  paymentMethods: PaymentMethodStats[];
}

export interface ScheduleRevenueStats {
  scheduleId: number;
  departure_time: string;
  status: string;
  price: number;
  routeId: number;
  departureProvince: string;
  arrivalProvince: string;
  totalSeats: number;
  bookingCount: number;
  emptySeats: number;
  revenue: number;
}

export interface ScheduleRevenueStatsResponse {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  schedules: ScheduleRevenueStats[];
}

// API calls
export const statisticsService = {
  // Lấy thống kê dashboard
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await api.get('/statistics/dashboard');
    return response.data.data;
  },

  // Lấy thống kê theo khoảng thời gian
  getPeriodStats: async (startDate: string, endDate: string): Promise<PeriodStats> => {
    const response = await api.get('/statistics/period', {
      params: { startDate, endDate }
    });
    return response.data.data;
  },

  // Lấy top routes
  getTopRoutes: async (limit: number = 10): Promise<TopRoute[]> => {
    const response = await api.get('/statistics/top-routes', {
      params: { limit }
    });
    return response.data.data;
  },

  // Lấy thống kê theo tháng
  getMonthlyStats: async (year: number = new Date().getFullYear()): Promise<MonthlyStats> => {
    const response = await api.get('/statistics/monthly', {
      params: { year }
    });
    return response.data.data;
  },

  // Lấy thống kê theo ngày trong tuần
  getWeeklyStats: async (): Promise<WeeklyStats[]> => {
    const response = await api.get('/statistics/weekly');
    return response.data.data;
  },

  // Lấy thống kê payment methods
  getPaymentMethodStats: async (): Promise<PaymentMethodStats[]> => {
    const response = await api.get('/statistics/payment-methods');
    return response.data.data;
  },

  // Lấy thống kê doanh thu theo chuyến đi
  getScheduleRevenueStats: async (filters: {
    routeId?: number | string;
    startDate?: string;
    endDate?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<ScheduleRevenueStatsResponse> => {
    const response = await api.get('/statistics/schedules', { params: filters });
    return response.data.data;
  },

  // Lấy tất cả thống kê
  getAllStats: async (filters?: { year?: number; topRoutesLimit?: number }): Promise<AllStatistics> => {
    const response = await api.get('/statistics/all', {
      params: filters
    });
    return response.data.data;
  }
}; 