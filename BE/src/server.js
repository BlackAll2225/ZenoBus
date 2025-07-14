const express = require("express");
const cors = require('cors');
const app = express();
require("dotenv").config();
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const initDatabase = require('./config/initDb');
const responseMiddleware = require('./middlewares/responseMiddleware');

// Middleware
app.use(cors());
app.use(express.json());
app.use(responseMiddleware);

// Initialize database
initDatabase();

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Putiee API Documentation',
      version: '1.0.0',
      description: 'API documentation for Putiee application',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5000}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        // ... existing schemas ...
        
        // Admin Booking schemas
        AdminBooking: {
          type: 'object',
          properties: {
            id: { type: 'integer', description: 'Booking ID' },
            totalPrice: { type: 'number', description: 'Total price' },
            status: { 
              type: 'string', 
              enum: ['pending', 'paid', 'cancelled', 'completed'],
              description: 'Booking status'
            },
            bookedAt: { type: 'string', format: 'date-time', description: 'Booking date' },
            paymentMethod: { type: 'string', description: 'Payment method' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'integer', description: 'User ID' },
                name: { type: 'string', description: 'User full name' },
                email: { type: 'string', description: 'User email' },
                phone: { type: 'string', description: 'User phone number' }
              }
            },
            schedule: {
              type: 'object',
              properties: {
                id: { type: 'integer', description: 'Schedule ID' },
                departureTime: { type: 'string', format: 'date-time', description: 'Departure time' },
                seatPrice: { type: 'number', description: 'Price per seat' }
              }
            },
            bus: {
              type: 'object',
              properties: {
                licensePlate: { type: 'string', description: 'Bus license plate' },
                busType: { type: 'string', description: 'Bus type name' }
              }
            },
            route: {
              type: 'object',
              properties: {
                departureProvince: { type: 'string', description: 'Departure province' },
                arrivalProvince: { type: 'string', description: 'Arrival province' },
                pickupStop: { type: 'string', description: 'Pickup stop name' },
                dropoffStop: { type: 'string', description: 'Dropoff stop name' }
              }
            }
          }
        },
        AdminBookingDetail: {
          type: 'object',
          properties: {
            id: { type: 'integer', description: 'Booking ID' },
            totalPrice: { type: 'number', description: 'Total price' },
            status: { 
              type: 'string', 
              enum: ['pending', 'paid', 'cancelled', 'completed'],
              description: 'Booking status'
            },
            bookedAt: { type: 'string', format: 'date-time', description: 'Booking date' },
            paymentMethod: { type: 'string', description: 'Payment method' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'integer', description: 'User ID' },
                name: { type: 'string', description: 'User full name' },
                email: { type: 'string', description: 'User email' },
                phone: { type: 'string', description: 'User phone number' }
              }
            },
            schedule: {
              type: 'object',
              properties: {
                id: { type: 'integer', description: 'Schedule ID' },
                departureTime: { type: 'string', format: 'date-time', description: 'Departure time' },
                seatPrice: { type: 'number', description: 'Price per seat' }
              }
            },
            bus: {
              type: 'object',
              properties: {
                licensePlate: { type: 'string', description: 'Bus license plate' },
                busType: { type: 'string', description: 'Bus type name' }
              }
            },
            route: {
              type: 'object',
              properties: {
                departureProvince: { type: 'string', description: 'Departure province' },
                arrivalProvince: { type: 'string', description: 'Arrival province' },
                pickupStop: { type: 'string', description: 'Pickup stop name' },
                dropoffStop: { type: 'string', description: 'Dropoff stop name' }
              }
            },
            seats: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  seatId: { type: 'integer', description: 'Seat ID' },
                  seatNumber: { type: 'string', description: 'Seat number' },
                  floor: { type: 'string', description: 'Floor' },
                  price: { type: 'number', description: 'Seat price' }
                }
              }
            }
          }
        },
        BookingStats: {
          type: 'object',
          properties: {
            total: { type: 'integer', description: 'Total bookings' },
            pending: { type: 'integer', description: 'Pending bookings' },
            paid: { type: 'integer', description: 'Paid bookings' },
            cancelled: { type: 'integer', description: 'Cancelled bookings' },
            completed: { type: 'integer', description: 'Completed bookings' },
            totalRevenue: { type: 'number', description: 'Total revenue' },
            period: {
              type: 'object',
              properties: {
                startDate: { type: 'string', format: 'date', description: 'Start date' },
                endDate: { type: 'string', format: 'date', description: 'End date' }
              }
            }
          }
        },
        
        // Statistics schemas
        DashboardStats: {
          type: 'object',
          properties: {
            bookings: {
              type: 'object',
              properties: {
                total: { type: 'integer', description: 'Tổng số booking' },
                pending: { type: 'integer', description: 'Số booking đang chờ' },
                paid: { type: 'integer', description: 'Số booking đã thanh toán' },
                cancelled: { type: 'integer', description: 'Số booking đã hủy' },
                completed: { type: 'integer', description: 'Số booking hoàn thành' },
                totalRevenue: { type: 'number', description: 'Tổng doanh thu' },
                completedRevenue: { type: 'number', description: 'Doanh thu hoàn thành' }
              }
            },
            schedules: {
              type: 'object',
              properties: {
                total: { type: 'integer', description: 'Tổng số lịch trình' },
                scheduled: { type: 'integer', description: 'Số lịch trình đã lên lịch' },
                completed: { type: 'integer', description: 'Số lịch trình hoàn thành' },
                cancelled: { type: 'integer', description: 'Số lịch trình đã hủy' }
              }
            },
            users: {
              type: 'object',
              properties: {
                total: { type: 'integer', description: 'Tổng số người dùng' }
              }
            },
            routes: {
              type: 'object',
              properties: {
                total: { type: 'integer', description: 'Tổng số tuyến đường' }
              }
            },
            buses: {
              type: 'object',
              properties: {
                total: { type: 'integer', description: 'Tổng số xe bus' }
              }
            }
          }
        },
        PeriodStats: {
          type: 'object',
          properties: {
            totalBookings: { type: 'integer', description: 'Tổng số booking' },
            pendingBookings: { type: 'integer', description: 'Số booking đang chờ' },
            paidBookings: { type: 'integer', description: 'Số booking đã thanh toán' },
            cancelledBookings: { type: 'integer', description: 'Số booking đã hủy' },
            completedBookings: { type: 'integer', description: 'Số booking hoàn thành' },
            totalRevenue: { type: 'number', description: 'Tổng doanh thu' },
            completedRevenue: { type: 'number', description: 'Doanh thu hoàn thành' },
            period: {
              type: 'object',
              properties: {
                startDate: { type: 'string', format: 'date', description: 'Ngày bắt đầu' },
                endDate: { type: 'string', format: 'date', description: 'Ngày kết thúc' }
              }
            }
          }
        },
        TopRoute: {
          type: 'object',
          properties: {
            routeId: { type: 'integer', description: 'ID tuyến đường' },
            departureProvince: { type: 'string', description: 'Tỉnh đi' },
            arrivalProvince: { type: 'string', description: 'Tỉnh đến' },
            bookingCount: { type: 'integer', description: 'Số lượng booking' },
            revenue: { type: 'number', description: 'Doanh thu' }
          }
        },
        MonthlyStats: {
          type: 'object',
          properties: {
            year: { type: 'integer', description: 'Năm' },
            months: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  month: { type: 'integer', description: 'Tháng (1-12)' },
                  monthName: { type: 'string', description: 'Tên tháng' },
                  totalBookings: { type: 'integer', description: 'Tổng số booking' },
                  revenue: { type: 'number', description: 'Doanh thu' }
                }
              }
            }
          }
        },
        WeeklyStats: {
          type: 'object',
          properties: {
            dayOfWeek: { type: 'integer', description: 'Ngày trong tuần (1-7)' },
            dayName: { type: 'string', description: 'Tên ngày' },
            totalBookings: { type: 'integer', description: 'Tổng số booking' },
            revenue: { type: 'number', description: 'Doanh thu' }
          }
        },
        PaymentMethodStats: {
          type: 'object',
          properties: {
            method: { type: 'string', description: 'Phương thức thanh toán' },
            count: { type: 'integer', description: 'Số lượng' },
            totalAmount: { type: 'number', description: 'Tổng số tiền' }
          }
        },
        AllStatistics: {
          type: 'object',
          properties: {
            dashboard: { $ref: '#/components/schemas/DashboardStats' },
            topRoutes: {
              type: 'array',
              items: { $ref: '#/components/schemas/TopRoute' }
            },
            monthly: { $ref: '#/components/schemas/MonthlyStats' },
            weekly: {
              type: 'array',
              items: { $ref: '#/components/schemas/WeeklyStats' }
            },
            paymentMethods: {
              type: 'array',
              items: { $ref: '#/components/schemas/PaymentMethodStats' }
            }
          }
        }
      }
    },
    security: [
      { bearerAuth: [] }
    ],
  },
  apis: ['./src/routes/*.js'], // Path to the API routes
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

const scheduleRoutes = require("./routes/scheduleRoutes");
app.use("/api/schedules", scheduleRoutes);

const routeRoutes = require("./routes/routeRoutes");
app.use("/api/routes", routeRoutes);

const provinceRoutes = require('./routes/provinceRoutes');
app.use('/api/provinces', provinceRoutes);

const adminAuthRoutes = require('./routes/adminAuthRoutes');
app.use('/api/admin', adminAuthRoutes);

const busRoutes = require('./routes/busRoutes');
app.use('/api/buses', busRoutes);

const busTypeRoutes = require('./routes/busTypeRoutes');
app.use('/api/bus-types', busTypeRoutes);

const seatRoutes = require('./routes/seatRoutes');
app.use('/api/seats', seatRoutes);

const bookingRoutes = require('./routes/bookingRoutes');
app.use('/api/bookings', bookingRoutes);

const paymentRoutes = require('./routes/paymentRoutes');
app.use('/api/payments', paymentRoutes);

const stopRoutes = require('./routes/stopRoutes');
app.use('/api/stops', stopRoutes);

const adminBookingRoutes = require('./routes/adminBookingRoutes');
app.use('/api/admin', adminBookingRoutes);

const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

const feedbackRoutes = require('./routes/feedbackRoutes');
app.use('/api/feedbacks', feedbackRoutes);

const cleanupRoutes = require('./routes/cleanupRoutes');
app.use('/api/admin/cleanup', cleanupRoutes);

const schedulePatternRoutes = require('./routes/schedulePatternRoutes');
app.use('/api/schedule-patterns', schedulePatternRoutes);

const scheduleToggleRoutes = require('./routes/scheduleToggleRoutes');
app.use('/api/schedule-management', scheduleToggleRoutes);

const driverRoutes = require('./routes/driverRoutes');
app.use('/api/drivers', driverRoutes);

const statisticsRoutes = require('./routes/statisticsRoutes');
app.use('/api/statistics', statisticsRoutes);

// Cleanup job - chạy mỗi 5 phút
const cleanupService = require('./services/cleanupService');
setInterval(async () => {
  try {
    console.log('🔄 Running cleanup job...');
    const result = await cleanupService.cleanupExpiredPendingBookings();
    if (result.processed > 0) {
      console.log(`✅ Cleanup completed: ${result.processed} bookings cancelled`);
    }
  } catch (error) {
    console.error('❌ Cleanup job error:', error);
  }
}, 5 * 60 * 1000); // 5 phút

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.serverError(err.message);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


