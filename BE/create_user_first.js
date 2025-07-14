const axios = require('axios');

// Cấu hình
const API_BASE = 'http://localhost:5000/api';

// Tạo user và test login
async function createUserAndTest() {
  console.log('='.repeat(50));
  console.log('🧪 CREATING USER AND TESTING LOGIN');
  console.log('='.repeat(50));

  try {
    // 1. Tạo user
    console.log('📝 Creating test user...');
    const userData = {
      fullName: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      phoneNumber: '0123456789',
      address: 'Test Address'
    };

    const registerResponse = await axios.post(`${API_BASE}/auth/register`, userData);
    console.log('✅ User created:', {
      id: registerResponse.data.data.id,
      email: registerResponse.data.data.email,
      fullName: registerResponse.data.data.fullName
    });

    // 2. Test login
    console.log('\n📝 Testing login...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    });
    
    console.log('✅ Login successful:', {
      userId: loginResponse.data.data.user.id,
      token: loginResponse.data.data.token.substring(0, 20) + '...'
    });

    const token = loginResponse.data.data.token;

    // 3. Tạo booking
    console.log('\n📝 Creating booking...');
            const bookingResponse = await axios.post(`${API_BASE}/bookings`, {
          scheduleId: 1,
          seatIds: [1, 2],
          pickupStopId: 1,
          dropoffStopId: 2,
          totalAmount: 2000,
          paymentMethod: 'payos'
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

    const booking = bookingResponse.data.data;
    console.log('✅ Booking created:', {
      id: booking.id,
      orderCode: booking.orderCode,
      status: booking.status
    });

    // 4. Test callback
    console.log('\n🔄 Testing callback...');
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

    // 5. Kiểm tra booking status
    console.log('\n🔍 Checking booking status...');
    const bookingCheckResponse = await axios.get(`${API_BASE}/bookings/${booking.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const updatedBooking = bookingCheckResponse.data.data;
    console.log('📊 Final booking status:', {
      id: updatedBooking.id,
      status: updatedBooking.status,
      paymentStatus: updatedBooking.paymentStatus,
      paymentCompletedAt: updatedBooking.paymentCompletedAt
    });

  } catch (error) {
    if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
      console.log('✅ User already exists, trying login...');
      
      // Thử login với user đã tồn tại
      try {
        const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
          email: 'test@example.com',
          password: 'password123'
        });
        
        console.log('✅ Login successful with existing user');
        
        // Tiếp tục với booking và callback test...
        const token = loginResponse.data.data.token;
        
        console.log('\n📝 Creating booking...');
        const bookingResponse = await axios.post(`${API_BASE}/bookings`, {
          scheduleId: 1,
          seatIds: [1, 2],
          pickupStopId: 1,
          dropoffStopId: 2,
          totalAmount: 2000,
          paymentMethod: 'payos'
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const booking = bookingResponse.data.data;
        console.log('✅ Booking created:', {
          id: booking.id,
          orderCode: booking.orderCode,
          status: booking.status
        });

        // Test callback
        console.log('\n🔄 Testing callback...');
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

        // Kiểm tra booking status
        console.log('\n🔍 Checking booking status...');
        const bookingCheckResponse = await axios.get(`${API_BASE}/bookings/${booking.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const updatedBooking = bookingCheckResponse.data.data;
        console.log('📊 Final booking status:', {
          id: updatedBooking.id,
          status: updatedBooking.status,
          paymentStatus: updatedBooking.paymentStatus,
          paymentCompletedAt: updatedBooking.paymentCompletedAt
        });

      } catch (loginError) {
        console.error('❌ Login failed:', {
          status: loginError.response?.status,
          message: loginError.response?.data?.message
        });
      }
    } else {
      console.error('❌ Error:', {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        data: error.response?.data
      });
    }
  }
}

createUserAndTest().catch(console.error); 