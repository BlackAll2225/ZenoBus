const axios = require('axios');

// Cấu hình
const API_BASE = 'http://localhost:5000/api';

// Tạo user test
async function createTestUser() {
  try {
    console.log('📝 Creating test user...');
    
    const userData = {
      fullName: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      phoneNumber: '0123456789',
      address: 'Test Address'
    };

    const response = await axios.post(`${API_BASE}/auth/register`, userData);
    console.log('✅ Test user created:', response.data.data);
    
    return userData;
  } catch (error) {
    if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
      console.log('✅ Test user already exists');
      return {
        email: 'test@example.com',
        password: 'password123'
      };
    } else {
      console.error('❌ Error creating test user:', error.response?.data || error.message);
      return null;
    }
  }
}

// Login và tạo booking
async function createTestBooking() {
  try {
    console.log('📝 Creating test booking...');
    
    // Login
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.data.token;
    console.log('✅ Logged in, token received');

    // Tạo booking
    const bookingResponse = await axios.post(`${API_BASE}/bookings`, {
      scheduleId: 1,
      seatIds: [1, 2],
      pickupStopId: 1,
      dropoffStopId: 2,
      totalAmount: 2000
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const booking = bookingResponse.data.data;
    console.log('✅ Booking created:', { 
      id: booking.id, 
      orderCode: booking.orderCode,
      status: booking.status 
    });
    
    return { booking, token };
  } catch (error) {
    console.error('❌ Error creating booking:', error.response?.data || error.message);
    return null;
  }
}

// Test callback với booking thật
async function testCallbackWithRealBooking() {
  console.log('='.repeat(50));
  console.log('🧪 TESTING CALLBACK WITH REAL BOOKING');
  console.log('='.repeat(50));

  // Tạo user và booking
  const user = await createTestUser();
  if (!user) {
    console.log('❌ Cannot create user');
    return;
  }

  const result = await createTestBooking();
  if (!result) {
    console.log('❌ Cannot create booking');
    return;
  }

  const { booking, token } = result;
  console.log('📋 Real booking data:', {
    id: booking.id,
    orderCode: booking.orderCode,
    status: booking.status
  });

  // Test success callback với booking thật
  console.log('\n🔄 Testing success callback with real booking...');
  try {
    const callbackResponse = await axios.get(`${API_BASE}/payments/callback/success`, {
      params: {
        orderCode: booking.orderCode,
        status: 'PAID'
      },
      maxRedirects: 0,
      validateStatus: function (status) {
        return status >= 200 && status < 400;
      }
    });
  } catch (error) {
    if (error.response?.status === 302) {
      console.log('✅ Success callback redirect:', error.response.headers.location);
    } else {
      console.log('❌ Success callback failed:', error.response?.status);
    }
  }

  // Kiểm tra booking status sau callback
  console.log('\n🔍 Checking booking status after callback...');
  try {
    const bookingCheckResponse = await axios.get(`${API_BASE}/bookings/${booking.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const updatedBooking = bookingCheckResponse.data.data;
    console.log('📊 Booking status after callback:', {
      id: updatedBooking.id,
      status: updatedBooking.status,
      paymentStatus: updatedBooking.paymentStatus,
      paymentCompletedAt: updatedBooking.paymentCompletedAt
    });
  } catch (error) {
    console.error('❌ Error checking booking status:', error.response?.data);
  }
}

testCallbackWithRealBooking().catch(console.error); 