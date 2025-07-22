const StatisticsModel = require('../models/StatisticsModel');

// Lấy thống kê dashboard
const getDashboardStatistics = async () => {
  try {
    const stats = await StatisticsModel.getDashboardStats();
    
    // Format dữ liệu
    return {
      bookings: {
        total: parseInt(stats.bookings.totalBookings) || 0,
        pending: parseInt(stats.bookings.pendingBookings) || 0,
        paid: parseInt(stats.bookings.paidBookings) || 0,
        cancelled: parseInt(stats.bookings.cancelledBookings) || 0,
        completed: parseInt(stats.bookings.completedBookings) || 0,
        totalRevenue: parseFloat(stats.bookings.totalRevenue) || 0,
        completedRevenue: parseFloat(stats.bookings.completedRevenue) || 0
      },
      schedules: {
        total: parseInt(stats.schedules.totalSchedules) || 0,
        scheduled: parseInt(stats.schedules.scheduledSchedules) || 0,
        completed: parseInt(stats.schedules.completedSchedules) || 0,
        cancelled: parseInt(stats.schedules.cancelledSchedules) || 0
      },
      users: {
        total: parseInt(stats.users.totalUsers) || 0
      },
      routes: {
        total: parseInt(stats.routes.totalRoutes) || 0
      },
      buses: {
        total: parseInt(stats.buses.totalBuses) || 0
      }
    };
  } catch (error) {
    throw new Error(`Error getting dashboard statistics: ${error.message}`);
  }
};

// Lấy thống kê theo khoảng thời gian
const getStatisticsByPeriod = async (startDate, endDate) => {
  try {
    const stats = await StatisticsModel.getStatsByPeriod(startDate, endDate);
    
    return {
      totalBookings: parseInt(stats.totalBookings) || 0,
      pendingBookings: parseInt(stats.pendingBookings) || 0,
      paidBookings: parseInt(stats.paidBookings) || 0,
      cancelledBookings: parseInt(stats.cancelledBookings) || 0,
      completedBookings: parseInt(stats.completedBookings) || 0,
      totalRevenue: parseFloat(stats.totalRevenue) || 0,
      completedRevenue: parseFloat(stats.completedRevenue) || 0,
      period: {
        startDate,
        endDate
      }
    };
  } catch (error) {
    throw new Error(`Error getting statistics by period: ${error.message}`);
  }
};

// Lấy top routes
const getTopRoutesStatistics = async (limit = 10) => {
  try {
    const routes = await StatisticsModel.getTopRoutes(limit);
    
    return routes.map(route => ({
      routeId: route.routeId,
      departureProvince: route.departureProvince,
      arrivalProvince: route.arrivalProvince,
      bookingCount: parseInt(route.bookingCount) || 0,
      revenue: parseFloat(route.revenue) || 0
    }));
  } catch (error) {
    throw new Error(`Error getting top routes statistics: ${error.message}`);
  }
};

// Lấy thống kê theo tháng
const getMonthlyStatistics = async (year = new Date().getFullYear()) => {
  try {
    const monthlyStats = await StatisticsModel.getMonthlyStats(year);
    
    // Tạo array 12 tháng với dữ liệu mặc định
    const months = Array.from({ length: 12 }, (_, i) => {
      const monthData = monthlyStats.find(stat => stat.month === i + 1);
      return {
        month: i + 1,
        monthName: new Date(Date.UTC(year, i, 1)).toLocaleString('vi-VN', { month: 'long', timeZone: 'Asia/Ho_Chi_Minh' }),
        totalBookings: monthData ? parseInt(monthData.totalBookings) : 0,
        revenue: monthData ? parseFloat(monthData.revenue) : 0
      };
    });
    
    return {
      year,
      months
    };
  } catch (error) {
    throw new Error(`Error getting monthly statistics: ${error.message}`);
  }
};

// Lấy thống kê theo ngày trong tuần
const getWeeklyStatistics = async () => {
  try {
    const weeklyStats = await StatisticsModel.getWeeklyStats();
    
    const dayNames = [
      'Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 
      'Thứ 5', 'Thứ 6', 'Thứ 7'
    ];
    
    return weeklyStats.map(stat => ({
      dayOfWeek: stat.dayOfWeek,
      dayName: dayNames[stat.dayOfWeek - 1] || `Ngày ${stat.dayOfWeek}`,
      totalBookings: parseInt(stat.totalBookings) || 0,
      revenue: parseFloat(stat.revenue) || 0
    }));
  } catch (error) {
    throw new Error(`Error getting weekly statistics: ${error.message}`);
  }
};

// Lấy thống kê payment methods
const getPaymentMethodStatistics = async () => {
  try {
    const paymentStats = await StatisticsModel.getPaymentMethodStats();
    
    return paymentStats.map(stat => ({
      method: stat.payment_method,
      count: parseInt(stat.count) || 0,
      totalAmount: parseFloat(stat.totalAmount) || 0
    }));
  } catch (error) {
    throw new Error(`Error getting payment method statistics: ${error.message}`);
  }
};

// Lấy tất cả thống kê
const getAllStatistics = async (filters = {}) => {
  try {
    const dashboardStats = await getDashboardStatistics();
    const topRoutes = await getTopRoutesStatistics(filters.topRoutesLimit || 5);
    const monthlyStats = await getMonthlyStatistics(filters.year);
    const weeklyStats = await getWeeklyStatistics();
    const paymentStats = await getPaymentMethodStatistics();
    
    return {
      dashboard: dashboardStats,
      topRoutes,
      monthly: monthlyStats,
      weekly: weeklyStats,
      paymentMethods: paymentStats
    };
  } catch (error) {
    throw new Error(`Error getting all statistics: ${error.message}`);
  }
};

module.exports = {
  getDashboardStatistics,
  getStatisticsByPeriod,
  getTopRoutesStatistics,
  getMonthlyStatistics,
  getWeeklyStatistics,
  getPaymentMethodStatistics,
  getAllStatistics
}; 