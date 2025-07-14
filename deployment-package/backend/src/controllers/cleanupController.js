const cleanupService = require('../services/cleanupService');
const ResponseHandler = require('../utils/responseHandler');

/**
 * @swagger
 * /api/admin/cleanup/pending-bookings:
 *   post:
 *     summary: Cleanup booking pending đã hết hạn
 *     tags: [Admin - Cleanup]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cleanup thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 processed:
 *                   type: integer
 *                   description: Số booking đã được cancel
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       500:
 *         description: Lỗi server
 */
const cleanupPendingBookings = async (req, res) => {
  try {
    // Log thông tin admin thực hiện cleanup
    const adminInfo = req.user;
    console.log(`🔄 Admin ${adminInfo.fullName} (${adminInfo.username}) thực hiện cleanup booking pending`);
    
    const result = await cleanupService.cleanupExpiredPendingBookings();
    
    // Log kết quả
    if (result.processed > 0) {
      console.log(`✅ Cleanup completed by admin ${adminInfo.username}: ${result.processed} bookings cancelled`);
    } else {
      console.log(`ℹ️ No expired bookings found by admin ${adminInfo.username}`);
    }
    
    const response = ResponseHandler.success({
      processed: result.processed,
      timestamp: result.timestamp,
      message: `Đã cleanup ${result.processed} booking pending hết hạn`,
      adminInfo: {
        username: adminInfo.username,
        fullName: adminInfo.fullName
      }
    });
    
    return res.status(response.status).json({
      success: true,
      message: response.message,
      data: response.data
    });
  } catch (error) {
    console.error('Error in cleanupPendingBookings:', error);
    const response = ResponseHandler.serverError('Không thể cleanup booking pending');
    return res.status(response.status).json({
      success: false,
      message: response.message
    });
  }
};

/**
 * @swagger
 * /api/admin/cleanup/pending-stats:
 *   get:
 *     summary: Lấy thống kê booking pending
 *     tags: [Admin - Cleanup]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thống kê thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalPending:
 *                   type: integer
 *                   description: Tổng số booking pending
 *                 expiringSoon:
 *                   type: integer
 *                   description: Số booking sắp hết hạn (>= 3 phút)
 *                 expired:
 *                   type: integer
 *                   description: Số booking đã hết hạn (>= 5 phút)
 *       500:
 *         description: Lỗi server
 */
const getPendingStats = async (req, res) => {
  try {
    // Log thông tin admin xem thống kê
    const adminInfo = req.user;
    console.log(`📊 Admin ${adminInfo.fullName} (${adminInfo.username}) xem thống kê booking pending`);
    
    const stats = await cleanupService.getPendingBookingsStats();
    
    const response = ResponseHandler.success({
      totalPending: parseInt(stats.totalPending),
      expiringSoon: parseInt(stats.expiringSoon),
      expired: parseInt(stats.expired),
      timeoutMinutes: cleanupService.PENDING_TIMEOUT_MINUTES,
      adminInfo: {
        username: adminInfo.username,
        fullName: adminInfo.fullName
      }
    });
    
    return res.status(response.status).json({
      success: true,
      message: response.message,
      data: response.data
    });
  } catch (error) {
    console.error('Error in getPendingStats:', error);
    const response = ResponseHandler.serverError('Không thể lấy thống kê booking pending');
    return res.status(response.status).json({
      success: false,
      message: response.message
    });
  }
};

/**
 * @swagger
 * /api/admin/cleanup/expired-bookings:
 *   get:
 *     summary: Lấy danh sách booking pending đã hết hạn
 *     tags: [Admin - Cleanup]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lấy danh sách thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 expiredBookings:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       userId:
 *                         type: integer
 *                       scheduleId:
 *                         type: integer
 *                       bookedAt:
 *                         type: string
 *                         format: date-time
 *                       minutesSinceBooking:
 *                         type: integer
 *                       userName:
 *                         type: string
 *                       userEmail:
 *                         type: string
 *       500:
 *         description: Lỗi server
 */
const getExpiredBookings = async (req, res) => {
  try {
    // Log thông tin admin xem danh sách expired
    const adminInfo = req.user;
    console.log(`📋 Admin ${adminInfo.fullName} (${adminInfo.username}) xem danh sách booking expired`);
    
    const expiredBookings = await cleanupService.getExpiredPendingBookings();
    
    const response = ResponseHandler.success({
      expiredBookings: expiredBookings.map(booking => ({
        id: booking.id,
        userId: booking.user_id,
        scheduleId: booking.schedule_id,
        bookedAt: booking.booked_at,
        minutesSinceBooking: booking.minutesSinceBooking,
        userName: booking.userName,
        userEmail: booking.userEmail
      })),
      adminInfo: {
        username: adminInfo.username,
        fullName: adminInfo.fullName
      }
    });
    
    return res.status(response.status).json({
      success: true,
      message: response.message,
      data: response.data
    });
  } catch (error) {
    console.error('Error in getExpiredBookings:', error);
    const response = ResponseHandler.serverError('Không thể lấy danh sách booking hết hạn');
    return res.status(response.status).json({
      success: false,
      message: response.message
    });
  }
};

module.exports = {
  cleanupPendingBookings,
  getPendingStats,
  getExpiredBookings
}; 