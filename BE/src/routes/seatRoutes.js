const express = require('express');
const router = express.Router();
const controller = require('../controllers/seatController');
const adminAuth = require('../middlewares/adminAuth');

/**
 * @swagger
 * tags:
 *   name: Seats
 *   description: Quản lý ghế xe
 *
 * components:
 *   schemas:
 *     Seat:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         scheduleId:
 *           type: integer
 *           example: 1
 *         seatNumber:
 *           type: string
 *           example: A1
 *         floor:
 *           type: string
 *           example: lower
 *         status:
 *           type: string
 *           example: available
 *     SeatInput:
 *       type: object
 *       required:
 *         - scheduleId
 *         - seatNumber
 *       properties:
 *         scheduleId:
 *           type: integer
 *           example: 1
 *         seatNumber:
 *           type: string
 *           example: A1
 *         floor:
 *           type: string
 *           example: lower
 *         status:
 *           type: string
 *           example: available
 */

/**
 * @swagger
 * /api/seats:
 *   get:
 *     summary: Lấy danh sách ghế (có thể lọc theo scheduleId)
 *     tags: [Seats]
 *     parameters:
 *       - in: query
 *         name: scheduleId
 *         schema:
 *           type: integer
 *         required: false
 *         description: ID lịch trình xe
 *     responses:
 *       200:
 *         description: Danh sách ghế
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Seat'
 */
router.get('/', controller.getAll);

/**
 * @swagger
 * /api/seats/{id}:
 *   get:
 *     summary: Lấy thông tin ghế theo id
 *     tags: [Seats]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID ghế
 *     responses:
 *       200:
 *         description: Thông tin ghế
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Seat'
 *       404:
 *         description: Không tìm thấy ghế
 */
router.get('/:id', controller.getById);

/**
 * @swagger
 * /api/seats:
 *   post:
 *     summary: Tạo mới ghế
 *     tags: [Seats]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SeatInput'
 *     responses:
 *       201:
 *         description: Tạo thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Seat'
 *       400:
 *         description: Thiếu thông tin hoặc lỗi validate
 */
router.post('/', adminAuth, controller.create);

/**
 * @swagger
 * /api/seats/{id}:
 *   put:
 *     summary: Cập nhật ghế
 *     tags: [Seats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID ghế
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SeatInput'
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Seat'
 *       404:
 *         description: Không tìm thấy ghế
 */
router.put('/:id', adminAuth, controller.update);

/**
 * @swagger
 * /api/seats/{id}:
 *   delete:
 *     summary: Xóa ghế
 *     tags: [Seats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID ghế
 *     responses:
 *       200:
 *         description: Xóa thành công
 *       404:
 *         description: Không tìm thấy ghế
 */
router.delete('/:id', adminAuth, controller.remove);

module.exports = router; 