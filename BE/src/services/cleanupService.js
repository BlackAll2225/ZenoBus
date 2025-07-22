const { sql, poolPromise } = require('../config/db');
const bookingService = require('./bookingService');

// Thời gian timeout cho booking pending (5 phút)
const PENDING_TIMEOUT_MINUTES = 5;

const cleanupExpiredPendingBookings = async () => {
  try {
    const pool = await poolPromise;
    
    // Validate timeout minutes
    if (PENDING_TIMEOUT_MINUTES < 1 || PENDING_TIMEOUT_MINUTES > 60) {
      throw new Error('Invalid timeout minutes: must be between 1 and 60');
    }
    
    // Tìm booking pending cũ hơn 5 phút
    const expiredBookings = await pool.request()
      .input('timeoutMinutes', sql.Int, PENDING_TIMEOUT_MINUTES)
      .query(`
        SELECT 
          b.id,
          b.user_id,
          b.schedule_id,
          b.booked_at,
          DATEDIFF(MINUTE, b.booked_at, GETDATE()) as minutesSinceBooking
        FROM bookings b
        WHERE b.status = 'pending'
          AND DATEDIFF(MINUTE, b.booked_at, GETDATE()) >= @timeoutMinutes
      `);

    console.log(`Found ${expiredBookings.recordset.length} expired pending bookings`);

    // Cancel từng booking expired
    for (const booking of expiredBookings.recordset) {
      try {
        await bookingService.cancelBooking(booking.id);
        console.log(`Cancelled expired booking ${booking.id} (${booking.minutesSinceBooking} minutes old)`);
      } catch (error) {
        console.error(`Error cancelling booking ${booking.id}:`, error.message);
      }
    }

    return {
      processed: expiredBookings.recordset.length,
      timestamp: new Date()
    };
  } catch (error) {
    console.error('Error in cleanupExpiredPendingBookings:', error);
    throw error;
  }
};

const getExpiredPendingBookings = async () => {
  try {
    const pool = await poolPromise;
    
    const result = await pool.request()
      .input('timeoutMinutes', sql.Int, PENDING_TIMEOUT_MINUTES)
      .query(`
        SELECT 
          b.id,
          b.user_id,
          b.schedule_id,
          b.booked_at,
          DATEDIFF(MINUTE, b.booked_at, GETDATE()) as minutesSinceBooking,
          u.full_name as userName,
          u.email as userEmail
        FROM bookings b
        JOIN users u ON b.user_id = u.id
        WHERE b.status = 'pending'
          AND DATEDIFF(MINUTE, b.booked_at, GETDATE()) >= @timeoutMinutes
        ORDER BY b.booked_at ASC
      `);

    return result.recordset;
  } catch (error) {
    console.error('Error in getExpiredPendingBookings:', error);
    throw error;
  }
};

const getPendingBookingsStats = async () => {
  try {
    const pool = await poolPromise;
    
    const result = await pool.request()
      .query(`
        SELECT 
          COUNT(*) as totalPending,
          COUNT(CASE WHEN DATEDIFF(MINUTE, booked_at, GETDATE()) >= 3 THEN 1 END) as expiringSoon,
          COUNT(CASE WHEN DATEDIFF(MINUTE, booked_at, GETDATE()) >= 5 THEN 1 END) as expired
        FROM bookings
        WHERE status = 'pending'
      `);

    return result.recordset[0];
  } catch (error) {
    console.error('Error in getPendingBookingsStats:', error);
    throw error;
  }
};

module.exports = {
  cleanupExpiredPendingBookings,
  getExpiredPendingBookings,
  getPendingBookingsStats,
  PENDING_TIMEOUT_MINUTES
}; 