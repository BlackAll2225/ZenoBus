const express = require('express');
const router = express.Router();
const driverController = require('../controllers/driverController');
const { requireAdminOrManager } = require('../middlewares/roleAuth');

/**
 * @swagger
 * tags:
 *   name: Drivers
 *   description: Driver management API
 */

/**
 * @swagger
 * /api/drivers:
 *   get:
 *     summary: Lấy danh sách tài xế
 *     tags: [Drivers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Lọc theo trạng thái active
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Tìm kiếm theo tên
 *     responses:
 *       200:
 *         description: Danh sách tài xế
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Driver'
 *       500:
 *         description: Server error
 */
router.get('/', requireAdminOrManager, driverController.getAllDrivers);

/**
 * @swagger
 * /api/drivers/active:
 *   get:
 *     summary: Lấy danh sách tài xế active cho dropdown
 *     tags: [Drivers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách tài xế active
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       fullName:
 *                         type: string
 *                       phoneNumber:
 *                         type: string
 *                       licenseNumber:
 *                         type: string
 *       500:
 *         description: Server error
 */
router.get('/active', requireAdminOrManager, driverController.getActiveDrivers);

/**
 * @swagger
 * /api/drivers/{id}:
 *   get:
 *     summary: Lấy thông tin tài xế theo ID
 *     tags: [Drivers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Driver ID
 *     responses:
 *       200:
 *         description: Thông tin tài xế
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Driver'
 *       404:
 *         description: Driver not found
 *       500:
 *         description: Server error
 */
router.get('/:id', requireAdminOrManager, driverController.getDriverById);

/**
 * @swagger
 * /api/drivers:
 *   post:
 *     summary: Tạo tài xế mới
 *     tags: [Drivers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateDriverRequest'
 *     responses:
 *       201:
 *         description: Tài xế đã được tạo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Driver'
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.post('/', requireAdminOrManager, driverController.createDriver);

/**
 * @swagger
 * /api/drivers/{id}:
 *   put:
 *     summary: Cập nhật tài xế
 *     tags: [Drivers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Driver ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateDriverRequest'
 *     responses:
 *       200:
 *         description: Tài xế đã được cập nhật
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Driver'
 *       404:
 *         description: Driver not found
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.put('/:id', requireAdminOrManager, driverController.updateDriver);

/**
 * @swagger
 * /api/drivers/{id}:
 *   delete:
 *     summary: Xóa tài xế (soft delete)
 *     tags: [Drivers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Driver ID
 *     responses:
 *       200:
 *         description: Tài xế đã được xóa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: Driver not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', requireAdminOrManager, driverController.deleteDriver);

module.exports = router; 