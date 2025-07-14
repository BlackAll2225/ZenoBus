const express = require('express');
const router = express.Router();
const statisticsController = require('../controllers/statisticsController');
const adminAuth = require('../middlewares/adminAuth');

/**
 * @swagger
 * tags:
 *   name: Statistics
 *   description: API thống kê hệ thống
 */

// Tất cả routes đều yêu cầu admin authentication
router.use(adminAuth);

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
router.get('/dashboard', statisticsController.getDashboardStatistics);

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
router.get('/period', statisticsController.getStatisticsByPeriod);

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
router.get('/top-routes', statisticsController.getTopRoutesStatistics);

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
router.get('/monthly', statisticsController.getMonthlyStatistics);

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
router.get('/weekly', statisticsController.getWeeklyStatistics);

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
router.get('/payment-methods', statisticsController.getPaymentMethodStatistics);

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
router.get('/all', statisticsController.getAllStatistics);

module.exports = router; 