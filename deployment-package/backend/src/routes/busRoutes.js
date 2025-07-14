const express = require('express');
const router = express.Router();
const controller = require('../controllers/busController');
const { requireAdminOrManager } = require('../middlewares/roleAuth');

/**
 * @swagger
 * tags:
 *   name: Buses
 *   description: Quản lý xe khách
 *
 * components:
 *   schemas:
 *     BusType:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: Giường nằm
 *         description:
 *           type: string
 *           example: Xe giường nằm 2 tầng
 *     Bus:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         licensePlate:
 *           type: string
 *           example: 29B-12345
 *         seatCount:
 *           type: integer
 *           example: 40
 *         description:
 *           type: string
 *           example: Xe đời mới, điều hòa
 *         busTypeId:
 *           type: integer
 *           example: 2
 *         busType:
 *           $ref: '#/components/schemas/BusType'
 *     BusInput:
 *       type: object
 *       required:
 *         - licensePlate
 *         - seatCount
 *         - busTypeId
 *       properties:
 *         licensePlate:
 *           type: string
 *           example: 29B-12345
 *         seatCount:
 *           type: integer
 *           example: 40
 *         busTypeId:
 *           type: integer
 *           example: 2
 *         description:
 *           type: string
 *           example: Xe đời mới, điều hòa
 */

/**
 * @swagger
 * /api/buses:
 *   get:
 *     summary: Lấy danh sách xe
 *     tags: [Buses]
 *     responses:
 *       200:
 *         description: Danh sách xe
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Bus'
 */
router.get('/', controller.getAll);

/**
 * @swagger
 * /api/buses/{id}:
 *   get:
 *     summary: Lấy thông tin xe theo id
 *     tags: [Buses]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID xe
 *     responses:
 *       200:
 *         description: Thông tin xe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Bus'
 *       404:
 *         description: Không tìm thấy xe
 */
router.get('/:id', controller.getById);

/**
 * @swagger
 * /api/buses:
 *   post:
 *     summary: Tạo mới xe
 *     tags: [Buses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BusInput'
 *     responses:
 *       201:
 *         description: Tạo thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Bus'
 *       400:
 *         description: Thiếu thông tin hoặc lỗi validate
 */
router.post('/', requireAdminOrManager, controller.create);

/**
 * @swagger
 * /api/buses/{id}:
 *   put:
 *     summary: Cập nhật xe
 *     tags: [Buses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID xe
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BusInput'
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Bus'
 *       404:
 *         description: Không tìm thấy xe
 */
router.put('/:id', requireAdminOrManager, controller.update);

/**
 * @swagger
 * /api/buses/{id}:
 *   delete:
 *     summary: Xóa xe
 *     tags: [Buses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID xe
 *     responses:
 *       200:
 *         description: Xóa thành công
 *       404:
 *         description: Không tìm thấy xe
 */
router.delete('/:id', requireAdminOrManager, controller.remove);

module.exports = router; 