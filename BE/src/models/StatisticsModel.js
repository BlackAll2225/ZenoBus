const { sql, poolPromise } = require("../config/db");

// Thống kê tổng quan
const getDashboardStats = async () => {
  const pool = await poolPromise;
  
  try {
    // Thống kê bookings
    const bookingStats = await pool.request().query(`
      SELECT 
        COUNT(*) as totalBookings,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pendingBookings,
        COUNT(CASE WHEN status = 'paid' THEN 1 END) as paidBookings,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelledBookings,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completedBookings,
        SUM(CASE WHEN status = 'paid' THEN total_price ELSE 0 END) as totalRevenue,
        SUM(CASE WHEN status = 'completed' THEN total_price ELSE 0 END) as completedRevenue
      FROM bookings
    `);

    // Thống kê schedules
    const scheduleStats = await pool.request().query(`
      SELECT 
        COUNT(*) as totalSchedules,
        COUNT(CASE WHEN status = 'scheduled' THEN 1 END) as scheduledSchedules,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completedSchedules,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelledSchedules
      FROM schedules
    `);

    // Thống kê users
    const userStats = await pool.request().query(`
      SELECT COUNT(*) as totalUsers
      FROM users
    `);

    // Thống kê routes
    const routeStats = await pool.request().query(`
      SELECT COUNT(*) as totalRoutes
      FROM routes
    `);

    // Thống kê buses
    const busStats = await pool.request().query(`
      SELECT COUNT(*) as totalBuses
      FROM buses
    `);

    return {
      bookings: bookingStats.recordset[0],
      schedules: scheduleStats.recordset[0],
      users: userStats.recordset[0],
      routes: routeStats.recordset[0],
      buses: busStats.recordset[0]
    };
  } catch (error) {
    throw new Error(`Error getting dashboard stats: ${error.message}`);
  }
};

// Thống kê theo thời gian
const getStatsByPeriod = async (startDate, endDate) => {
  const pool = await poolPromise;
  
  try {
    const result = await pool.request()
      .input('startDate', sql.Date, startDate)
      .input('endDate', sql.Date, endDate)
      .query(`
        SELECT 
          COUNT(*) as totalBookings,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pendingBookings,
          COUNT(CASE WHEN status = 'paid' THEN 1 END) as paidBookings,
          COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelledBookings,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completedBookings,
          SUM(CASE WHEN status = 'paid' THEN total_price ELSE 0 END) as totalRevenue,
          SUM(CASE WHEN status = 'completed' THEN total_price ELSE 0 END) as completedRevenue
        FROM bookings
        WHERE CAST(booked_at AS DATE) BETWEEN @startDate AND @endDate
      `);

    return result.recordset[0];
  } catch (error) {
    throw new Error(`Error getting stats by period: ${error.message}`);
  }
};

// Thống kê top routes
const getTopRoutes = async (limit = 10) => {
  const pool = await poolPromise;
  
  try {
    const result = await pool.request()
      .input('limit', sql.Int, limit)
      .query(`
        SELECT TOP(@limit)
          r.id as routeId,
          dp.name as departureProvince,
          ap.name as arrivalProvince,
          COUNT(b.id) as bookingCount,
          SUM(CASE WHEN b.status = 'paid' THEN b.total_price ELSE 0 END) as revenue
        FROM routes r
        JOIN provinces dp ON r.departure_province_id = dp.id
        JOIN provinces ap ON r.arrival_province_id = ap.id
        LEFT JOIN schedules s ON r.id = s.route_id
        LEFT JOIN bookings b ON s.id = b.schedule_id
        GROUP BY r.id, dp.name, ap.name
        ORDER BY bookingCount DESC
      `);

    return result.recordset;
  } catch (error) {
    throw new Error(`Error getting top routes: ${error.message}`);
  }
};

// Thống kê theo tháng
const getMonthlyStats = async (year) => {
  const pool = await poolPromise;
  
  try {
    const result = await pool.request()
      .input('year', sql.Int, year)
      .query(`
        SELECT 
          MONTH(booked_at) as month,
          COUNT(*) as totalBookings,
          SUM(CASE WHEN status = 'paid' THEN total_price ELSE 0 END) as revenue
        FROM bookings
        WHERE YEAR(booked_at) = @year
        GROUP BY MONTH(booked_at)
        ORDER BY month
      `);

    return result.recordset;
  } catch (error) {
    throw new Error(`Error getting monthly stats: ${error.message}`);
  }
};

// Thống kê theo ngày trong tuần
const getWeeklyStats = async () => {
  const pool = await poolPromise;
  
  try {
    const result = await pool.request().query(`
      SELECT 
        DATEPART(WEEKDAY, booked_at) as dayOfWeek,
        COUNT(*) as totalBookings,
        SUM(CASE WHEN status = 'paid' THEN total_price ELSE 0 END) as revenue
      FROM bookings
      WHERE booked_at >= DATEADD(day, -30, GETDATE())
      GROUP BY DATEPART(WEEKDAY, booked_at)
      ORDER BY dayOfWeek
    `);

    return result.recordset;
  } catch (error) {
    throw new Error(`Error getting weekly stats: ${error.message}`);
  }
};

// Thống kê payment methods
const getPaymentMethodStats = async () => {
  const pool = await poolPromise;
  
  try {
    const result = await pool.request().query(`
      SELECT 
        payment_method,
        COUNT(*) as count,
        SUM(total_price) as totalAmount
      FROM bookings
      WHERE payment_method IS NOT NULL
      GROUP BY payment_method
      ORDER BY count DESC
    `);

    return result.recordset;
  } catch (error) {
    throw new Error(`Error getting payment method stats: ${error.message}`);
  }
};

// Thống kê doanh thu theo chuyến đi (schedule)
const getScheduleRevenueStats = async ({ routeId, startDate, endDate, status, page = 1, limit = 20 }) => {
  const pool = await poolPromise;
  let where = [];
  let params = {};
  if (routeId) {
    where.push('s.route_id = @routeId');
    params.routeId = routeId;
  }
  if (startDate) {
    where.push('s.departure_time >= @startDate');
    params.startDate = startDate;
  }
  if (endDate) {
    where.push('s.departure_time <= @endDate');
    params.endDate = endDate;
  }
  if (status) {
    where.push('s.status = @status');
    params.status = status;
  }
  const whereClause = where.length ? 'WHERE ' + where.join(' AND ') : '';
  const offset = (page - 1) * limit;

  // Query tổng số chuyến
  const countQuery = `
    SELECT COUNT(*) as total
    FROM schedules s
    ${whereClause}
  `;
  const countResult = await pool.request()
    .input('routeId', sql.Int, params.routeId)
    .input('startDate', sql.DateTime, params.startDate)
    .input('endDate', sql.DateTime, params.endDate)
    .input('status', sql.VarChar, params.status)
    .query(countQuery);
  const total = countResult.recordset[0].total;

  // Query dữ liệu
  const dataQuery = `
    SELECT 
      s.id as scheduleId,
      s.departure_time,
      s.status,
      s.price,
      r.id as routeId,
      p1.name as departureProvince,
      p2.name as arrivalProvince,
      bus.seat_count as totalSeats,
      COUNT(b.id) as bookingCount,
      (bus.seat_count - COUNT(b.id)) as emptySeats,
      SUM(CASE WHEN b.status = 'paid' THEN b.total_price ELSE 0 END) as revenue
    FROM schedules s
    INNER JOIN routes r ON s.route_id = r.id
    INNER JOIN provinces p1 ON r.departure_province_id = p1.id
    INNER JOIN provinces p2 ON r.arrival_province_id = p2.id
    INNER JOIN buses bus ON s.bus_id = bus.id
    LEFT JOIN bookings b ON s.id = b.schedule_id
    ${whereClause}
    GROUP BY s.id, s.departure_time, s.status, s.price, r.id, p1.name, p2.name, bus.seat_count
    ORDER BY s.departure_time DESC
    OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
  `;
  const dataResult = await pool.request()
    .input('routeId', sql.Int, params.routeId)
    .input('startDate', sql.DateTime, params.startDate)
    .input('endDate', sql.DateTime, params.endDate)
    .input('status', sql.VarChar, params.status)
    .input('offset', sql.Int, offset)
    .input('limit', sql.Int, limit)
    .query(dataQuery);
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    schedules: dataResult.recordset
  };
};

module.exports = {
  getDashboardStats,
  getStatsByPeriod,
  getTopRoutes,
  getMonthlyStats,
  getWeeklyStats,
  getPaymentMethodStats,
  getScheduleRevenueStats
}; 