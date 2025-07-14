const express = require('express');
const router = express.Router();
const scheduleToggleController = require('../controllers/scheduleToggleController');
const adminAuth = require('../middlewares/adminAuth');

/**
 * @swagger
 * components:
 *   schemas:
 *     ScheduleToggleInput:
 *       type: object
 *       required:
 *         - scheduleId
 *         - isEnabled
 *       properties:
 *         scheduleId:
 *           type: integer
 *           description: ID lịch trình
 *         isEnabled:
 *           type: boolean
 *           description: Bật/tắt lịch trình
 *         isSeatEnabled:
 *           type: boolean
 *           description: Bật/tắt ghế (optional)
 *         adminNote:
 *           type: string
 *           description: Ghi chú của admin
 *     
 *     SeatToggleInput:
 *       type: object
 *       required:
 *         - scheduleId
 *         - seatIds
 *         - isEnabled
 *       properties:
 *         scheduleId:
 *           type: integer
 *           description: ID lịch trình
 *         seatIds:
 *           type: array
 *           items:
 *             type: integer
 *           description: Danh sách ID ghế
 *         isEnabled:
 *           type: boolean
 *           description: Bật/tắt ghế
 *         adminNote:
 *           type: string
 *           description: Ghi chú của admin
 *     
 *     ScheduleManagement:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         scheduleId:
 *           type: integer
 *         isEnabled:
 *           type: boolean
 *         isSeatEnabled:
 *           type: boolean
 *         adminNote:
 *           type: string
 *         modifiedBy:
 *           type: integer
 *         modifiedAt:
 *           type: string
 *           format: date-time
 *         modifiedByAdmin:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *             fullName:
 *               type: string
 *             username:
 *               type: string
 */

/**
 * @swagger
 * /api/schedule-management/toggle:
 *   post:
 *     summary: Bật/tắt lịch trình
 *     tags: [Schedule Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ScheduleToggleInput'
 *     responses:
 *       200:
 *         description: Cập nhật trạng thái lịch trình thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ScheduleManagement'
 *                 message:
 *                   type: string
 *       404:
 *         description: Không tìm thấy lịch trình
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/toggle', adminAuth, scheduleToggleController.toggleSchedule);

/**
 * @swagger
 * /api/schedule-management/seats/toggle:
 *   post:
 *     summary: Bật/tắt ghế của lịch trình
 *     tags: [Schedule Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SeatToggleInput'
 *     responses:
 *       200:
 *         description: Cập nhật trạng thái ghế thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     updated:
 *                       type: integer
 *                       description: Số ghế đã cập nhật
 *                     seats:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           seatNumber:
 *                             type: string
 *                           isEnabled:
 *                             type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: Không tìm thấy lịch trình hoặc ghế
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/seats/toggle', adminAuth, scheduleToggleController.toggleSeats);

/**
 * @swagger
 * /api/schedule-management/{scheduleId}:
 *   get:
 *     summary: Lấy thông tin quản lý lịch trình
 *     tags: [Schedule Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: scheduleId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID lịch trình
 *     responses:
 *       200:
 *         description: Thông tin quản lý lịch trình
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ScheduleManagement'
 *       404:
 *         description: Không tìm thấy lịch trình
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/:scheduleId', adminAuth, scheduleToggleController.getScheduleManagement);

/**
 * @swagger
 * /api/schedule-management/{scheduleId}/seats:
 *   get:
 *     summary: Lấy danh sách ghế với trạng thái enable/disable
 *     tags: [Schedule Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: scheduleId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID lịch trình
 *     responses:
 *       200:
 *         description: Danh sách ghế với trạng thái
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     scheduleId:
 *                       type: integer
 *                     totalSeats:
 *                       type: integer
 *                     enabledSeats:
 *                       type: integer
 *                     disabledSeats:
 *                       type: integer
 *                     seats:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           seatNumber:
 *                             type: string
 *                           status:
 *                             type: string
 *                             enum: [available, booked, blocked]
 *                           floor:
 *                             type: string
 *                           isEnabled:
 *                             type: boolean
 *       404:
 *         description: Không tìm thấy lịch trình
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/:scheduleId/seats', adminAuth, scheduleToggleController.getScheduleSeats);

/**
 * @swagger
 * /api/schedule-management/bulk-toggle:
 *   post:
 *     summary: Bật/tắt nhiều lịch trình cùng lúc
 *     tags: [Schedule Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - scheduleIds
 *               - isEnabled
 *             properties:
 *               scheduleIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Danh sách ID lịch trình
 *               isEnabled:
 *                 type: boolean
 *                 description: Bật/tắt lịch trình
 *               isSeatEnabled:
 *                 type: boolean
 *                 description: Bật/tắt ghế (optional)
 *               adminNote:
 *                 type: string
 *                 description: Ghi chú của admin
 *     responses:
 *       200:
 *         description: Cập nhật trạng thái nhiều lịch trình thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     updated:
 *                       type: integer
 *                       description: Số lịch trình đã cập nhật
 *                     schedules:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ScheduleManagement'
 *                 message:
 *                   type: string
 *       404:
 *         description: Không tìm thấy lịch trình
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/bulk-toggle', adminAuth, scheduleToggleController.bulkToggleSchedules);

module.exports = router; 