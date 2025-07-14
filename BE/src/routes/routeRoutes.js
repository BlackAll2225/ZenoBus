const express = require("express");
const router = express.Router();
const routeController = require("../controllers/routeController");
const { 
  validateRoute, 
  validateRouteUpdate, 
  validateRouteId, 
  validateProvinceId, 
  handleValidationErrors 
} = require("../validations/routeValidation");
const { requireAdminOrManager } = require("../middlewares/roleAuth");

/**
 * @swagger
 * components:
 *   schemas:
 *     Route:
 *       type: object
 *       required:
 *         - departureProvinceId
 *         - arrivalProvinceId
 *       properties:
 *         id:
 *           type: integer
 *           description: Route ID
 *         departureProvinceId:
 *           type: integer
 *           description: ID of departure province
 *         arrivalProvinceId:
 *           type: integer
 *           description: ID of arrival province
 *         distanceKm:
 *           type: integer
 *           description: Distance in kilometers
 *         estimatedTime:
 *           type: integer
 *           description: Estimated travel time in minutes
 *         departureProvince:
 *           $ref: '#/components/schemas/Province'
 *         arrivalProvince:
 *           $ref: '#/components/schemas/Province'
 *     Province:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         code:
 *           type: string
 */

/**
 * @swagger
 * /api/routes:
 *   get:
 *     summary: Get all routes
 *     tags: [Routes]
 *     responses:
 *       200:
 *         description: List of routes
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
 *                     $ref: '#/components/schemas/Route'
 *                 message:
 *                   type: string
 */
router.get("/", routeController.getAllRoutes);

/**
 * @swagger
 * /api/routes/search:
 *   get:
 *     summary: Search trips by departure, arrival provinces and date
 *     tags: [Routes]
 *     parameters:
 *       - in: query
 *         name: departureProvinceId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Departure province ID
 *       - in: query
 *         name: arrivalProvinceId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Arrival province ID
 *       - in: query
 *         name: departureDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *           example: "2025-01-15"
 *         description: Departure date (YYYY-MM-DD format)
 *     responses:
 *       200:
 *         description: Trips found successfully
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
 *                     searchCriteria:
 *                       type: object
 *                       properties:
 *                         departureProvince:
 *                           $ref: '#/components/schemas/Province'
 *                         arrivalProvince:
 *                           $ref: '#/components/schemas/Province'
 *                         departureDate:
 *                           type: string
 *                     totalTrips:
 *                       type: integer
 *                     trips:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           scheduleId:
 *                             type: integer
 *                           departureTime:
 *                             type: string
 *                             format: date-time
 *                           price:
 *                             type: number
 *                           status:
 *                             type: string
 *                           route:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: integer
 *                               distanceKm:
 *                                 type: integer
 *                               estimatedTime:
 *                                 type: integer
 *                               departureProvince:
 *                                 $ref: '#/components/schemas/Province'
 *                               arrivalProvince:
 *                                 $ref: '#/components/schemas/Province'
 *                           bus:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: integer
 *                               licensePlate:
 *                                 type: string
 *                               seatCount:
 *                                 type: integer
 *                               description:
 *                                 type: string
 *                               busType:
 *                                 type: object
 *                                 properties:
 *                                   id:
 *                                     type: integer
 *                                   name:
 *                                     type: string
 *                                   description:
 *                                     type: string
 *                           driver:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: integer
 *                               fullName:
 *                                 type: string
 *                               phoneNumber:
 *                                 type: string
 *                               licenseNumber:
 *                                 type: string
 *                 message:
 *                   type: string
 *       400:
 *         description: Missing required parameters or invalid date format
 *       404:
 *         description: Province or route not found
 */
router.get("/search", routeController.searchTrips);

/**
 * @swagger
 * /api/routes/schedules/{scheduleId}/seats:
 *   get:
 *     summary: Get available seats for a specific schedule
 *     tags: [Routes]
 *     parameters:
 *       - in: path
 *         name: scheduleId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Schedule ID
 *     responses:
 *       200:
 *         description: Available seats retrieved successfully
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
 *                     schedule:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         departureTime:
 *                           type: string
 *                           format: date-time
 *                         price:
 *                           type: number
 *                         status:
 *                           type: string
 *                         bus:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                             licensePlate:
 *                               type: string
 *                             seatCount:
 *                               type: integer
 *                             description:
 *                               type: string
 *                             busType:
 *                               type: string
 *                         route:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                             distanceKm:
 *                               type: integer
 *                             estimatedTime:
 *                               type: integer
 *                             departureProvince:
 *                               type: string
 *                             arrivalProvince:
 *                               type: string
 *                     seats:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         available:
 *                           type: integer
 *                         booked:
 *                           type: integer
 *                         blocked:
 *                           type: integer
 *                         byFloor:
 *                           type: object
 *                           properties:
 *                             upper:
 *                               type: array
 *                               items:
 *                                 type: object
 *                             lower:
 *                               type: array
 *                               items:
 *                                 type: object
 *                             main:
 *                               type: array
 *                               items:
 *                                 type: object
 *                         allSeats:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: integer
 *                               seatNumber:
 *                                 type: string
 *                               status:
 *                                 type: string
 *                               floor:
 *                                 type: string
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid schedule ID
 *       404:
 *         description: Schedule not found
 */
router.get("/schedules/:scheduleId/seats", routeController.getAvailableSeats);

/**
 * @swagger
 * /api/routes/{id}:
 *   get:
 *     summary: Get route by ID
 *     tags: [Routes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Route ID
 *     responses:
 *       200:
 *         description: Route details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Route'
 *                 message:
 *                   type: string
 *       404:
 *         description: Route not found
 */
router.get("/:id", validateRouteId, handleValidationErrors, routeController.getRouteById);

/**
 * @swagger
 * /api/routes:
 *   post:
 *     summary: Create a new route
 *     tags: [Routes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - departureProvinceId
 *               - arrivalProvinceId
 *             properties:
 *               departureProvinceId:
 *                 type: integer
 *                 description: ID of departure province
 *               arrivalProvinceId:
 *                 type: integer
 *                 description: ID of arrival province
 *               distanceKm:
 *                 type: integer
 *                 description: Distance in kilometers
 *               estimatedTime:
 *                 type: integer
 *                 description: Estimated travel time in minutes
 *     responses:
 *       201:
 *         description: Route created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Route'
 *                 message:
 *                   type: string
 *       400:
 *         description: Validation error or route already exists
 *       401:
 *         description: Unauthorized - Admin authentication required
 */
router.post("/", requireAdminOrManager, validateRoute, handleValidationErrors, routeController.createRoute);

/**
 * @swagger
 * /api/routes/{id}:
 *   put:
 *     summary: Update a route
 *     tags: [Routes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Route ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               departureProvinceId:
 *                 type: integer
 *                 description: ID of departure province
 *               arrivalProvinceId:
 *                 type: integer
 *                 description: ID of arrival province
 *               distanceKm:
 *                 type: integer
 *                 description: Distance in kilometers
 *               estimatedTime:
 *                 type: integer
 *                 description: Estimated travel time in minutes
 *     responses:
 *       200:
 *         description: Route updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Route'
 *                 message:
 *                   type: string
 *       404:
 *         description: Route not found
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized - Admin authentication required
 */
router.put("/:id", requireAdminOrManager, validateRouteUpdate, handleValidationErrors, routeController.updateRoute);

/**
 * @swagger
 * /api/routes/{id}:
 *   delete:
 *     summary: Delete a route
 *     tags: [Routes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Route ID
 *     responses:
 *       200:
 *         description: Route deleted successfully
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
 *                     message:
 *                       type: string
 *                 message:
 *                   type: string
 *       404:
 *         description: Route not found
 *       401:
 *         description: Unauthorized - Admin authentication required
 */
router.delete("/:id", requireAdminOrManager, validateRouteId, handleValidationErrors, routeController.deleteRoute);

/**
 * @swagger
 * /api/routes/province/{provinceId}:
 *   get:
 *     summary: Get routes by province
 *     tags: [Routes]
 *     parameters:
 *       - in: path
 *         name: provinceId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Province ID
 *     responses:
 *       200:
 *         description: List of routes for the province
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
 *                     $ref: '#/components/schemas/Route'
 *                 message:
 *                   type: string
 */
router.get("/province/:provinceId", validateProvinceId, handleValidationErrors, routeController.getRoutesByProvince);

/**
 * @swagger
 * /api/routes/destinations/{provinceId}:
 *   get:
 *     summary: Get available destinations from a province
 *     tags: [Routes]
 *     parameters:
 *       - in: path
 *         name: provinceId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Departure province ID
 *     responses:
 *       200:
 *         description: Available destinations from the province
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
 *                     departureProvince:
 *                       $ref: '#/components/schemas/Province'
 *                     destinations:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Province'
 *                 message:
 *                   type: string
 *       404:
 *         description: Province not found
 */
router.get("/destinations/:provinceId", validateProvinceId, handleValidationErrors, routeController.getAvailableDestinations);

module.exports = router;
