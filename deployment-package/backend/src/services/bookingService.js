const { sql, poolPromise } = require('../config/db');

const createBooking = async (bookingData) => {
  const { userId, scheduleId, seatIds, pickupStopId, dropoffStopId, paymentMethod, totalAmount } = bookingData;
  
  const pool = await poolPromise;
  const transaction = new sql.Transaction(pool);
  
  try {
    await transaction.begin();

    // 1. Kiểm tra user có tồn tại không
    const userResult = await transaction.request()
      .input('userId', sql.Int, userId)
      .query('SELECT id, full_name FROM users WHERE id = @userId');
    
    if (userResult.recordset.length === 0) {
      throw new Error('User not found');
    }

    // 2. Kiểm tra schedule có tồn tại và còn chỗ không
    const scheduleResult = await transaction.request()
      .input('scheduleId', sql.Int, scheduleId)
      .query(`
        SELECT 
          s.id,
          s.departure_time,
          s.price,
          s.status,
          b.seat_count,
          r.departure_province_id,
          r.arrival_province_id
        FROM schedules s
        JOIN buses b ON s.bus_id = b.id
        JOIN routes r ON s.route_id = r.id
        WHERE s.id = @scheduleId AND s.status = 'scheduled'
      `);
    
    if (scheduleResult.recordset.length === 0) {
      throw new Error('Schedule not found or not available');
    }

    const schedule = scheduleResult.recordset[0];

    // 3. Kiểm tra ghế có tồn tại và còn trống không
    const seatIdsStr = seatIds.join(',');
    const seatsCheckResult = await transaction.request()
      .input('scheduleId', sql.Int, scheduleId)
      .query(`
        SELECT 
          s.id,
          s.seat_number,
          s.status,
          CASE 
            WHEN bs.id IS NOT NULL THEN 'booked'
            ELSE s.status
          END as currentStatus
        FROM seats s
        LEFT JOIN booking_seats bs ON s.id = bs.seat_id
        WHERE s.schedule_id = @scheduleId 
          AND s.id IN (${seatIds.join(',')})
      `);
    
    if (seatsCheckResult.recordset.length !== seatIds.length) {
      throw new Error('Some seats not found');
    }

    // Kiểm tra ghế có bị đặt chưa
    const bookedSeats = seatsCheckResult.recordset.filter(seat => seat.currentStatus === 'booked');
    if (bookedSeats.length > 0) {
      const bookedSeatNumbers = bookedSeats.map(seat => seat.seat_number).join(', ');
      throw new Error(`Seats ${bookedSeatNumbers} are already booked`);
    }

    // 4. Tính tổng tiền
    const totalPrice = totalAmount || (schedule.price * seatIds.length);

    // 5. Tạo booking
    const bookingResult = await transaction.request()
      .input('userId', sql.Int, userId)
      .input('scheduleId', sql.Int, scheduleId)
      .input('totalPrice', sql.Decimal(10, 2), totalPrice)
      .input('paymentMethod', sql.NVarChar(50), paymentMethod || 'cash')
      .input('pickupStopId', sql.Int, pickupStopId)
      .input('dropoffStopId', sql.Int, dropoffStopId)
      .query(`
        INSERT INTO bookings (user_id, schedule_id, total_price, status, payment_method, pickup_stop_id, dropoff_stop_id)
        OUTPUT INSERTED.id, INSERTED.booked_at
        VALUES (@userId, @scheduleId, @totalPrice, 'pending', @paymentMethod, @pickupStopId, @dropoffStopId)
      `);

    const booking = bookingResult.recordset[0];

    // 6. Tạo booking_seats cho từng ghế
    for (const seatId of seatIds) {
      await transaction.request()
        .input('bookingId', sql.Int, booking.id)
        .input('seatId', sql.Int, seatId)
        .input('price', sql.Decimal(10, 2), schedule.price)
        .input('pickupStopId', sql.Int, pickupStopId)
        .input('dropoffStopId', sql.Int, dropoffStopId)
        .query(`
          INSERT INTO booking_seats (booking_id, seat_id, price, pickup_stop_id, dropoff_stop_id)
          VALUES (@bookingId, @seatId, @price, @pickupStopId, @dropoffStopId)
        `);
    }

    await transaction.commit();

    // 7. Lấy thông tin booking đầy đủ
    const fullBookingResult = await pool.request()
      .input('bookingId', sql.Int, booking.id)
      .query(`
        SELECT 
          b.id,
          b.total_price,
          b.status,
          b.booked_at,
          b.payment_method,
          s.departure_time,
          s.price as seatPrice,
          bus.license_plate,
          bt.name as busType,
          dp.name as departureProvince,
          ap.name as arrivalProvince,
          ps.name as pickupStop,
          ds.name as dropoffStop,
          u.full_name as userName,
          u.email as userEmail,
          u.phone_number as userPhone
        FROM bookings b
        JOIN schedules s ON b.schedule_id = s.id
        JOIN buses bus ON s.bus_id = bus.id
        JOIN bus_types bt ON bus.bus_type_id = bt.id
        JOIN routes r ON s.route_id = r.id
        JOIN provinces dp ON r.departure_province_id = dp.id
        JOIN provinces ap ON r.arrival_province_id = ap.id
        LEFT JOIN stops ps ON b.pickup_stop_id = ps.id
        LEFT JOIN stops ds ON b.dropoff_stop_id = ds.id
        JOIN users u ON b.user_id = u.id
        WHERE b.id = @bookingId
      `);

    const bookingDetails = fullBookingResult.recordset[0];

    // 8. Lấy thông tin ghế đã đặt
    const seatsDetailsResult = await pool.request()
      .input('bookingId', sql.Int, booking.id)
      .query(`
        SELECT 
          bs.seat_id,
          s.seat_number,
          s.floor,
          bs.price
        FROM booking_seats bs
        JOIN seats s ON bs.seat_id = s.id
        WHERE bs.booking_id = @bookingId
        ORDER BY s.seat_number
      `);

    return {
      booking: {
        id: bookingDetails.id,
        totalPrice: bookingDetails.total_price,
        status: bookingDetails.status,
        bookedAt: bookingDetails.booked_at,
        paymentMethod: bookingDetails.payment_method,
        schedule: {
          departureTime: bookingDetails.departure_time,
          seatPrice: bookingDetails.seat_price
        },
        bus: {
          licensePlate: bookingDetails.license_plate,
          busType: bookingDetails.busType
        },
        route: {
          departureProvince: bookingDetails.departureProvince,
          arrivalProvince: bookingDetails.arrivalProvince,
          pickupStop: bookingDetails.pickupStop,
          dropoffStop: bookingDetails.dropoffStop
        },
        user: {
          name: bookingDetails.userName,
          email: bookingDetails.userEmail,
          phone: bookingDetails.userPhone
        }
      },
      seats: seatsDetailsResult.recordset.map(seat => ({
        seatId: seat.seat_id,
        seatNumber: seat.seat_number,
        floor: seat.floor,
        price: seat.price
      })),
      summary: {
        totalSeats: seatIds.length,
        totalPrice: bookingDetails.total_price,
        seatPrice: bookingDetails.seat_price
      }
    };

  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const getUserBookings = async (userId, filters = {}) => {
  try {
    const pool = await poolPromise;
    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 10;
    const offset = (page - 1) * limit;
    
    // Count total bookings for this user
    const countResult = await pool.request()
      .input('userId', sql.Int, userId)
      .query('SELECT COUNT(*) as total FROM bookings WHERE user_id = @userId');
    
    const total = countResult.recordset[0].total;
    const totalPages = Math.ceil(total / limit);
    
    // Get bookings with pagination
    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .input('offset', sql.Int, offset)
      .input('limit', sql.Int, limit)
      .query(`
        SELECT 
          b.id,
          b.total_price,
          b.status,
          b.booked_at,
          b.payment_method,
          s.id as scheduleId,
          s.departure_time,
          s.price as seatPrice,
          bus.license_plate,
          bt.name as busType,
          dp.name as departureProvince,
          ap.name as arrivalProvince,
          ps.name as pickupStop,
          ds.name as dropoffStop,
          u.id as userId,
          u.full_name as userName,
          u.email as userEmail,
          u.phone_number as userPhone
        FROM bookings b
        JOIN schedules s ON b.schedule_id = s.id
        JOIN buses bus ON s.bus_id = bus.id
        JOIN bus_types bt ON bus.bus_type_id = bt.id
        JOIN routes r ON s.route_id = r.id
        JOIN provinces dp ON r.departure_province_id = dp.id
        JOIN provinces ap ON r.arrival_province_id = ap.id
        LEFT JOIN stops ps ON b.pickup_stop_id = ps.id
        LEFT JOIN stops ds ON b.dropoff_stop_id = ds.id
        JOIN users u ON b.user_id = u.id
        WHERE b.user_id = @userId
        ORDER BY b.booked_at DESC
        OFFSET @offset ROWS
        FETCH NEXT @limit ROWS ONLY
      `);

    // Get seats for each booking
    const bookings = [];
    for (const booking of result.recordset) {
      const seatsResult = await pool.request()
        .input('bookingId', sql.Int, booking.id)
        .query(`
          SELECT 
            bs.seat_id,
            s.seat_number,
            s.floor,
            bs.price
          FROM booking_seats bs
          JOIN seats s ON bs.seat_id = s.id
          WHERE bs.booking_id = @bookingId
          ORDER BY s.seat_number
        `);

      bookings.push({
        id: booking.id,
        totalPrice: parseFloat(booking.total_price),
        status: booking.status,
        bookedAt: booking.booked_at,
        paymentMethod: booking.payment_method,
        user: {
          id: booking.userId,
          name: booking.userName,
          email: booking.userEmail,
          phone: booking.userPhone
        },
        schedule: {
          id: booking.scheduleId,
          departureTime: booking.departure_time,
          seatPrice: parseFloat(booking.seatPrice)
        },
        bus: {
          licensePlate: booking.license_plate,
          busType: booking.busType
        },
        route: {
          departureProvince: booking.departureProvince,
          arrivalProvince: booking.arrivalProvince,
          pickupStop: booking.pickupStop,
          dropoffStop: booking.dropoffStop
        },
        seats: seatsResult.recordset.map(seat => ({
          seatId: seat.seat_id,
          seatNumber: seat.seat_number,
          floor: seat.floor,
          price: parseFloat(seat.price)
        }))
      });
    }

    return {
      bookings,
      total,
      page,
      limit,
      totalPages
    };
  } catch (error) {
    throw new Error(`Error fetching user bookings: ${error.message}`);
  }
};

const getBookingById = async (bookingId) => {
  try {
    const pool = await poolPromise;
    
    const bookingResult = await pool.request()
      .input('bookingId', sql.Int, bookingId)
      .query(`
        SELECT 
          b.id,
          b.total_price,
          b.status,
          b.booked_at,
          b.payment_method,
          b.payment_request_id,
          b.payment_url,
          b.order_code,
          b.payment_status,
          b.payment_completed_at,
          s.id as scheduleId,
          s.departure_time,
          s.price as seatPrice,
          bus.license_plate,
          bt.name as busType,
          r.id as routeId,
          dp.id as departureProvinceId,
          dp.name as departureProvince,
          ap.id as arrivalProvinceId,
          ap.name as arrivalProvince,
          ps.name as pickupStop,
          ds.name as dropoffStop,
          u.id as userId,
          u.full_name as userName,
          u.email as userEmail,
          u.phone_number as userPhone
        FROM bookings b
        JOIN schedules s ON b.schedule_id = s.id
        JOIN buses bus ON s.bus_id = bus.id
        JOIN bus_types bt ON bus.bus_type_id = bt.id
        JOIN routes r ON s.route_id = r.id
        JOIN provinces dp ON r.departure_province_id = dp.id
        JOIN provinces ap ON r.arrival_province_id = ap.id
        LEFT JOIN stops ps ON b.pickup_stop_id = ps.id
        LEFT JOIN stops ds ON b.dropoff_stop_id = ds.id
        JOIN users u ON b.user_id = u.id
        WHERE b.id = @bookingId
      `);

    if (bookingResult.recordset.length === 0) {
      return null;
    }

    const booking = bookingResult.recordset[0];

    // Lấy thông tin ghế
    const seatsResult = await pool.request()
      .input('bookingId', sql.Int, bookingId)
      .query(`
        SELECT 
          bs.seat_id,
          s.seat_number,
          s.floor,
          bs.price
        FROM booking_seats bs
        JOIN seats s ON bs.seat_id = s.id
        WHERE bs.booking_id = @bookingId
        ORDER BY s.seat_number
      `);

    return {
      id: booking.id,
      totalPrice: booking.total_price || 0,
      status: booking.status || 'pending',
      bookedAt: booking.booked_at,
      paymentMethod: booking.payment_method || null,
      paymentRequestId: booking.payment_request_id || null,
      paymentUrl: booking.payment_url || null,
      orderCode: booking.order_code || null,
      paymentStatus: booking.payment_status || null,
      paymentCompletedAt: booking.payment_completed_at || null,
      schedule: {
        id: booking.scheduleId,
        departureTime: booking.departure_time,
        price: booking.seatPrice || 0
      },
      bus: {
        licensePlate: booking.license_plate || '',
        busType: booking.busType || ''
      },
      route: {
        id: booking.routeId,
        departureProvince: {
          id: booking.departureProvinceId,
          name: booking.departureProvince || ''
        },
        arrivalProvince: {
          id: booking.arrivalProvinceId,
          name: booking.arrivalProvince || ''
        },
        pickupStop: booking.pickupStop || null,
        dropoffStop: booking.dropoffStop || null
      },
      user: {
        id: booking.userId,
        fullName: booking.userName || '',
        email: booking.userEmail || '',
        phoneNumber: booking.userPhone || ''
      },
      seats: seatsResult.recordset.map(seat => ({
        seatId: seat.seat_id,
        seatNumber: seat.seat_number || '',
        floor: seat.floor || 'main',
        price: seat.price || 0
      }))
    };
  } catch (error) {
    throw new Error(`Error getting booking: ${error.message}`);
  }
};

const getBookingByOrderCode = async (orderCode) => {
  try {
    const pool = await poolPromise;
    
    const bookingResult = await pool.request()
      .input('orderCode', sql.BigInt, orderCode)
      .query(`
        SELECT id FROM bookings WHERE order_code = @orderCode
      `);

    if (bookingResult.recordset.length === 0) {
      return null;
    }

    const booking = bookingResult.recordset[0];
    return await getBookingById(booking.id);
  } catch (error) {
    throw new Error(`Error getting booking by order code: ${error.message}`);
  }
};

const updateBooking = async (bookingId, updateData) => {
  try {
    console.log('🔄 updateBooking called with:', { bookingId, updateData });
    
    const pool = await poolPromise;
    
    const updateFields = [];
    const inputs = [];
    
    // Xây dựng câu query động - chỉ update các field được truyền vào
    if (updateData.status !== undefined) {
      updateFields.push('status = @status');
      inputs.push({ name: 'status', type: sql.NVarChar(50), value: updateData.status });
      console.log('📝 Adding status update:', updateData.status);
    }
    
    if (updateData.paymentRequestId !== undefined) {
      updateFields.push('payment_request_id = @paymentRequestId');
      inputs.push({ name: 'paymentRequestId', type: sql.NVarChar(100), value: updateData.paymentRequestId });
      console.log('📝 Adding paymentRequestId update:', updateData.paymentRequestId);
    }
    
    if (updateData.paymentUrl !== undefined) {
      updateFields.push('payment_url = @paymentUrl');
      inputs.push({ name: 'paymentUrl', type: sql.NVarChar(500), value: updateData.paymentUrl });
      console.log('📝 Adding paymentUrl update:', updateData.paymentUrl);
    }
    
    if (updateData.orderCode !== undefined) {
      updateFields.push('order_code = @orderCode');
      inputs.push({ name: 'orderCode', type: sql.BigInt, value: updateData.orderCode });
      console.log('📝 Adding orderCode update:', updateData.orderCode);
    }
    
    if (updateData.paymentStatus !== undefined) {
      updateFields.push('payment_status = @paymentStatus');
      inputs.push({ name: 'paymentStatus', type: sql.NVarChar(50), value: updateData.paymentStatus });
      console.log('📝 Adding paymentStatus update:', updateData.paymentStatus);
    }
    
    if (updateData.paymentCompletedAt !== undefined) {
      updateFields.push('payment_completed_at = @paymentCompletedAt');
      inputs.push({ name: 'paymentCompletedAt', type: sql.DateTime, value: updateData.paymentCompletedAt });
      console.log('📝 Adding paymentCompletedAt update:', updateData.paymentCompletedAt);
    }

    // Kiểm tra xem có field nào được update không
    if (updateFields.length === 0) {
      console.log('⚠️ No fields to update - this is normal for payment info updates');
      // Không throw error nữa, chỉ return booking hiện tại
      return await getBookingById(bookingId);
    }

    const request = pool.request();
    request.input('bookingId', sql.Int, bookingId);
    
    inputs.forEach(input => {
      request.input(input.name, input.type, input.value);
    });

    const updateQuery = `
      UPDATE bookings 
      SET ${updateFields.join(', ')}
      WHERE id = @bookingId
    `;
    
    console.log('🔧 Executing update query:', updateQuery);
    console.log('📊 Query parameters:', { bookingId, inputs: inputs.map(i => ({ name: i.name, value: i.value })) });

    const result = await request.query(updateQuery);
    
    console.log('✅ Update query executed successfully');
    console.log('📊 Update result:', result);

    // Lấy booking đã cập nhật
    const updatedBooking = await getBookingById(bookingId);
    
    if (!updatedBooking) {
      console.log('❌ Failed to retrieve updated booking');
      throw new Error('Failed to retrieve updated booking');
    }

    console.log('✅ Booking updated successfully:', {
      id: updatedBooking.id,
      status: updatedBooking.status,
      paymentStatus: updatedBooking.paymentStatus,
      paymentCompletedAt: updatedBooking.paymentCompletedAt
    });

    return updatedBooking;
  } catch (error) {
    console.error('❌ Error updating booking:', error);
    console.error('Error stack:', error.stack);
    throw new Error(`Error updating booking: ${error.message}`);
  }
};

const cancelBooking = async (bookingId) => {
  const pool = await poolPromise;
  const transaction = new sql.Transaction(pool);
  
  try {
    await transaction.begin();

    // Kiểm tra booking có tồn tại không
    const bookingResult = await transaction.request()
      .input('bookingId', sql.Int, bookingId)
      .query('SELECT id, status FROM bookings WHERE id = @bookingId');
    
    if (bookingResult.recordset.length === 0) {
      throw new Error('Booking not found');
    }

    const booking = bookingResult.recordset[0];
    
    if (booking.status === 'cancelled') {
      throw new Error('Booking already cancelled');
    }

    if (booking.status === 'confirmed') {
      throw new Error('Cannot cancel confirmed booking');
    }

    // Cập nhật trạng thái booking
    await transaction.request()
      .input('bookingId', sql.Int, bookingId)
      .query('UPDATE bookings SET status = \'cancelled\' WHERE id = @bookingId');

    // Xóa booking_seats
    await transaction.request()
      .input('bookingId', sql.Int, bookingId)
      .query('DELETE FROM booking_seats WHERE booking_id = @bookingId');

    await transaction.commit();
    
    return { message: 'Booking cancelled successfully' };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

// ADMIN: Lấy danh sách booking với filter, phân trang
const getAllBookingsForAdmin = async ({ page, limit, filters }) => {
  const pool = await poolPromise;
  const offset = (page - 1) * limit;
  
  let whereConditions = [];
  let parameters = [];
  
  if (filters.status) {
    whereConditions.push('b.status = @status');
    parameters.push({ name: 'status', type: sql.NVarChar, value: filters.status });
  }
  
  if (filters.userId) {
    whereConditions.push('b.user_id = @userId');
    parameters.push({ name: 'userId', type: sql.Int, value: filters.userId });
  }
  
  if (filters.scheduleId) {
    whereConditions.push('b.schedule_id = @scheduleId');
    parameters.push({ name: 'scheduleId', type: sql.Int, value: filters.scheduleId });
  }
  
  if (filters.startDate) {
    whereConditions.push('b.booked_at >= @startDate');
    parameters.push({ name: 'startDate', type: sql.DateTime, value: new Date(filters.startDate) });
  }
  
  if (filters.endDate) {
    whereConditions.push('b.booked_at <= @endDate');
    parameters.push({ name: 'endDate', type: sql.DateTime, value: new Date(filters.endDate) });
  }
  
  if (filters.search) {
    whereConditions.push('(u.full_name LIKE @search OR u.email LIKE @search OR u.phone_number LIKE @search)');
    parameters.push({ name: 'search', type: sql.NVarChar, value: `%${filters.search}%` });
  }
  
  const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';
  
  // Count total
  const countRequest = pool.request();
  parameters.forEach(param => countRequest.input(param.name, param.type, param.value));
  const countResult = await countRequest.query(`
    SELECT COUNT(*) as total
    FROM bookings b
    JOIN users u ON b.user_id = u.id
    ${whereClause}
  `);
  const total = countResult.recordset[0].total;
  
  // Get bookings
  const request = pool.request();
  parameters.forEach(param => request.input(param.name, param.type, param.value));
  request.input('offset', sql.Int, offset);
  request.input('limit', sql.Int, limit);
  
  const result = await request.query(`
    SELECT 
      b.id,
      b.total_price,
      b.status,
      b.booked_at,
      b.payment_method,
      b.pickup_stop_id,
      b.dropoff_stop_id,
      u.id as userId,
      u.full_name as userName,
      u.email as userEmail,
      u.phone_number as userPhone,
      s.id as scheduleId,
      s.departure_time,
      s.price as seatPrice,
      bus.license_plate,
      bt.name as busType,
      dp.name as departureProvince,
      ap.name as arrivalProvince,
      ps.name as pickupStop,
      ds.name as dropoffStop
    FROM bookings b
    JOIN users u ON b.user_id = u.id
    JOIN schedules s ON b.schedule_id = s.id
    JOIN buses bus ON s.bus_id = bus.id
    JOIN bus_types bt ON bus.bus_type_id = bt.id
    JOIN routes r ON s.route_id = r.id
    JOIN provinces dp ON r.departure_province_id = dp.id
    JOIN provinces ap ON r.arrival_province_id = ap.id
    LEFT JOIN stops ps ON b.pickup_stop_id = ps.id
    LEFT JOIN stops ds ON b.dropoff_stop_id = ds.id
    ${whereClause}
    ORDER BY b.booked_at DESC
    OFFSET @offset ROWS
    FETCH NEXT @limit ROWS ONLY
  `);
  
  const bookings = result.recordset.map(booking => ({
    id: booking.id,
    totalPrice: booking.total_price,
    status: booking.status,
    bookedAt: booking.booked_at,
    paymentMethod: booking.payment_method,
    user: {
      id: booking.userId,
      name: booking.userName,
      email: booking.userEmail,
      phone: booking.userPhone
    },
    schedule: {
      id: booking.scheduleId,
      departureTime: booking.departure_time,
      seatPrice: booking.seat_price
    },
    bus: {
      licensePlate: booking.license_plate,
      busType: booking.busType
    },
    route: {
      departureProvince: booking.departureProvince,
      arrivalProvince: booking.arrivalProvince,
      pickupStop: booking.pickupStop,
      dropoffStop: booking.dropoffStop
    }
  }));
  
  return {
    bookings,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
};

// ADMIN: Lấy chi tiết booking
const getBookingByIdForAdmin = async (bookingId) => {
  const pool = await poolPromise;
  
  const result = await pool.request()
    .input('bookingId', sql.Int, bookingId)
    .query(`
      SELECT 
        b.id,
        b.total_price,
        b.status,
        b.booked_at,
        b.payment_method,
        b.pickup_stop_id,
        b.dropoff_stop_id,
        u.id as userId,
        u.full_name as userName,
        u.email as userEmail,
        u.phone_number as userPhone,
        s.id as scheduleId,
        s.departure_time,
        s.price as seatPrice,
        bus.license_plate,
        bt.name as busType,
        dp.name as departureProvince,
        ap.name as arrivalProvince,
        ps.name as pickupStop,
        ds.name as dropoffStop
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN schedules s ON b.schedule_id = s.id
      JOIN buses bus ON s.bus_id = bus.id
      JOIN bus_types bt ON bus.bus_type_id = bt.id
      JOIN routes r ON s.route_id = r.id
      JOIN provinces dp ON r.departure_province_id = dp.id
      JOIN provinces ap ON r.arrival_province_id = ap.id
      LEFT JOIN stops ps ON b.pickup_stop_id = ps.id
      LEFT JOIN stops ds ON b.dropoff_stop_id = ds.id
      WHERE b.id = @bookingId
    `);
  
  if (result.recordset.length === 0) {
    throw new Error('Booking not found');
  }
  
  const booking = result.recordset[0];
  
  // Lấy thông tin ghế
  const seatsResult = await pool.request()
    .input('bookingId', sql.Int, bookingId)
    .query(`
      SELECT 
        bs.seat_id,
        s.seat_number,
        s.floor,
        bs.price
      FROM booking_seats bs
      JOIN seats s ON bs.seat_id = s.id
      WHERE bs.booking_id = @bookingId
      ORDER BY s.seat_number
    `);
  
  return {
    id: booking.id,
    totalPrice: booking.total_price,
    status: booking.status,
    bookedAt: booking.booked_at,
    paymentMethod: booking.payment_method,
    user: {
      id: booking.userId,
      name: booking.userName,
      email: booking.userEmail,
      phone: booking.userPhone
    },
    schedule: {
      id: booking.scheduleId,
      departureTime: booking.departure_time,
      seatPrice: booking.seat_price
    },
    bus: {
      licensePlate: booking.license_plate,
      busType: booking.busType
    },
    route: {
      departureProvince: booking.departureProvince,
      arrivalProvince: booking.arrivalProvince,
      pickupStop: booking.pickupStop,
      dropoffStop: booking.dropoffStop
    },
    seats: seatsResult.recordset.map(seat => ({
      seatId: seat.seat_id,
      seatNumber: seat.seat_number,
      floor: seat.floor,
      price: seat.price
    }))
  };
};

// ADMIN: Cập nhật trạng thái booking
const updateBookingStatus = async (bookingId, { status, reason, updatedBy }) => {
  const pool = await poolPromise;
  const transaction = new sql.Transaction(pool);
  
  try {
    await transaction.begin();
    
    // Kiểm tra booking có tồn tại không
    const bookingResult = await transaction.request()
      .input('bookingId', sql.Int, bookingId)
      .query('SELECT id, status FROM bookings WHERE id = @bookingId');
    
    if (bookingResult.recordset.length === 0) {
      throw new Error('Booking not found');
    }
    
    const booking = bookingResult.recordset[0];
    
    // Kiểm tra trạng thái hiện tại
    if (booking.status === 'cancelled') {
      throw new Error('Cannot update cancelled booking');
    }
    
    if (booking.status === 'completed' && status !== 'completed') {
      throw new Error('Cannot update completed booking');
    }
    
    // Cập nhật trạng thái
    await transaction.request()
      .input('bookingId', sql.Int, bookingId)
      .input('status', sql.NVarChar, status)
      .query('UPDATE bookings SET status = @status WHERE id = @bookingId');
    
    // Log thay đổi (có thể thêm bảng audit log sau)
    console.log(`Booking ${bookingId} status updated from ${booking.status} to ${status} by admin ${updatedBy}. Reason: ${reason}`);
    
    await transaction.commit();
    
    return await getBookingByIdForAdmin(bookingId);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

// ADMIN: Hủy booking
const cancelBookingByAdmin = async (bookingId, { reason, cancelledBy }) => {
  const pool = await poolPromise;
  const transaction = new sql.Transaction(pool);
  
  try {
    await transaction.begin();
    
    // Kiểm tra booking có tồn tại không
    const bookingResult = await transaction.request()
      .input('bookingId', sql.Int, bookingId)
      .query('SELECT id, status FROM bookings WHERE id = @bookingId');
    
    if (bookingResult.recordset.length === 0) {
      throw new Error('Booking not found');
    }
    
    const booking = bookingResult.recordset[0];
    
    // Kiểm tra trạng thái hiện tại
    if (booking.status === 'cancelled') {
      throw new Error('Booking is already cancelled');
    }
    
    if (booking.status === 'completed') {
      throw new Error('Cannot cancel completed booking');
    }
    
    // Cập nhật trạng thái thành cancelled
    await transaction.request()
      .input('bookingId', sql.Int, bookingId)
      .input('status', sql.NVarChar, 'cancelled')
      .query('UPDATE bookings SET status = @status WHERE id = @bookingId');
    
    // Log thay đổi
    console.log(`Booking ${bookingId} cancelled by admin ${cancelledBy}. Reason: ${reason}`);
    
    await transaction.commit();
    
    return await getBookingByIdForAdmin(bookingId);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

// ADMIN: Thống kê booking
const getBookingStats = async ({ startDate, endDate }) => {
  const pool = await poolPromise;
  
  let whereClause = '';
  let parameters = [];
  
  if (startDate && endDate) {
    whereClause = 'WHERE booked_at BETWEEN @startDate AND @endDate';
    parameters.push(
      { name: 'startDate', type: sql.DateTime, value: new Date(startDate) },
      { name: 'endDate', type: sql.DateTime, value: new Date(endDate) }
    );
  }
  
  const request = pool.request();
  parameters.forEach(param => request.input(param.name, param.type, param.value));
  
  const result = await request.query(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
      SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) as paid,
      SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled,
      SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
      SUM(total_price) as totalRevenue
    FROM bookings
    ${whereClause}
  `);
  
  const stats = result.recordset[0];
  
  return {
    total: parseInt(stats.total),
    pending: parseInt(stats.pending),
    paid: parseInt(stats.paid),
    cancelled: parseInt(stats.cancelled),
    completed: parseInt(stats.completed),
    totalRevenue: parseFloat(stats.totalRevenue || 0),
    period: startDate && endDate ? { startDate, endDate } : null
  };
};

// ADMIN: Lấy booking theo user
const getBookingsByUserForAdmin = async (userId, { page, limit }) => {
  const pool = await poolPromise;
  const offset = (page - 1) * limit;
  
  // Count total
  const countResult = await pool.request()
    .input('userId', sql.Int, userId)
    .query('SELECT COUNT(*) as total FROM bookings WHERE user_id = @userId');
  const total = countResult.recordset[0].total;
  
  // Get bookings
  const result = await pool.request()
    .input('userId', sql.Int, userId)
    .input('offset', sql.Int, offset)
    .input('limit', sql.Int, limit)
    .query(`
      SELECT 
        b.id,
        b.total_price,
        b.status,
        b.booked_at,
        b.payment_method,
        s.departure_time,
        s.price as seatPrice,
        bus.license_plate,
        bt.name as busType,
        dp.name as departureProvince,
        ap.name as arrivalProvince
      FROM bookings b
      JOIN schedules s ON b.schedule_id = s.id
      JOIN buses bus ON s.bus_id = bus.id
      JOIN bus_types bt ON bus.bus_type_id = bt.id
      JOIN routes r ON s.route_id = r.id
      JOIN provinces dp ON r.departure_province_id = dp.id
      JOIN provinces ap ON r.arrival_province_id = ap.id
      WHERE b.user_id = @userId
      ORDER BY b.booked_at DESC
      OFFSET @offset ROWS
      FETCH NEXT @limit ROWS ONLY
    `);
  
  const bookings = result.recordset.map(booking => ({
    id: booking.id,
    totalPrice: booking.total_price,
    status: booking.status,
    bookedAt: booking.booked_at,
    paymentMethod: booking.payment_method,
    schedule: {
      departureTime: booking.departure_time,
      seatPrice: booking.seat_price
    },
    bus: {
      licensePlate: booking.license_plate,
      busType: booking.busType
    },
    route: {
      departureProvince: booking.departureProvince,
      arrivalProvince: booking.arrivalProvince
    }
  }));
  
  return {
    bookings,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
};

// ADMIN: Lấy booking theo schedule
const getBookingsByScheduleForAdmin = async (scheduleId, { page, limit }) => {
  const pool = await poolPromise;
  const offset = (page - 1) * limit;
  
  // Count total
  const countResult = await pool.request()
    .input('scheduleId', sql.Int, scheduleId)
    .query('SELECT COUNT(*) as total FROM bookings WHERE schedule_id = @scheduleId');
  const total = countResult.recordset[0].total;
  
  // Get bookings
  const result = await pool.request()
    .input('scheduleId', sql.Int, scheduleId)
    .input('offset', sql.Int, offset)
    .input('limit', sql.Int, limit)
    .query(`
      SELECT 
        b.id,
        b.total_price,
        b.status,
        b.booked_at,
        b.payment_method,
        u.full_name as userName,
        u.email as userEmail,
        u.phone_number as userPhone,
        ps.name as pickupStop,
        ds.name as dropoffStop
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      LEFT JOIN stops ps ON b.pickup_stop_id = ps.id
      LEFT JOIN stops ds ON b.dropoff_stop_id = ds.id
      WHERE b.schedule_id = @scheduleId
      ORDER BY b.booked_at DESC
      OFFSET @offset ROWS
      FETCH NEXT @limit ROWS ONLY
    `);
  
  const bookings = result.recordset.map(booking => ({
    id: booking.id,
    totalPrice: booking.total_price,
    status: booking.status,
    bookedAt: booking.booked_at,
    paymentMethod: booking.payment_method,
    user: {
      name: booking.userName,
      email: booking.userEmail,
      phone: booking.userPhone
    },
    stops: {
      pickup: booking.pickupStop,
      dropoff: booking.dropoffStop
    }
  }));
  
  return {
    bookings,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
};

module.exports = {
  createBooking,
  getUserBookings,
  getBookingById,
  getBookingByOrderCode,
  updateBooking,
  cancelBooking,
  getAllBookingsForAdmin,
  getBookingByIdForAdmin,
  updateBookingStatus,
  cancelBookingByAdmin,
  getBookingStats,
  getBookingsByUserForAdmin,
  getBookingsByScheduleForAdmin
}; 