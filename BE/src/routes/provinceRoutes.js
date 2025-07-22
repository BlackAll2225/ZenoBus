const express = require('express');
const router = express.Router();
const controller = require('../controllers/provinceController');
const validateProvince = require('../middlewares/validateProvince');
const adminAuth = require('../middlewares/adminAuth');

/**
 * @swagger
 * tags:
 *   name: Provinces
 *   description: Quản lý tỉnh/thành phố
 *
 * components:
 *   schemas:
 *     Province:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: Hà Nội
 *         code:
 *           type: string
 *           example: HN
 *     ProvinceInput:
 *       type: object
 *       required:
 *         - name
 *         - code
 *       properties:
 *         name:
 *           type: string
 *           example: Hà Nội
 *         code:
 *           type: string
 *           example: HN
 */

/**
 * @swagger
 * /api/provinces:
 *   get:
 *     summary: Lấy danh sách tỉnh/thành
 *     tags: [Provinces]
 *     responses:
 *       200:
 *         description: Danh sách tỉnh/thành
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Province'
 */
router.get('/', controller.getAll);

/**
 * @swagger
 * /api/provinces/{id}:
 *   get:
 *     summary: Lấy thông tin tỉnh/thành theo id
 *     tags: [Provinces]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID tỉnh/thành
 *     responses:
 *       200:
 *         description: Thông tin tỉnh/thành
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Province'
 *       404:
 *         description: Không tìm thấy tỉnh/thành
 */
router.get('/:id', controller.getById);

/**
 * @swagger
 * /api/provinces:
 *   post:
 *     summary: Tạo mới tỉnh/thành
 *     tags: [Provinces]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProvinceInput'
 *     responses:
 *       201:
 *         description: Tạo thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Province'
 *       400:
 *         description: Thiếu thông tin hoặc lỗi validate
 */
router.post('/', adminAuth, validateProvince, controller.create);

/**
 * @swagger
 * /api/provinces/{id}:
 *   put:
 *     summary: Cập nhật tỉnh/thành
 *     tags: [Provinces]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID tỉnh/thành
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProvinceInput'
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Province'
 *       404:
 *         description: Không tìm thấy tỉnh/thành
 */
router.put('/:id', adminAuth, validateProvince, controller.update);

/**
 * @swagger
 * /api/provinces/{id}:
 *   delete:
 *     summary: Xóa tỉnh/thành
 *     tags: [Provinces]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID tỉnh/thành
 *     responses:
 *       200:
 *         description: Xóa thành công
 *       404:
 *         description: Không tìm thấy tỉnh/thành
 */
router.delete('/:id', adminAuth, controller.remove);

module.exports = router;
