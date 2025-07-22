const { Op } = require('sequelize');
const User = require('../models/UserModel');
const Booking = require('../models/AccountModel'); // Assuming this is the booking model
const db = require('../config/database');
const { QueryTypes } = require('sequelize');

class UserService {
  // Get all users with pagination and filters
  async getAllUsers(filters = {}) {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = filters;

    const offset = (page - 1) * limit;
    
    // Build where conditions
    let whereConditions = {};
    
    if (search) {
      whereConditions[Op.or] = [
        { fullName: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phoneNumber: { [Op.like]: `%${search}%` } }
      ];
    }
    
    if (startDate) {
      // Convert VN date to UTC for database query
      const start = new Date(startDate);
      whereConditions.createdAt = {
        ...whereConditions.createdAt,
        [Op.gte]: new Date(start.getTime() - (7 * 60 * 60 * 1000))
      };
    }
    
    if (endDate) {
      // Convert VN date to UTC for database query
      const end = new Date(endDate + ' 23:59:59');
      whereConditions.createdAt = {
        ...whereConditions.createdAt,
        [Op.lte]: new Date(end.getTime() - (7 * 60 * 60 * 1000))
      };
    }

    // Validate sortBy
    const allowedSortFields = ['id', 'fullName', 'email', 'phoneNumber', 'createdAt'];
    const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const validSortOrder = ['asc', 'desc'].includes(sortOrder.toLowerCase()) ? sortOrder.toUpperCase() : 'DESC';

    const { count, rows } = await User.findAndCountAll({
      where: whereConditions,
      attributes: ['id', 'fullName', 'email', 'phoneNumber', 'createdAt'],
      order: [[validSortBy, validSortOrder]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const totalPages = Math.ceil(count / limit);

    // Đếm totalBookings cho từng user
    const userIds = rows.map(u => u.id);
    let bookingCounts = await db.query(
      `SELECT user_id, COUNT(*) as totalBookings
       FROM bookings
       WHERE user_id IN (:userIds)
         AND status NOT IN ('cancelled', 'pending')
       GROUP BY user_id`,
      {
        replacements: { userIds },
        type: QueryTypes.SELECT
      }
    );
    // Nếu bookingCounts là mảng 2 phần tử (MSSQL), lấy phần đầu
    if (Array.isArray(bookingCounts) && Array.isArray(bookingCounts[0])) {
      bookingCounts = bookingCounts[0];
    }
    const bookingMap = {};
    (bookingCounts || []).forEach(b => {
      bookingMap[b.user_id] = parseInt(b.totalBookings, 10);
    });
    const usersWithBookings = rows.map(user => ({
      ...user.toJSON(),
      totalBookings: bookingMap[user.id] || 0
    }));

    return {
      users: usersWithBookings,
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages,
      sortBy: validSortBy,
      sortOrder: validSortOrder.toLowerCase()
    };
  }

  // Get user by ID
  async getUserById(id) {
    const user = await User.findByPk(id, {
      attributes: ['id', 'fullName', 'email', 'phoneNumber', 'createdAt']
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  // Update user
  async updateUser(id, updateData) {
    const user = await User.findByPk(id);
    
    if (!user) {
      throw new Error('User not found');
    }

    // Validate email uniqueness if email is being updated
    if (updateData.email && updateData.email !== user.email) {
      const existingUser = await User.findOne({
        where: { email: updateData.email }
      });
      
      if (existingUser) {
        throw new Error('Email already exists');
      }
    }

    // Validate phone number format
    if (updateData.phoneNumber) {
      const phoneRegex = /^[0-9]{10,11}$/;
      if (!phoneRegex.test(updateData.phoneNumber)) {
        throw new Error('Invalid phone number format');
      }
    }

    await user.update(updateData);
    
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      createdAt: user.createdAt
    };
  }

  // Delete user
  async deleteUser(id) {
    const user = await User.findByPk(id);
    
    if (!user) {
      throw new Error('User not found');
    }

    // Check if user has bookings
    const bookingCount = await Booking.count({
      where: { user_id: id }
    });

    if (bookingCount > 0) {
      throw new Error('Cannot delete user with existing bookings');
    }

    await user.destroy();
    return { message: 'User deleted successfully' };
  }

  // Get user statistics
  async getUserStats(filters = {}) {
    const { startDate, endDate, search } = filters;
    
    let whereConditions = {};
    
    if (search) {
      whereConditions[Op.or] = [
        { fullName: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phoneNumber: { [Op.like]: `%${search}%` } }
      ];
    }
    
    if (startDate) {
      // Convert VN date to UTC for database query
      const start = new Date(startDate);
      whereConditions.createdAt = {
        ...whereConditions.createdAt,
        [Op.gte]: new Date(start.getTime() - (7 * 60 * 60 * 1000))
      };
    }
    
    if (endDate) {
      // Convert VN date to UTC for database query  
      const end = new Date(endDate + ' 23:59:59');
      whereConditions.createdAt = {
        ...whereConditions.createdAt,
        [Op.lte]: new Date(end.getTime() - (7 * 60 * 60 * 1000))
      };
    }

    const totalUsers = await User.count({ where: whereConditions });

    // Get users registered in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentUsers = await User.count({
      where: {
        ...whereConditions,
        createdAt: {
          [Op.gte]: thirtyDaysAgo
        }
      }
    });

    // Get users with bookings
    const usersWithBookings = await db.query(`
      SELECT COUNT(DISTINCT u.id) as count
      FROM users u
      INNER JOIN bookings b ON u.id = b.user_id
      ${whereConditions.createdAt ? 'WHERE u.created_at >= :startDate AND u.created_at <= :endDate' : ''}
    `, {
      replacements: whereConditions.createdAt ? {
        startDate: whereConditions.createdAt[Op.gte],
        endDate: whereConditions.createdAt[Op.lte]
      } : {},
      type: QueryTypes.SELECT
    });

    return {
      total: totalUsers,
      recentUsers,
      usersWithBookings: usersWithBookings[0]?.count || 0,
      period: {
        startDate: startDate || null,
        endDate: endDate || null
      }
    };
  }

  // Search users
  async searchUsers(query, limit = 10) {
    const users = await User.findAll({
      where: {
        [Op.or]: [
          { fullName: { [Op.like]: `%${query}%` } },
          { email: { [Op.like]: `%${query}%` } },
          { phoneNumber: { [Op.like]: `%${query}%` } }
        ]
      },
      attributes: ['id', 'fullName', 'email', 'phoneNumber'],
      limit: parseInt(limit),
      order: [['fullName', 'ASC']]
    });

    return users;
  }
}

module.exports = new UserService(); 