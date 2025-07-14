const feedbackService = require('../services/feedbackService');

class FeedbackController {
  async getAllFeedbacks(req, res) {
    try {
      const filters = {
        page: req.query.page,
        limit: req.query.limit,
        rating: req.query.rating,
        userId: req.query.userId,
        bookingId: req.query.bookingId,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        sortBy: req.query.sortBy,
        sortOrder: req.query.sortOrder
      };
      const result = await feedbackService.getAllFeedbacks(filters);
      res.success('Feedbacks retrieved successfully', result);
    } catch (error) {
      res.error(error.message, 500);
    }
  }

  async getFeedbackById(req, res) {
    try {
      const { id } = req.params;
      const feedback = await feedbackService.getFeedbackById(id);
      res.success('Feedback retrieved successfully', feedback);
    } catch (error) {
      if (error.message === 'Feedback not found') {
        return res.error(error.message, 404);
      }
      res.error(error.message, 500);
    }
  }

  async createFeedback(req, res) {
    try {
      const feedback = await feedbackService.createFeedback(req.body);
      res.created(feedback, 'Feedback created successfully');
    } catch (error) {
      if (error.message.includes('not found')) {
        return res.error(error.message, 404);
      }
      if (error.message.includes('already exists')) {
        return res.error(error.message, 400);
      }
      if (error.message.includes('Rating')) {
        return res.error(error.message, 400);
      }
      res.error(error.message, 500);
    }
  }

  async updateFeedback(req, res) {
    try {
      const { id } = req.params;
      const feedback = await feedbackService.updateFeedback(id, req.body);
      res.success('Feedback updated successfully', feedback);
    } catch (error) {
      if (error.message === 'Feedback not found') {
        return res.error(error.message, 404);
      }
      if (error.message.includes('Rating')) {
        return res.error(error.message, 400);
      }
      res.error(error.message, 500);
    }
  }

  async deleteFeedback(req, res) {
    try {
      const { id } = req.params;
      const result = await feedbackService.deleteFeedback(id);
      res.success(result.message);
    } catch (error) {
      if (error.message === 'Feedback not found') {
        return res.error(error.message, 404);
      }
      res.error(error.message, 500);
    }
  }

  async getFeedbacksByUser(req, res) {
    try {
      const { userId } = req.params;
      const filters = {
        page: req.query.page,
        limit: req.query.limit
      };
      const result = await feedbackService.getFeedbacksByUser(userId, filters);
      res.success('User feedbacks retrieved successfully', result);
    } catch (error) {
      if (error.message === 'User not found') {
        return res.error(error.message, 404);
      }
      res.error(error.message, 500);
    }
  }

  async getFeedbacksByBooking(req, res) {
    try {
      const { bookingId } = req.params;
      const result = await feedbackService.getFeedbacksByBooking(bookingId);
      res.success('Booking feedbacks retrieved successfully', result);
    } catch (error) {
      if (error.message === 'Booking not found') {
        return res.error(error.message, 404);
      }
      res.error(error.message, 500);
    }
  }

  async getFeedbackStats(req, res) {
    try {
      const filters = {
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        userId: req.query.userId,
        bookingId: req.query.bookingId
      };
      const stats = await feedbackService.getFeedbackStats(filters);
      res.success('Feedback statistics retrieved successfully', stats);
    } catch (error) {
      res.error(error.message, 500);
    }
  }

  async getRecentFeedbacks(req, res) {
    try {
      const { limit } = req.query;
      const feedbacks = await feedbackService.getRecentFeedbacks(limit);
      res.success('Recent feedbacks retrieved successfully', feedbacks);
    } catch (error) {
      res.error(error.message, 500);
    }
  }
}

module.exports = new FeedbackController(); 