const express = require('express');
const router = express.Router();
const cleanupController = require('../controllers/cleanupController');
const { requireCleanupPermission } = require('../middlewares/roleAuth');

// Tất cả routes đều yêu cầu quyền cleanup (chỉ admin)
router.use(requireCleanupPermission);

/**
 * @swagger
 * tags:
 *   name: Admin - Cleanup
 *   description: Quản lý cleanup booking pending
 */

/**
 * @swagger
 * /api/admin/cleanup/pending-bookings:
 *   post:
 *     summary: Cleanup booking pending đã hết hạn (Tự động cancel booking pending > 5 phút)
 *     description: API này sẽ tự động cancel tất cả booking có status 'pending' và được tạo cách đây hơn 5 phút. Ghế sẽ được giải phóng để user khác có thể đặt.
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
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Đã cleanup 3 booking pending hết hạn"
 *                 data:
 *                   type: object
 *                   properties:
 *                     processed:
 *                       type: integer
 *                       description: Số booking đã được cancel
 *                       example: 3
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                       description: Thời gian cleanup
 *                       example: "2024-01-15T10:30:00.000Z"
 *       401:
 *         description: Không có quyền truy cập hoặc token không hợp lệ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Chỉ admin mới được phép thực hiện thao tác này"
 *       403:
 *         description: Không có quyền thực hiện thao tác này
 *       500:
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Không thể cleanup booking pending"
 */
router.post('/pending-bookings', cleanupController.cleanupPendingBookings);

/**
 * @swagger
 * /api/admin/cleanup/pending-stats:
 *   get:
 *     summary: Lấy thống kê booking pending
 *     description: API này trả về thống kê về booking pending, bao gồm tổng số, số sắp hết hạn (>= 3 phút), và số đã hết hạn (>= 5 phút).
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
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Lấy thống kê thành công"
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalPending:
 *                       type: integer
 *                       description: Tổng số booking pending
 *                       example: 15
 *                     expiringSoon:
 *                       type: integer
 *                       description: Số booking sắp hết hạn (>= 3 phút)
 *                       example: 5
 *                     expired:
 *                       type: integer
 *                       description: Số booking đã hết hạn (>= 5 phút)
 *                       example: 3
 *                     timeoutMinutes:
 *                       type: integer
 *                       description: Thời gian timeout (phút)
 *                       example: 5
 *       401:
 *         description: Không có quyền truy cập hoặc token không hợp lệ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Chỉ admin mới được phép thực hiện thao tác này"
 *       500:
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Không thể lấy thống kê booking pending"
 */
router.get('/pending-stats', cleanupController.getPendingStats);

/**
 * @swagger
 * /api/admin/cleanup/expired-bookings:
 *   get:
 *     summary: Lấy danh sách booking pending đã hết hạn
 *     description: API này trả về danh sách chi tiết các booking có status 'pending' và được tạo cách đây hơn 5 phút. Admin có thể xem thông tin để quyết định có cleanup manual hay không.
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
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Lấy danh sách thành công"
 *                 data:
 *                   type: object
 *                   properties:
 *                     expiredBookings:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             description: ID của booking
 *                             example: 123
 *                           userId:
 *                             type: integer
 *                             description: ID của user
 *                             example: 456
 *                           scheduleId:
 *                             type: integer
 *                             description: ID của schedule
 *                             example: 789
 *                           bookedAt:
 *                             type: string
 *                             format: date-time
 *                             description: Thời gian tạo booking
 *                             example: "2024-01-15T10:25:00.000Z"
 *                           minutesSinceBooking:
 *                             type: integer
 *                             description: Số phút từ khi tạo booking
 *                             example: 7
 *                           userName:
 *                             type: string
 *                             description: Tên user
 *                             example: "Nguyễn Văn A"
 *                           userEmail:
 *                             type: string
 *                             description: Email user
 *                             example: "user@example.com"
 *       401:
 *         description: Không có quyền truy cập hoặc token không hợp lệ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Chỉ admin mới được phép thực hiện thao tác này"
 *       500:
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Không thể lấy danh sách booking hết hạn"
 */
router.get('/expired-bookings', cleanupController.getExpiredBookings);

module.exports = router; 