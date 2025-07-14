const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");

/**
 * @swagger
 * components:
 *   schemas:
 *     Booking:
 *       type: object
 *       required:
 *         - userId
 *         - scheduleId
 *         - seatIds
 *       properties:
 *         userId:
 *           type: integer
 *           description: User ID
 *         scheduleId:
 *           type: integer
 *           description: Schedule ID
 *         seatIds:
 *           type: array
 *           items:
 *             type: integer
 *           description: Array of seat IDs to book
 *         pickupStopId:
 *           type: integer
 *           description: Pickup stop ID (optional)
 *         dropoffStopId:
 *           type: integer
 *           description: Dropoff stop ID (optional)
 *         paymentMethod:
 *           type: string
 *           description: Payment method (cash, card, etc.)
 *     BookingResponse:
 *       type: object
 *       properties:
 *         booking:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *             totalPrice:
 *               type: number
 *             status:
 *               type: string
 *             bookedAt:
 *               type: string
 *               format: date-time
 *             paymentMethod:
 *               type: string
 *             schedule:
 *               type: object
 *               properties:
 *                 departureTime:
 *                   type: string
 *                   format: date-time
 *                 seatPrice:
 *                   type: number
 *             bus:
 *               type: object
 *               properties:
 *                 licensePlate:
 *                   type: string
 *                 busType:
 *                   type: string
 *             route:
 *               type: object
 *               properties:
 *                 departureProvince:
 *                   type: string
 *                 arrivalProvince:
 *                   type: string
 *                 pickupStop:
 *                   type: string
 *                 dropoffStop:
 *                   type: string
 *             user:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 phone:
 *                   type: string
 *         seats:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               seatId:
 *                 type: integer
 *               seatNumber:
 *                 type: string
 *               floor:
 *                 type: string
 *               price:
 *                 type: number
 *         summary:
 *           type: object
 *           properties:
 *             totalSeats:
 *               type: integer
 *             totalPrice:
 *               type: number
 *             seatPrice:
 *               type: number
 */

/**
 * @swagger
 * /api/bookings:
 *   post:
 *     summary: Create a new booking
 *     tags: [Bookings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Booking'
 *     responses:
 *       201:
 *         description: Booking created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/BookingResponse'
 *                 message:
 *                   type: string
 *       400:
 *         description: Validation error or seats already booked
 *       404:
 *         description: User, schedule, or seats not found
 */
router.post("/", bookingController.createBooking);

/**
 * @swagger
 * /api/bookings/user/{userId}:
 *   get:
 *     summary: Get all bookings for a user
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User bookings retrieved successfully
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
 *                       totalPrice:
 *                         type: number
 *                       status:
 *                         type: string
 *                       bookedAt:
 *                         type: string
 *                         format: date-time
 *                       paymentMethod:
 *                         type: string
 *                       departureTime:
 *                         type: string
 *                         format: date-time
 *                       departureProvince:
 *                         type: string
 *                       arrivalProvince:
 *                         type: string
 *                       pickupStop:
 *                         type: string
 *                       dropoffStop:
 *                         type: string
 *                       seatCount:
 *                         type: integer
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid user ID
 *       404:
 *         description: User not found
 */
router.get("/user/:userId", bookingController.getUserBookings);

/**
 * @swagger
 * /api/bookings/{bookingId}:
 *   get:
 *     summary: Get booking details by ID
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Booking ID
 *     responses:
 *       200:
 *         description: Booking details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/BookingResponse'
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid booking ID
 *       404:
 *         description: Booking not found
 */
router.get("/:bookingId", bookingController.getBookingById);

/**
 * @swagger
 * /api/bookings/{bookingId}/cancel:
 *   put:
 *     summary: Cancel a booking
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Booking ID
 *     responses:
 *       200:
 *         description: Booking cancelled successfully
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
 *                     bookingId:
 *                       type: integer
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid booking ID or booking cannot be cancelled
 *       404:
 *         description: Booking not found
 */
router.put("/:bookingId/cancel", bookingController.cancelBooking);

module.exports = router; 