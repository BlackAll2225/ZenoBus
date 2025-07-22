const bookingService = require('../services/bookingService');

const createBooking = async (req, res) => {
  try {
    const {
      userId,
      scheduleId,
      seatIds,
      pickupStopId,
      dropoffStopId,
      paymentMethod
    } = req.body;

    // Validate required fields
    if (!userId || !scheduleId || !seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
      return res.error('Missing required fields: userId, scheduleId, seatIds (array)', 400);
    }

    // Validate seatIds array
    if (seatIds.length > 10) {
      return res.error('Maximum 10 seats can be booked at once', 400);
    }

    const booking = await bookingService.createBooking({
      userId,
      scheduleId,
      seatIds,
      pickupStopId,
      dropoffStopId,
      paymentMethod
    });

    res.success(booking, 'Booking created successfully', 201);
  } catch (error) {
    if (error.message.includes('not found')) {
      res.error(error.message, 404);
    } else if (error.message.includes('already booked') || error.message.includes('Invalid')) {
      res.error(error.message, 400);
    } else {
      res.error(error.message, 500);
    }
  }
};

const getUserBookings = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId || isNaN(userId) || parseInt(userId) <= 0) {
      return res.error('Invalid user ID', 400);
    }

    const bookings = await bookingService.getUserBookings(userId);
    res.success(bookings, 'User bookings retrieved successfully');
  } catch (error) {
    if (error.message.includes('not found')) {
      res.error(error.message, 404);
    } else {
      res.error(error.message, 500);
    }
  }
};

const getBookingById = async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    if (!bookingId || isNaN(bookingId) || parseInt(bookingId) <= 0) {
      return res.error('Invalid booking ID', 400);
    }

    const booking = await bookingService.getBookingById(bookingId);
    res.success(booking, 'Booking details retrieved successfully');
  } catch (error) {
    if (error.message.includes('not found')) {
      res.error(error.message, 404);
    } else {
      res.error(error.message, 500);
    }
  }
};

const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    if (!bookingId || isNaN(bookingId) || parseInt(bookingId) <= 0) {
      return res.error('Invalid booking ID', 400);
    }

    const result = await bookingService.cancelBooking(bookingId);
    res.success(result, 'Booking cancelled successfully');
  } catch (error) {
    if (error.message.includes('not found')) {
      res.error(error.message, 404);
    } else if (error.message.includes('cannot be cancelled')) {
      res.error(error.message, 400);
    } else {
      res.error(error.message, 500);
    }
  }
};

module.exports = {
  createBooking,
  getUserBookings,
  getBookingById,
  cancelBooking
}; 