const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const adminAuth = require('../middlewares/adminAuth');
const auth = require('../middlewares/auth');
const { validateCreateFeedback, validateUpdateFeedback, validateFeedbackId, validateFeedbackFilter } = require('../validations/feedbackValidation');

// Lấy tất cả feedback (public)
router.get('/', feedbackController.getAllFeedbacks);

// Lấy feedback theo ID (public)
router.get('/:id', feedbackController.getFeedbackById);

// Lấy feedback theo user (user hoặc admin)
router.get('/user/:userId', auth, feedbackController.getFeedbacksByUser);

// Lấy feedback theo booking (user hoặc admin)
router.get('/booking/:bookingId', auth, feedbackController.getFeedbacksByBooking);

// Lấy thống kê feedback (admin)
router.get('/stats', adminAuth, feedbackController.getFeedbackStats);

// Lấy feedback mới nhất (public)
router.get('/recent', feedbackController.getRecentFeedbacks);

// Tạo feedback (user)
router.post('/', auth, feedbackController.createFeedback);

// Sửa feedback (admin)
router.put('/:id', adminAuth, feedbackController.updateFeedback);

// Xóa feedback (admin)
router.delete('/:id', adminAuth, feedbackController.deleteFeedback);

module.exports = router; 