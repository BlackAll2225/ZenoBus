const express = require('express');
const router = express.Router();
const stopController = require('../controllers/stopController');
const adminAuth = require('../middlewares/adminAuth');
const {
  validateCreateStop,
  validateUpdateStop,
  validateGetStopById,
  validateDeleteStop,
  validateGetStopsByProvince,
  validateGetStopsByType,
  validateGetAllStops
} = require('../validations/stopValidation');

/**
 * @swagger
 * components:
 *   schemas:
 *     Stop:
 *       type: object
 *       required:
 *         - provinceId
 *         - name
 *         - type
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-generated ID
 *         provinceId:
 *           type: integer
 *           description: ID of the province
 *         name:
 *           type: string
 *           description: Name of the stop
 *         address:
 *           type: string
 *           description: Address of the stop
 *         type:
 *           type: string
 *           enum: [pickup, dropoff]
 *           description: Type of stop
 *         provinceName:
 *           type: string
 *           description: Name of the province
 *         provinceCode:
 *           type: string
 *           description: Code of the province
 */

/**
 * @swagger
 * /api/stops:
 *   get:
 *     summary: Get all stops
 *     tags: [Stops]
 *     parameters:
 *       - in: query
 *         name: provinceId
 *         schema:
 *           type: integer
 *         description: Filter by province ID
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [pickup, dropoff]
 *         description: Filter by stop type
 *     responses:
 *       200:
 *         description: List of stops
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Stop'
 */
router.get('/', validateGetAllStops, stopController.getAllStops);

/**
 * @swagger
 * /api/stops/{id}:
 *   get:
 *     summary: Get stop by ID
 *     tags: [Stops]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Stop ID
 *     responses:
 *       200:
 *         description: Stop details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Stop'
 *       404:
 *         description: Stop not found
 */
router.get('/:id', validateGetStopById, stopController.getStopById);

/**
 * @swagger
 * /api/stops:
 *   post:
 *     summary: Create a new stop
 *     tags: [Stops]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - provinceId
 *               - name
 *               - type
 *             properties:
 *               provinceId:
 *                 type: integer
 *                 description: ID of the province
 *               name:
 *                 type: string
 *                 description: Name of the stop
 *               address:
 *                 type: string
 *                 description: Address of the stop
 *               type:
 *                 type: string
 *                 enum: [pickup, dropoff]
 *                 description: Type of stop
 *     responses:
 *       201:
 *         description: Stop created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Stop'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 */
router.post('/', adminAuth, validateCreateStop, stopController.createStop);

/**
 * @swagger
 * /api/stops/{id}:
 *   put:
 *     summary: Update a stop
 *     tags: [Stops]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Stop ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               provinceId:
 *                 type: integer
 *                 description: ID of the province
 *               name:
 *                 type: string
 *                 description: Name of the stop
 *               address:
 *                 type: string
 *                 description: Address of the stop
 *               type:
 *                 type: string
 *                 enum: [pickup, dropoff]
 *                 description: Type of stop
 *     responses:
 *       200:
 *         description: Stop updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Stop'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Stop not found
 */
router.put('/:id', adminAuth, validateUpdateStop, stopController.updateStop);

/**
 * @swagger
 * /api/stops/{id}:
 *   delete:
 *     summary: Delete a stop
 *     tags: [Stops]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Stop ID
 *     responses:
 *       200:
 *         description: Stop deleted successfully
 *       400:
 *         description: Cannot delete stop in use
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Stop not found
 */
router.delete('/:id', adminAuth, validateDeleteStop, stopController.deleteStop);

/**
 * @swagger
 * /api/stops/province/{provinceId}:
 *   get:
 *     summary: Get stops by province
 *     tags: [Stops]
 *     parameters:
 *       - in: path
 *         name: provinceId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Province ID
 *     responses:
 *       200:
 *         description: List of stops in the province
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Stop'
 */
router.get('/province/:provinceId', validateGetStopsByProvince, stopController.getStopsByProvince);

/**
 * @swagger
 * /api/stops/type/{type}:
 *   get:
 *     summary: Get stops by type
 *     tags: [Stops]
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [pickup, dropoff]
 *         description: Stop type
 *     responses:
 *       200:
 *         description: List of stops by type
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Stop'
 *       400:
 *         description: Invalid type
 */
router.get('/type/:type', validateGetStopsByType, stopController.getStopsByType);

module.exports = router; 