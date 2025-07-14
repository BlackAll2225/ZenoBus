const paymentService = require('../services/paymentService');
const bookingService = require('../services/bookingService');
const scheduleService = require('../services/scheduleService');
const seatService = require('../services/seatService');

// Tạo payment link cho booking
const createPayment = async (req, res) => {
  try {
    const { bookingId } = req.body;
    
    if (!bookingId) {
      return res.validationError('Thiếu booking ID');
    }

    console.log('🔍 Creating payment for booking:', bookingId);

    // Lấy thông tin booking
    const booking = await bookingService.getBookingById(bookingId);
    if (!booking) {
      return res.notFound('Không tìm thấy booking');
    }

    console.log('✅ Found booking:', { id: booking.id, status: booking.status });

    // Kiểm tra trạng thái booking
    if (booking.status !== 'pending') {
      return res.error('Booking không thể thanh toán', 400);
    }

    // Tạo order code
    const orderCode = parseInt(`${bookingId}${Date.now()}`.slice(-12));
    
    // Tính tổng tiền
    const totalAmount = booking.totalPrice || 0;

    // Tạo payment data
    const paymentData = {
      orderCode,
      amount: 2000,
      description: `Thanh toán vé xe từ ${booking.route?.departureProvince?.name} đến ${booking.route?.arrivalProvince?.name}`,
      returnUrl: `${process.env.BACKEND_URL}/api/payments/callback/success?orderCode=${orderCode}`,
      cancelUrl: `${process.env.BACKEND_URL}/api/payments/callback/cancel?orderCode=${orderCode}`,
      buyerName: booking.user?.fullName || 'Khách hàng',
      buyerEmail: booking.user?.email || '',
      buyerPhone: booking.user?.phoneNumber || '',
      items: [
        {
          name: `Vé xe ${booking.route?.departureProvince?.name} - ${booking.route?.arrivalProvince?.name}`,
          quantity: booking.seats?.length || 1,
          price: 2000
        }
      ]
    };

    console.log('📝 Payment data:', {
      orderCode,
      returnUrl: paymentData.returnUrl,
      cancelUrl: paymentData.cancelUrl,
      bookingId: bookingId
    });

    // Tạo signature
    const signature = paymentService.createSignature(paymentData);
    paymentData.signature = signature;

    // Tạo payment link
    const paymentResult = await paymentService.createPaymentLink(paymentData);

    // Cập nhật booking với payment info
    await bookingService.updateBooking(bookingId, {
      paymentRequestId: paymentResult.data.paymentRequestId,
      paymentUrl: paymentResult.data.checkoutUrl,
      orderCode: orderCode
    });

    return res.success({
      paymentUrl: paymentResult.data.checkoutUrl,
      paymentRequestId: paymentResult.data.paymentRequestId,
      orderCode: orderCode,
      bookingId: bookingId
    }, 'Tạo link thanh toán thành công');

  } catch (error) {
    console.error('Error creating payment:', error);
    return res.serverError('Lỗi tạo thanh toán');
  }
};

// Tạo payment link trực tiếp từ thông tin đặt vé
const createPaymentLink = async (req, res) => {
  try {
    const { scheduleId, seatIds, pickupStopId, dropoffStopId, totalAmount } = req.body;
    const userId = req.user?.id; // Từ middleware auth

    if (!userId) {
      return res.unauthorized('Vui lòng đăng nhập');
    }

    if (!scheduleId || !seatIds || seatIds.length === 0) {
      return res.validationError('Thiếu thông tin schedule hoặc seats');
    }

    // Kiểm tra schedule tồn tại
    const schedule = await scheduleService.getScheduleById(scheduleId);
    if (!schedule) {
      return res.notFound('Không tìm thấy lịch trình');
    }

    // Kiểm tra seats có sẵn
    const availableSeats = await seatService.getAvailableSeats(scheduleId);
    const bookedSeats = availableSeats.filter(seat => seat.bookingStatus === 'booked');
    const bookedSeatIds = bookedSeats.map(seat => seat.id);
    const invalidSeats = seatIds.filter(id => bookedSeatIds.includes(id));
    
    if (invalidSeats.length > 0) {
      return res.error('Một số ghế đã được đặt', 400);
    }

    // Tạo booking
    const bookingData = {
      userId,
      scheduleId,
      seatIds,
      pickupStopId,
      dropoffStopId,
      totalAmount,
      paymentMethod: 'payos' // Sử dụng PayOS làm phương thức thanh toán
    };

    const bookingResult = await bookingService.createBooking(bookingData);
    
    if (!bookingResult || !bookingResult.booking) {
      return res.error('Không thể tạo booking', 400);
    }

    const booking = bookingResult.booking;
    console.log('✅ Booking created:', { id: booking.id, status: booking.status });

    // Tạo order code (số)
    const orderCode = parseInt(`${booking.id}${Date.now()}`.slice(-12));
    
    // Tạo payment data
    const paymentData = {
      orderCode,
      amount: 2000,
      description: `Thanh toán vé xe từ ${schedule.route?.departureProvince?.name} đến ${schedule.route?.arrivalProvince?.name}`,
      returnUrl: `${process.env.BACKEND_URL}/api/payments/callback/success?orderCode=${orderCode}`,
      cancelUrl: `${process.env.BACKEND_URL}/api/payments/callback/cancel?orderCode=${orderCode}`,
      buyerName: req.user?.fullName || 'Khách hàng',
      buyerEmail: req.user?.email || '',
      buyerPhone: req.user?.phoneNumber || '',
      items: [
        {
          name: `Vé xe ${schedule.route?.departureProvince?.name} - ${schedule.route?.arrivalProvince?.name}`,
          quantity: seatIds.length,
          price: 2000
        }
      ]
    };

    console.log('📝 Payment data:', {
      orderCode,
      returnUrl: paymentData.returnUrl,
      cancelUrl: paymentData.cancelUrl,
      bookingId: booking.id
    });

    // Tạo signature
    const signature = paymentService.createSignature(paymentData);
    paymentData.signature = signature;

    // Tạo payment link
    const paymentResult = await paymentService.createPaymentLink(paymentData);

    // Cập nhật booking với payment info
    await bookingService.updateBooking(booking.id, {
      paymentRequestId: paymentResult.data.paymentRequestId,
      paymentUrl: paymentResult.data.checkoutUrl,
      orderCode: orderCode,
      status: paymentResult.data.status 
    });

    return res.success({
      paymentUrl: paymentResult.data.checkoutUrl,
      paymentRequestId: paymentResult.data.paymentRequestId,
      orderCode: orderCode,
      bookingId: booking.id
    }, 'Tạo link thanh toán thành công');

  } catch (error) {
    console.error('Error creating payment link:', error);
    return res.serverError('Lỗi tạo thanh toán');
  }
};

// Webhook nhận thông báo thanh toán từ payOS
const handleWebhook = async (req, res) => {
  try {
    console.log('🔔 Webhook received:', req.body);
    
    // Cấu trúc dữ liệu từ PayOS theo document
    const { code, desc, success, data, signature } = req.body;
    
    console.log('📋 Webhook structure:', { code, desc, success, data: data ? 'present' : 'missing' });
    
    // Kiểm tra success
    if (!success) {
      console.log('❌ Webhook indicates failure:', { code, desc });
      return res.error('Payment failed', 400);
    }
    
    // Xác thực signature với toàn bộ request body
    if (!paymentService.verifyWebhookSignature(req.body, signature)) {
      console.log('❌ Invalid webhook signature');
      return res.error('Invalid signature', 400);
    }

    if (!data) {
      console.log('❌ No data in webhook');
      return res.error('No data in webhook', 400);
    }

    const { orderCode, amount, description, paymentLinkId, code: paymentCode, desc: paymentDesc } = data;
    console.log('📋 Payment data:', { orderCode, amount, paymentLinkId, paymentCode, paymentDesc });

    // Tìm booking theo orderCode
    const booking = await bookingService.getBookingByOrderCode(orderCode);
    if (!booking) {
      console.log('❌ Booking not found for orderCode:', orderCode);
      return res.error('Booking not found', 404);
    }

    console.log('✅ Found booking:', { id: booking.id, currentStatus: booking.status });

    // Cập nhật trạng thái booking dựa trên payment code
    let bookingStatus = 'pending';
    let paymentStatus = 'pending';

    switch (paymentCode) {
      case '00': // Thành công
        bookingStatus = 'paid';
        paymentStatus = 'paid';
        break;
      case '01': // Thất bại
        bookingStatus = 'cancelled';
        paymentStatus = 'failed';
        break;
      case '02': // Hết hạn
        bookingStatus = 'cancelled';
        paymentStatus = 'expired';
        break;
      default:
        bookingStatus = 'pending';
        paymentStatus = 'pending';
    }

    console.log('🔄 Updating booking status:', { 
      from: booking.status, 
      to: bookingStatus, 
      paymentStatus,
      paymentCode,
      paymentDesc
    });

    // Cập nhật booking
    const updateData = {
      status: bookingStatus,
      paymentStatus: paymentStatus,
      paymentCompletedAt: paymentCode === '00' ? new Date() : null
    };

    console.log('📝 Update data:', updateData);
    console.log('🔧 Calling updateBooking with:', { bookingId: booking.id, updateData });

    const updatedBooking = await bookingService.updateBooking(booking.id, updateData);
    
    if (!updatedBooking) {
      console.log('❌ Failed to update booking');
      return res.error('Failed to update booking', 500);
    }

    console.log('✅ Booking updated successfully:', {
      id: updatedBooking.id,
      newStatus: updatedBooking.status,
      paymentStatus: updatedBooking.paymentStatus,
      paymentCompletedAt: updatedBooking.paymentCompletedAt
    });

    // Trả về response theo format PayOS yêu cầu
    return res.json({ success: true });

  } catch (error) {
    console.error('Error processing webhook:', error);
    return res.serverError('Lỗi xử lý webhook');
  }
};

// Lấy thông tin thanh toán
const getPaymentInfo = async (req, res) => {
  try {
    const { paymentRequestId } = req.params;
    
    const paymentInfo = await paymentService.getPaymentInfo(paymentRequestId);
    
    return res.success(paymentInfo, 'Lấy thông tin thanh toán thành công');
  } catch (error) {
    console.error('Error getting payment info:', error);
    return res.serverError('Lỗi lấy thông tin thanh toán');
  }
};

// Hủy thanh toán
const cancelPayment = async (req, res) => {
  try {
    const { paymentRequestId } = req.params;
    const { reason } = req.body;
    
    const result = await paymentService.cancelPayment(paymentRequestId, reason);
    
    return res.success(result, 'Hủy thanh toán thành công');
  } catch (error) {
    console.error('Error canceling payment:', error);
    return res.serverError('Lỗi hủy thanh toán');
  }
};

// API để update booking status khi user quay về từ PayOS success callback
const updateBookingFromCallback = async (req, res) => {
  try {
    const { orderCode, paymentRequestId, status } = req.query;
    
    console.log('🔄 Payment callback received:', { orderCode, paymentRequestId, status });

    if (!orderCode) {
      return res.validationError('Thiếu orderCode');
    }

    // Tìm booking theo orderCode
    const booking = await bookingService.getBookingByOrderCode(orderCode);
    if (!booking) {
      console.log('❌ Booking not found for orderCode:', orderCode);
      return res.notFound('Không tìm thấy booking');
    }

    console.log('✅ Found booking:', { id: booking.id, currentStatus: booking.status });

    // Cập nhật trạng thái booking dựa trên status
    let bookingStatus = 'pending';
    let paymentStatus = 'pending';

    switch (status) {
      case 'PAID':
      case '00':
        bookingStatus = 'paid';
        paymentStatus = 'paid';
        break;
      case 'CANCELLED':
      case '01':
        bookingStatus = 'cancelled';
        paymentStatus = 'cancelled';
        break;
      case 'EXPIRED':
      case '02':
        bookingStatus = 'cancelled';
        paymentStatus = 'expired';
        break;
      default:
        bookingStatus = 'pending';
        paymentStatus = 'pending';
    }

    console.log('🔄 Updating booking status:', { 
      from: booking.status, 
      to: bookingStatus, 
      paymentStatus 
    });

    // Cập nhật booking
    const updateData = {
      status: bookingStatus,
      paymentStatus: paymentStatus,
      paymentCompletedAt: (status === 'PAID' || status === '00') ? new Date() : null
    };

    console.log('📝 Update data:', updateData);

    const updatedBooking = await bookingService.updateBooking(booking.id, updateData);
    
    if (!updatedBooking) {
      console.log('❌ Failed to update booking');
      return res.error('Failed to update booking', 500);
    }

    console.log('✅ Booking updated successfully:', {
      id: updatedBooking.id,
      newStatus: updatedBooking.status,
      paymentStatus: updatedBooking.paymentStatus,
      paymentCompletedAt: updatedBooking.paymentCompletedAt
    });

    // Redirect về frontend với thông tin booking
    const redirectUrl = `${process.env.FRONTEND_URL}/payment/success?bookingId=${booking.id}&status=${bookingStatus}`;
    
    console.log('🔄 Redirecting to:', redirectUrl);
    
    return res.redirect(redirectUrl);

  } catch (error) {
    console.error('Error processing payment callback:', error);
    
    // Redirect về error page
    const errorUrl = `${process.env.FRONTEND_URL}/payment/error?message=${encodeURIComponent('Lỗi xử lý thanh toán')}`;
    return res.redirect(errorUrl);
  }
};

// API để cancel booking khi user quay về từ PayOS cancel callback
const cancelBookingFromCallback = async (req, res) => {
  try {
    const { orderCode } = req.query;
    
    console.log('❌ Payment cancel callback received:', { orderCode });

    if (!orderCode) {
      return res.validationError('Thiếu orderCode');
    }

    // Tìm booking theo orderCode
    const booking = await bookingService.getBookingByOrderCode(orderCode);
    if (!booking) {
      console.log('❌ Booking not found for orderCode:', orderCode);
      return res.notFound('Không tìm thấy booking');
    }

    console.log('✅ Found booking for cancellation:', { id: booking.id, currentStatus: booking.status });

    // Cập nhật booking thành cancelled
    const updateData = {
      status: 'cancelled',
      paymentStatus: 'cancelled'
    };

    const updatedBooking = await bookingService.updateBooking(booking.id, updateData);
    
    if (!updatedBooking) {
      console.log('❌ Failed to cancel booking');
      return res.error('Failed to cancel booking', 500);
    }

    console.log('✅ Booking cancelled successfully:', {
      id: updatedBooking.id,
      newStatus: updatedBooking.status
    });

    // Redirect về frontend cancel page
    const redirectUrl = `${process.env.FRONTEND_URL}/payment/cancel?bookingId=${booking.id}`;
    
    console.log('🔄 Redirecting to cancel page:', redirectUrl);
    
    return res.redirect(redirectUrl);

  } catch (error) {
    console.error('Error processing payment cancel callback:', error);
    
    // Redirect về error page
    const errorUrl = `${process.env.FRONTEND_URL}/payment/error?message=${encodeURIComponent('Lỗi hủy thanh toán')}`;
    return res.redirect(errorUrl);
  }
};

module.exports = {
  createPayment,
  createPaymentLink,
  handleWebhook,
  updateBookingFromCallback,
  cancelBookingFromCallback,
  getPaymentInfo,
  cancelPayment
}; 