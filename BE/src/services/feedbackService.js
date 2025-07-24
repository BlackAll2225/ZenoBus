const { Op } = require('sequelize');
const Feedback = require('../models/FeedbackModel');
const User = require('../models/UserModel');
const Booking = require('../models/AccountModel');
const db = require('../config/database');
const { QueryTypes } = require('sequelize');

class FeedbackService {
  // Get all feedbacks with pagination and filters
  async getAllFeedbacks(filters = {}) {
    const {
      page = 1,
      limit = 10,
      rating,
      userId,
      bookingId,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = filters;

    const offset = (page - 1) * limit;
    
    // Build where conditions
    let whereConditions = {};
    
    if (rating) {
      whereConditions.rating = parseInt(rating);
    }
    
    if (userId) {
      whereConditions.userId = parseInt(userId);
    }
    
    if (bookingId) {
      whereConditions.bookingId = parseInt(bookingId);
    }
    
    if (startDate) {
      // Use UTC date directly (no timezone conversion)
      const start = new Date(startDate);
      whereConditions.createdAt = {
        ...whereConditions.createdAt,
        [Op.gte]: start
      };
    }
    
    if (endDate) {
      // Use UTC date directly (no timezone conversion)
      const end = new Date(endDate + ' 23:59:59');
      whereConditions.createdAt = {
        ...whereConditions.createdAt,
        [Op.lte]: end
      };
    }

    // Validate sortBy
    const allowedSortFields = ['id', 'rating', 'createdAt'];
    const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const validSortOrder = ['asc', 'desc'].includes(sortOrder.toLowerCase()) ? sortOrder.toUpperCase() : 'DESC';

    const { count, rows } = await Feedback.findAndCountAll({
      where: whereConditions,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'fullName', 'email']
        },
        {
          model: Booking,
          as: 'booking',
          attributes: ['id', 'totalPrice', 'status']
        }
      ],
      order: [[validSortBy, validSortOrder]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const totalPages = Math.ceil(count / limit);

    return {
      feedbacks: rows,
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages,
      sortBy: validSortBy,
      sortOrder: validSortOrder.toLowerCase()
    };
  }

  // Get feedback by ID
  async getFeedbackById(id) {
    const feedback = await Feedback.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'fullName', 'email']
        },
        {
          model: Booking,
          as: 'booking',
          attributes: ['id', 'totalPrice', 'status']
        }
      ]
    });

    if (!feedback) {
      throw new Error('Feedback not found');
    }

    return feedback;
  }

  // Create feedback
  async createFeedback(feedbackData) {
    const { userId, bookingId, rating, comment } = feedbackData;

    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Check if booking exists and belongs to user
    const booking = await Booking.findOne({
      where: { id: bookingId, user_id: userId }
    });
    if (!booking) {
      throw new Error('Booking not found or does not belong to user');
    }

    // Check if feedback already exists for this booking
    const existingFeedback = await Feedback.findOne({
      where: { bookingId }
    });
    if (existingFeedback) {
      throw new Error('Feedback already exists for this booking');
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    const feedback = await Feedback.create({
      userId,
      bookingId,
      rating,
      comment
    });

    return feedback;
  }

  // Update feedback
  async updateFeedback(id, updateData) {
    const feedback = await Feedback.findByPk(id);
    
    if (!feedback) {
      throw new Error('Feedback not found');
    }

    // Validate rating if provided
    if (updateData.rating && (updateData.rating < 1 || updateData.rating > 5)) {
      throw new Error('Rating must be between 1 and 5');
    }

    await feedback.update(updateData);
    
    return feedback;
  }

  // Delete feedback
  async deleteFeedback(id) {
    const feedback = await Feedback.findByPk(id);
    
    if (!feedback) {
      throw new Error('Feedback not found');
    }

    await feedback.destroy();
    return { message: 'Feedback deleted successfully' };
  }

  // Get feedbacks by user
  async getFeedbacksByUser(userId, filters = {}) {
    const { page = 1, limit = 10 } = filters;
    const offset = (page - 1) * limit;

    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const { count, rows } = await Feedback.findAndCountAll({
      where: { userId },
      include: [
        {
          model: Booking,
          as: 'booking',
          attributes: ['id', 'totalPrice', 'status']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    const totalPages = Math.ceil(count / limit);

    return {
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email
      },
      feedbacks: rows,
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages
    };
  }

  // Get feedbacks by booking
  async getFeedbacksByBooking(bookingId) {
    const booking = await Booking.findByPk(bookingId);
    if (!booking) {
      throw new Error('Booking not found');
    }

    const feedbacks = await Feedback.findAll({
      where: { bookingId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'fullName', 'email']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    return {
      booking: {
        id: booking.id,
        totalPrice: booking.totalPrice,
        status: booking.status
      },
      feedbacks
    };
  }

  // Get feedback statistics
  async getFeedbackStats(filters = {}) {
    const { startDate, endDate, userId, bookingId } = filters;
    
    let whereConditions = [];
    let params = {};
    
    if (startDate) {
      whereConditions.push('created_at >= :startDate');
      params.startDate = startDate;
    }
    
    if (endDate) {
      whereConditions.push('created_at <= :endDate');
      params.endDate = endDate + ' 23:59:59';
    }
    
    if (userId) {
      whereConditions.push('user_id = :userId');
      params.userId = userId;
    }
    
    if (bookingId) {
      whereConditions.push('booking_id = :bookingId');
      params.bookingId = bookingId;
    }
    
    const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

    const statsQuery = `
      SELECT 
        COUNT(*) as total,
        AVG(CAST(rating AS FLOAT)) as averageRating,
        SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as oneStar,
        SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as twoStars,
        SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as threeStars,
        SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as fourStars,
        SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as fiveStars
      FROM feedbacks
      ${whereClause}
    `;

    const stats = await db.query(statsQuery, {
      replacements: params,
      type: QueryTypes.SELECT
    });

    const result = stats[0];
    
    return {
      total: parseInt(result.total),
      averageRating: parseFloat(result.averageRating) || 0,
      ratingDistribution: {
        oneStar: parseInt(result.oneStar),
        twoStars: parseInt(result.twoStars),
        threeStars: parseInt(result.threeStars),
        fourStars: parseInt(result.fourStars),
        fiveStars: parseInt(result.fiveStars)
      },
      period: {
        startDate: startDate || null,
        endDate: endDate || null
      }
    };
  }

  // Get recent feedbacks
  async getRecentFeedbacks(limit = 5) {
    const feedbacks = await Feedback.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'fullName', 'email']
        },
        {
          model: Booking,
          as: 'booking',
          attributes: ['id', 'totalPrice', 'status']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit)
    });

    return feedbacks;
  }
}

module.exports = new FeedbackService(); 