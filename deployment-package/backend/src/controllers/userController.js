const userService = require('../services/userService');
const bookingService = require('../services/bookingService');
const { validateUserUpdate } = require('../validations/userValidation');

class UserController {
  // Get all users (admin only)
  async getAllUsers(req, res) {
    try {
      const filters = {
        page: req.query.page,
        limit: req.query.limit,
        search: req.query.search,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        sortBy: req.query.sortBy,
        sortOrder: req.query.sortOrder
      };

      const result = await userService.getAllUsers(filters);
      
      res.success(result, 'Users retrieved successfully');
    } catch (error) {
      res.error(error.message, 500);
    }
  }

  // Get user by ID (admin only)
  async getUserById(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(parseInt(id))) {
        return res.error('Invalid user ID', 400);
      }

      const user = await userService.getUserById(parseInt(id));
      res.success(user, 'User retrieved successfully');
    } catch (error) {
      if (error.message === 'User not found') {
        return res.error(error.message, 404);
      }
      res.error(error.message, 500);
    }
  }

  // Update user (admin only)
  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      if (!id || isNaN(parseInt(id))) {
        return res.error('Invalid user ID', 400);
      }

      // Validate update data
      const { error } = validateUserUpdate(updateData);
      if (error) {
        return res.error(error.details[0].message, 400);
      }

      const updatedUser = await userService.updateUser(parseInt(id), updateData);
      res.success(updatedUser, 'User updated successfully');
    } catch (error) {
      if (error.message === 'User not found') {
        return res.error(error.message, 404);
      }
      if (error.message === 'Email already exists') {
        return res.error(error.message, 409);
      }
      if (error.message === 'Invalid phone number format') {
        return res.error(error.message, 400);
      }
      res.error(error.message, 500);
    }
  }

  // Delete user (admin only)
  async deleteUser(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(parseInt(id))) {
        return res.error('Invalid user ID', 400);
      }

      const result = await userService.deleteUser(parseInt(id));
      res.success(null, result.message);
    } catch (error) {
      if (error.message === 'User not found') {
        return res.error(error.message, 404);
      }
      if (error.message === 'Cannot delete user with existing bookings') {
        return res.error(error.message, 400);
      }
      res.error(error.message, 500);
    }
  }

  // Get user statistics (admin only)
  async getUserStats(req, res) {
    try {
      const filters = {
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        search: req.query.search
      };

      const stats = await userService.getUserStats(filters);
      res.success(stats, 'User statistics retrieved successfully');
    } catch (error) {
      res.error(error.message, 500);
    }
  }

  // Get current user profile (authenticated user)
  async getCurrentUserProfile(req, res) {
    try {
      const userId = req.user.id;
      const user = await userService.getUserById(userId);
      res.success(user, 'Profile retrieved successfully');
    } catch (error) {
      if (error.message === 'User not found') {
        return res.error(error.message, 404);
      }
      res.error(error.message, 500);
    }
  }

  // Update current user profile (authenticated user)
  async updateCurrentUserProfile(req, res) {
    try {
      const userId = req.user.id;
      const updateData = req.body;

      // Remove sensitive fields that users shouldn't be able to update
      delete updateData.passwordHash;
      delete updateData.id;
      delete updateData.createdAt;
      delete updateData.email; // Users cannot change their email

      // Validate update data
      const { error } = validateUserUpdate(updateData);
      if (error) {
        return res.error(error.details[0].message, 400);
      }

      const updatedUser = await userService.updateUser(userId, updateData);
      res.success(updatedUser, 'Profile updated successfully');
    } catch (error) {
      if (error.message === 'User not found') {
        return res.error(error.message, 404);
      }
      if (error.message === 'Email already exists') {
        return res.error(error.message, 409);
      }
      if (error.message === 'Invalid phone number format') {
        return res.error(error.message, 400);
      }
      res.error(error.message, 500);
    }
  }

  // Get current user bookings (authenticated user)
  async getCurrentUserBookings(req, res) {
    try {
      const userId = req.user.id;
      const filters = {
        page: req.query.page,
        limit: req.query.limit
      };

      const result = await bookingService.getUserBookings(userId, filters);
      res.success(result, 'Your bookings retrieved successfully');
    } catch (error) {
      if (error.message === 'User not found') {
        return res.error(error.message, 404);
      }
      res.error(error.message, 500);
    }
  }

  // Get current user booking detail (authenticated user)
  async getCurrentUserBookingDetail(req, res) {
    try {
      const userId = req.user.id;
      const { bookingId } = req.params;
      
      if (!bookingId || isNaN(bookingId) || parseInt(bookingId) <= 0) {
        return res.error('Invalid booking ID', 400);
      }

      const booking = await bookingService.getBookingById(bookingId);
      
      if (!booking) {
        return res.error('Booking not found', 404);
      }

      // Kiểm tra xem booking có thuộc về user đăng nhập không
      if (booking.user.id !== userId) {
        return res.error('You can only view your own bookings', 403);
      }

      res.success(booking, 'Booking details retrieved successfully');
    } catch (error) {
      if (error.message.includes('not found')) {
        return res.error(error.message, 404);
      }
      res.error(error.message, 500);
    }
  }
}

module.exports = new UserController(); 