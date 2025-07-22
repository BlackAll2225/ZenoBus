const statisticsService = require('../services/statisticsService');
const ResponseHandler = require('../utils/responseHandler');

/**
 * @swagger
 * /api/statistics/dashboard:
 *   get:
 *     summary: Lấy thống kê dashboard tổng quan
 *     description: Lấy thống kê tổng quan về bookings, schedules, users, routes, buses cho dashboard admin
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Lấy thống kê dashboard thành công"
 *                 data:
 *                   $ref: '#/components/schemas/DashboardStats'
 *       401:
 *         description: Không có quyền truy cập
 *       500:
 *         description: Lỗi server
 */
const getDashboardStatistics = async (req, res) => {
  try {
    const stats = await statisticsService.getDashboardStatistics();
    
    const response = ResponseHandler.success(stats, 'Lấy thống kê dashboard thành công');
    return res.status(response.status).json({
      success: true,
      message: response.message,
      data: response.data
    });
  } catch (error) {
    console.error('Error getting dashboard statistics:', error);
    const response = ResponseHandler.serverError(error.message);
    return res.status(response.status).json({
      success: false,
      message: response.message
    });
  }
};

/**
 * @swagger
 * /api/statistics/period:
 *   get:
 *     summary: Lấy thống kê theo khoảng thời gian
 *     description: Lấy thống kê bookings và revenue theo khoảng thời gian được chỉ định
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *           example: "2024-01-01"
 *         description: Ngày bắt đầu (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *           example: "2024-12-31"
 *         description: Ngày kết thúc (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Lấy thống kê theo khoảng thời gian thành công"
 *                 data:
 *                   $ref: '#/components/schemas/PeriodStats'
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Không có quyền truy cập
 *       500:
 *         description: Lỗi server
 */
const getStatisticsByPeriod = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      const response = ResponseHandler.badRequest('Thiếu thông tin ngày bắt đầu hoặc kết thúc');
      return res.status(response.status).json({
        success: false,
        message: response.message
      });
    }
    
    const stats = await statisticsService.getStatisticsByPeriod(startDate, endDate);
    
    const response = ResponseHandler.success(stats, 'Lấy thống kê theo khoảng thời gian thành công');
    return res.status(response.status).json({
      success: true,
      message: response.message,
      data: response.data
    });
  } catch (error) {
    console.error('Error getting statistics by period:', error);
    const response = ResponseHandler.serverError(error.message);
    return res.status(response.status).json({
      success: false,
      message: response.message
    });
  }
};

/**
 * @swagger
 * /api/statistics/top-routes:
 *   get:
 *     summary: Lấy thống kê top routes
 *     description: Lấy danh sách top routes theo số lượng booking và doanh thu
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *           maximum: 50
 *           example: 5
 *         description: Số lượng routes tối đa
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Lấy thống kê top routes thành công"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/TopRoute'
 *       401:
 *         description: Không có quyền truy cập
 *       500:
 *         description: Lỗi server
 */
const getTopRoutesStatistics = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const stats = await statisticsService.getTopRoutesStatistics(parseInt(limit));
    
    const response = ResponseHandler.success(stats, 'Lấy thống kê top routes thành công');
    return res.status(response.status).json({
      success: true,
      message: response.message,
      data: response.data
    });
  } catch (error) {
    console.error('Error getting top routes statistics:', error);
    const response = ResponseHandler.serverError(error.message);
    return res.status(response.status).json({
      success: false,
      message: response.message
    });
  }
};

/**
 * @swagger
 * /api/statistics/monthly:
 *   get:
 *     summary: Lấy thống kê theo tháng
 *     description: Lấy thống kê bookings và revenue theo từng tháng trong năm
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *           default: 2024
 *           minimum: 2020
 *           maximum: 2030
 *           example: 2024
 *         description: Năm cần thống kê
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Lấy thống kê theo tháng thành công"
 *                 data:
 *                   $ref: '#/components/schemas/MonthlyStats'
 *       401:
 *         description: Không có quyền truy cập
 *       500:
 *         description: Lỗi server
 */
const getMonthlyStatistics = async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;
    
    const stats = await statisticsService.getMonthlyStatistics(parseInt(year));
    
    const response = ResponseHandler.success(stats, 'Lấy thống kê theo tháng thành công');
    return res.status(response.status).json({
      success: true,
      message: response.message,
      data: response.data
    });
  } catch (error) {
    console.error('Error getting monthly statistics:', error);
    const response = ResponseHandler.serverError(error.message);
    return res.status(response.status).json({
      success: false,
      message: response.message
    });
  }
};

/**
 * @swagger
 * /api/statistics/weekly:
 *   get:
 *     summary: Lấy thống kê theo ngày trong tuần
 *     description: Lấy thống kê bookings và revenue theo ngày trong tuần (30 ngày gần nhất)
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Lấy thống kê theo ngày trong tuần thành công"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/WeeklyStats'
 *       401:
 *         description: Không có quyền truy cập
 *       500:
 *         description: Lỗi server
 */
const getWeeklyStatistics = async (req, res) => {
  try {
    const stats = await statisticsService.getWeeklyStatistics();
    
    const response = ResponseHandler.success(stats, 'Lấy thống kê theo ngày trong tuần thành công');
    return res.status(response.status).json({
      success: true,
      message: response.message,
      data: response.data
    });
  } catch (error) {
    console.error('Error getting weekly statistics:', error);
    const response = ResponseHandler.serverError(error.message);
    return res.status(response.status).json({
      success: false,
      message: response.message
    });
  }
};

/**
 * @swagger
 * /api/statistics/payment-methods:
 *   get:
 *     summary: Lấy thống kê theo phương thức thanh toán
 *     description: Lấy thống kê số lượng và tổng tiền theo từng phương thức thanh toán
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Lấy thống kê phương thức thanh toán thành công"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PaymentMethodStats'
 *       401:
 *         description: Không có quyền truy cập
 *       500:
 *         description: Lỗi server
 */
const getPaymentMethodStatistics = async (req, res) => {
  try {
    const stats = await statisticsService.getPaymentMethodStatistics();
    
    const response = ResponseHandler.success(stats, 'Lấy thống kê phương thức thanh toán thành công');
    return res.status(response.status).json({
      success: true,
      message: response.message,
      data: response.data
    });
  } catch (error) {
    console.error('Error getting payment method statistics:', error);
    const response = ResponseHandler.serverError(error.message);
    return res.status(response.status).json({
      success: false,
      message: response.message
    });
  }
};

/**
 * @swagger
 * /api/statistics/all:
 *   get:
 *     summary: Lấy tất cả thống kê
 *     description: Lấy tất cả thống kê trong một request (dashboard, top routes, monthly, weekly, payment methods)
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *           default: 2024
 *           minimum: 2020
 *           maximum: 2030
 *           example: 2024
 *         description: Năm cần thống kê
 *       - in: query
 *         name: topRoutesLimit
 *         schema:
 *           type: integer
 *           default: 5
 *           minimum: 1
 *           maximum: 20
 *           example: 5
 *         description: Số lượng top routes
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Lấy tất cả thống kê thành công"
 *                 data:
 *                   $ref: '#/components/schemas/AllStatistics'
 *       401:
 *         description: Không có quyền truy cập
 *       500:
 *         description: Lỗi server
 */
const getAllStatistics = async (req, res) => {
  try {
    const { year, topRoutesLimit } = req.query;
    const filters = {
      year: year ? parseInt(year) : new Date().getFullYear(),
      topRoutesLimit: topRoutesLimit ? parseInt(topRoutesLimit) : 5
    };
    
    const stats = await statisticsService.getAllStatistics(filters);
    
    const response = ResponseHandler.success(stats, 'Lấy tất cả thống kê thành công');
    return res.status(response.status).json({
      success: true,
      message: response.message,
      data: response.data
    });
  } catch (error) {
    console.error('Error getting all statistics:', error);
    const response = ResponseHandler.serverError(error.message);
    return res.status(response.status).json({
      success: false,
      message: response.message
    });
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