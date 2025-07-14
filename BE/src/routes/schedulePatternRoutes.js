const express = require('express');
const router = express.Router();
const controller = require('../controllers/schedulePatternController');
const { requireAdminOrManager } = require('../middlewares/roleAuth');

/**
 * @swagger
 * tags:
 *   name: Schedule Patterns
 *   description: Quản lý mẫu lịch trình tự động
 *
 * components:
 *   schemas:
 *     SchedulePattern:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: Hà Nội - Hồ Chí Minh (Hàng ngày)
 *         description:
 *           type: string
 *           example: Lịch trình hàng ngày từ Hà Nội đến Hồ Chí Minh
 *         routeId:
 *           type: integer
 *           example: 1
 *         busTypeId:
 *           type: integer
 *           example: 2
 *         departureTimes:
 *           type: string
 *           example: '["06:00", "08:00", "10:00", "14:00", "16:00"]'
 *           description: JSON array of departure times
 *         daysOfWeek:
 *           type: string
 *           example: '1,2,3,4,5,6,7'
 *           description: Comma-separated days (1=Monday, 7=Sunday)
 *         basePrice:
 *           type: number
 *           format: decimal
 *           example: 350000
 *         isActive:
 *           type: boolean
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: '2024-01-15T10:30:00.000Z'
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: '2024-01-15T10:30:00.000Z'
 *     SchedulePatternInput:
 *       type: object
 *       required:
 *         - name
 *         - routeId
 *         - busTypeId
 *         - departureTimes
 *         - daysOfWeek
 *         - basePrice
 *       properties:
 *         name:
 *           type: string
 *           example: Hà Nội - Hồ Chí Minh (Hàng ngày)
 *         description:
 *           type: string
 *           example: Lịch trình hàng ngày từ Hà Nội đến Hồ Chí Minh
 *         routeId:
 *           type: integer
 *           example: 1
 *         busTypeId:
 *           type: integer
 *           example: 2
 *         departureTimes:
 *           type: string
 *           example: '["06:00", "08:00", "10:00", "14:00", "16:00"]'
 *           description: JSON array of departure times
 *         daysOfWeek:
 *           type: string
 *           example: '1,2,3,4,5,6,7'
 *           description: Comma-separated days (1=Monday, 7=Sunday)
 *         basePrice:
 *           type: number
 *           format: decimal
 *           example: 350000
 *         isActive:
 *           type: boolean
 *           example: true
 */

/**
 * @swagger
 * /api/schedule-patterns:
 *   get:
 *     summary: Lấy danh sách mẫu lịch trình
 *     tags: [Schedule Patterns]
 *     parameters:
 *       - in: query
 *         name: routeId
 *         schema:
 *           type: integer
 *         description: Lọc theo tuyến đường
 *       - in: query
 *         name: busTypeId
 *         schema:
 *           type: integer
 *         description: Lọc theo loại xe
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Lọc theo trạng thái active
 *     responses:
 *       200:
 *         description: Danh sách mẫu lịch trình
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SchedulePattern'
 */
router.get('/', controller.getAll);

/**
 * @swagger
 * /api/schedule-patterns/{id}:
 *   get:
 *     summary: Lấy thông tin mẫu lịch trình theo id
 *     tags: [Schedule Patterns]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID mẫu lịch trình
 *     responses:
 *       200:
 *         description: Thông tin mẫu lịch trình
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SchedulePattern'
 *       404:
 *         description: Không tìm thấy mẫu lịch trình
 */
router.get('/:id', controller.getById);

/**
 * @swagger
 * /api/schedule-patterns:
 *   post:
 *     summary: Tạo mới mẫu lịch trình
 *     tags: [Schedule Patterns]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SchedulePatternInput'
 *     responses:
 *       201:
 *         description: Tạo thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SchedulePattern'
 *       400:
 *         description: Thiếu thông tin hoặc lỗi validate
 *       409:
 *         description: Mẫu lịch trình đã tồn tại
 */
router.post('/', requireAdminOrManager, controller.create);

/**
 * @swagger
 * /api/schedule-patterns/{id}:
 *   put:
 *     summary: Cập nhật mẫu lịch trình
 *     tags: [Schedule Patterns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID mẫu lịch trình
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SchedulePatternInput'
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SchedulePattern'
 *       404:
 *         description: Không tìm thấy mẫu lịch trình
 *       400:
 *         description: Lỗi validate
 */
router.put('/:id', requireAdminOrManager, controller.update);

/**
 * @swagger
 * /api/schedule-patterns/{id}:
 *   delete:
 *     summary: Xóa mẫu lịch trình
 *     tags: [Schedule Patterns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID mẫu lịch trình
 *     responses:
 *       200:
 *         description: Xóa thành công
 *       404:
 *         description: Không tìm thấy mẫu lịch trình
 *       409:
 *         description: Không thể xóa vì đang được sử dụng
 */
router.delete('/:id', requireAdminOrManager, controller.remove);

module.exports = router; 