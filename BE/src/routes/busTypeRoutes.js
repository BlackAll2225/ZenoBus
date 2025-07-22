const express = require('express');
const router = express.Router();
const controller = require('../controllers/busTypeController');
const adminAuth = require('../middlewares/adminAuth');

/**
 * @swagger
 * tags:
 *   name: BusTypes
 *   description: Quản lý loại xe
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
 *     BusTypeInput:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           example: Giường nằm
 *         description:
 *           type: string
 *           example: Xe giường nằm 2 tầng
 */

/**
 * @swagger
 * /api/bus-types:
 *   get:
 *     summary: Lấy danh sách loại xe
 *     tags: [BusTypes]
 *     responses:
 *       200:
 *         description: Danh sách loại xe
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/BusType'
 */
router.get('/', controller.getAll);

/**
 * @swagger
 * /api/bus-types/{id}:
 *   get:
 *     summary: Lấy thông tin loại xe theo id
 *     tags: [BusTypes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID loại xe
 *     responses:
 *       200:
 *         description: Thông tin loại xe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BusType'
 *       404:
 *         description: Không tìm thấy loại xe
 */
router.get('/:id', controller.getById);

/**
 * @swagger
 * /api/bus-types:
 *   post:
 *     summary: Tạo mới loại xe
 *     tags: [BusTypes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BusTypeInput'
 *     responses:
 *       201:
 *         description: Tạo thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BusType'
 *       400:
 *         description: Thiếu thông tin hoặc lỗi validate
 */
router.post('/', adminAuth, controller.create);

/**
 * @swagger
 * /api/bus-types/{id}:
 *   put:
 *     summary: Cập nhật loại xe
 *     tags: [BusTypes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID loại xe
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BusTypeInput'
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BusType'
 *       404:
 *         description: Không tìm thấy loại xe
 */
router.put('/:id', adminAuth, controller.update);

/**
 * @swagger
 * /api/bus-types/{id}:
 *   delete:
 *     summary: Xóa loại xe
 *     tags: [BusTypes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID loại xe
 *     responses:
 *       200:
 *         description: Xóa thành công
 *       404:
 *         description: Không tìm thấy loại xe
 */
router.delete('/:id', adminAuth, controller.remove);

module.exports = router; 