const express = require('express');
const router = express.Router();
const controller = require('../controllers/paymentController');
const auth = require('../middlewares/auth.js');

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Quản lý thanh toán
 *
 * components:
 *   schemas:
 *     PaymentRequest:
 *       type: object
 *       required:
 *         - bookingId
 *       properties:
 *         bookingId:
 *           type: integer
 *           example: 1
 *     CreatePaymentLinkRequest:
 *       type: object
 *       required:
 *         - scheduleId
 *         - seatIds
 *         - totalAmount
 *       properties:
 *         scheduleId:
 *           type: integer
 *           example: 1
 *         seatIds:
 *           type: array
 *           items:
 *             type: integer
 *           example: [1, 2, 3]
 *         pickupStopId:
 *           type: integer
 *           nullable: true
 *           example: 1
 *         dropoffStopId:
 *           type: integer
 *           nullable: true
 *           example: 2
 *         totalAmount:
 *           type: number
 *           example: 150000
 *     PaymentResponse:
 *       type: object
 *       properties:
 *         paymentUrl:
 *           type: string
 *           example: "https://sandbox-checkout.payos.vn/..."
 *         paymentRequestId:
 *           type: string
 *           example: "pr_123456789"
 *         orderCode:
 *           type: string
 *           example: "BOOKING_1_1234567890"
 */

/**
 * @swagger
 * /api/payments/create:
 *   post:
 *     summary: Tạo link thanh toán cho booking
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PaymentRequest'
 *     responses:
 *       200:
 *         description: Tạo link thanh toán thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/PaymentResponse'
 *                 message:
 *                   type: string
 *       400:
 *         description: Lỗi validation hoặc booking không hợp lệ
 *       404:
 *         description: Không tìm thấy booking
 */
router.post('/create', auth, controller.createPayment);

/**
 * @swagger
 * /api/payments/create-link:
 *   post:
 *     summary: Tạo link thanh toán trực tiếp từ thông tin đặt vé
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePaymentLinkRequest'
 *     responses:
 *       200:
 *         description: Tạo link thanh toán thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/PaymentResponse'
 *                 message:
 *                   type: string
 *       400:
 *         description: Lỗi validation hoặc thông tin không hợp lệ
 *       401:
 *         description: Chưa đăng nhập
 *       404:
 *         description: Không tìm thấy lịch trình
 */
router.post('/create-link', auth, controller.createPaymentLink);

/**
 * @swagger
 * /api/payments/webhook:
 *   post:
 *     summary: Webhook nhận thông báo thanh toán từ payOS
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               data:
 *                 type: object
 *                 properties:
 *                   orderCode:
 *                     type: string
 *                   status:
 *                     type: string
 *                     enum: [PAID, CANCELLED, EXPIRED]
 *                   paymentRequestId:
 *                     type: string
 *               signature:
 *                 type: string
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 *       400:
 *         description: Invalid signature
 *       404:
 *         description: Booking not found
 */
router.post('/webhook', controller.handleWebhook);

/**
 * @swagger
 * /api/payments/{paymentRequestId}:
 *   get:
 *     summary: Lấy thông tin thanh toán
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentRequestId
 *         schema:
 *           type: string
 *         required: true
 *         description: Payment Request ID
 *     responses:
 *       200:
 *         description: Lấy thông tin thanh toán thành công
 *       404:
 *         description: Không tìm thấy thanh toán
 */
router.get('/:paymentRequestId', auth, controller.getPaymentInfo);

/**
 * @swagger
 * /api/payments/{paymentRequestId}/cancel:
 *   post:
 *     summary: Hủy thanh toán
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentRequestId
 *         schema:
 *           type: string
 *         required: true
 *         description: Payment Request ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 example: "Khách hàng hủy"
 *     responses:
 *       200:
 *         description: Hủy thanh toán thành công
 *       404:
 *         description: Không tìm thấy thanh toán
 */
router.post('/:paymentRequestId/cancel', auth, controller.cancelPayment);

/**
 * @swagger
 * /api/payments/callback/success:
 *   get:
 *     summary: Callback khi thanh toán thành công từ PayOS
 *     tags: [Payments]
 *     parameters:
 *       - in: query
 *         name: orderCode
 *         schema:
 *           type: string
 *         required: true
 *         description: Order code từ PayOS
 *       - in: query
 *         name: paymentRequestId
 *         schema:
 *           type: string
 *         description: Payment Request ID từ PayOS
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Payment status từ PayOS
 *     responses:
 *       302:
 *         description: Redirect về frontend success page
 *       400:
 *         description: Thiếu orderCode
 *       404:
 *         description: Không tìm thấy booking
 */
router.get('/callback/success', controller.updateBookingFromCallback);

/**
 * @swagger
 * /api/payments/callback/cancel:
 *   get:
 *     summary: Callback khi thanh toán bị hủy từ PayOS
 *     tags: [Payments]
 *     parameters:
 *       - in: query
 *         name: orderCode
 *         schema:
 *           type: string
 *         required: true
 *         description: Order code từ PayOS
 *     responses:
 *       302:
 *         description: Redirect về frontend cancel page
 *       400:
 *         description: Thiếu orderCode
 *       404:
 *         description: Không tìm thấy booking
 */
router.get('/callback/cancel', controller.cancelBookingFromCallback);

module.exports = router; 