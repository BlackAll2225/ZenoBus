const { Op } = require('sequelize');
const Route = require('../models/RouteModel');
const Province = require('../models/provinceModel');
const Schedule = require('../models/ScheduleSequelizeModel');
const Bus = require('../models/BusModel');
const BusType = require('../models/BusTypeModel');
const Driver = require('../models/DriverModel');
const SchedulePattern = require('../models/SchedulePatternModel');

const getAllRoutes = async (includeInactive = false) => {
  try {
    const whereCondition = {};
    if (!includeInactive) {
      whereCondition.isActive = true;
    }

    const routes = await Route.findAll({
      where: whereCondition,
      include: [
        {
          model: Province,
          as: 'departureProvince',
          attributes: ['id', 'name', 'code']
        },
        {
          model: Province,
          as: 'arrivalProvince',
          attributes: ['id', 'name', 'code']
        }
      ]
    });
    
    // Chuyển đổi tất cả routes thành plain objects
    return routes.map(route => route.toJSON ? route.toJSON() : route);
  } catch (error) {
    throw new Error(`Error fetching routes: ${error.message}`);
  }
};

const getRouteById = async (id) => {
  try {
    const route = await Route.findByPk(id, {
      include: [
        {
          model: Province,
          as: 'departureProvince',
          attributes: ['id', 'name', 'code']
        },
        {
          model: Province,
          as: 'arrivalProvince',
          attributes: ['id', 'name', 'code']
        }
      ]
    });
    
    if (!route) {
      throw new Error('Route not found');
    }
    
    return route.toJSON ? route.toJSON() : route;
  } catch (error) {
    throw new Error(`Error fetching route: ${error.message}`);
  }
};

const createRoute = async (routeData) => {
  try {
    const { departureProvinceId, arrivalProvinceId, distanceKm, estimatedTime } = routeData;
    
    // Validate that provinces exist
    const departureProvince = await Province.findByPk(departureProvinceId);
    const arrivalProvince = await Province.findByPk(arrivalProvinceId);
    
    if (!departureProvince) {
      throw new Error('Departure province not found');
    }
    
    if (!arrivalProvince) {
      throw new Error('Arrival province not found');
    }
    
    // Check if route already exists
    const existingRoute = await Route.findOne({
      where: {
        departureProvinceId,
        arrivalProvinceId
      }
    });
    
    if (existingRoute) {
      throw new Error('Route already exists between these provinces');
    }
    
    const route = await Route.create({
      departureProvinceId,
      arrivalProvinceId,
      distanceKm,
      estimatedTime,
      isActive: true
    });
    
    const newRoute = await getRouteById(route.id);
    return newRoute.toJSON ? newRoute.toJSON() : newRoute;
  } catch (error) {
    throw new Error(`Error creating route: ${error.message}`);
  }
};

const updateRoute = async (id, routeData) => {
  try {
    const route = await Route.findByPk(id);
    
    if (!route) {
      throw new Error('Route not found');
    }
    
    const { departureProvinceId, arrivalProvinceId, distanceKm, estimatedTime } = routeData;
    
    // Validate that provinces exist if they are being updated
    if (departureProvinceId) {
      const departureProvince = await Province.findByPk(departureProvinceId);
      if (!departureProvince) {
        throw new Error('Departure province not found');
      }
    }
    
    if (arrivalProvinceId) {
      const arrivalProvince = await Province.findByPk(arrivalProvinceId);
      if (!arrivalProvince) {
        throw new Error('Arrival province not found');
      }
    }
    
    // Check if route already exists (excluding current route)
    if (departureProvinceId && arrivalProvinceId) {
      const existingRoute = await Route.findOne({
        where: {
          departureProvinceId,
          arrivalProvinceId,
          id: { [Op.ne]: id }
        }
      });
      
      if (existingRoute) {
        throw new Error('Route already exists between these provinces');
      }
    }
    
    await route.update({
      departureProvinceId: departureProvinceId || route.departureProvinceId,
      arrivalProvinceId: arrivalProvinceId || route.arrivalProvinceId,
      distanceKm: distanceKm !== undefined ? distanceKm : route.distanceKm,
      estimatedTime: estimatedTime !== undefined ? estimatedTime : route.estimatedTime,
      isActive: routeData.isActive !== undefined ? routeData.isActive : route.isActive
    });
    
    const updatedRoute = await getRouteById(id);
    return updatedRoute.toJSON ? updatedRoute.toJSON() : updatedRoute;
  } catch (error) {
    throw new Error(`Error updating route: ${error.message}`);
  }
};

const toggleRouteStatus = async (id) => {
  try {
    const route = await Route.findByPk(id);
    
    if (!route) {
      throw new Error('Route not found');
    }
    
    const newStatus = !route.isActive;
    let affectedPatternsCount = 0;
    
    // Cập nhật trạng thái route
    route.isActive = newStatus;
    await route.save();
    
    // Nếu disable route, thì cũng disable tất cả schedule patterns liên quan
    if (!newStatus) {
      const updateResult = await SchedulePattern.update(
        { isActive: false },
        { 
          where: { 
            routeId: id,
            isActive: true // Chỉ update những pattern đang active
          } 
        }
      );
      affectedPatternsCount = updateResult[0]; // Số lượng records đã được update
    }
    // Nếu enable route, không tự động enable lại schedule patterns
    // Admin sẽ phải tự quyết định enable pattern nào
    
    const updatedRoute = await getRouteById(id);
    
    // Chuyển đổi Sequelize instance thành plain object để tránh circular references
    const plainRoute = updatedRoute.toJSON ? updatedRoute.toJSON() : updatedRoute;
    
    // Trả về thông tin bổ sung về số lượng patterns bị ảnh hưởng
    return {
      ...plainRoute,
      affectedPatternsCount,
      statusChanged: newStatus ? 'enabled' : 'disabled'
    };
  } catch (error) {
    throw new Error(`Error toggling route status: ${error.message}`);
  }
};


const deleteRoute = async (id) => {
  try {
    const route = await Route.findByPk(id);
    
    if (!route) {
      throw new Error('Route not found');
    }
    
    await route.destroy();
    return { message: 'Route deleted successfully' };
  } catch (error) {
    throw new Error(`Error deleting route: ${error.message}`);
  }
};

const getRoutesByProvince = async (provinceId) => {
  try {
    const routes = await Route.findAll({
      where: {
        [Op.or]: [
          { departureProvinceId: provinceId },
          { arrivalProvinceId: provinceId }
        ]
      },
      include: [
        {
          model: Province,
          as: 'departureProvince',
          attributes: ['id', 'name', 'code']
        },
        {
          model: Province,
          as: 'arrivalProvince',
          attributes: ['id', 'name', 'code']
        }
      ]
    });
    
    return routes.map(route => route.toJSON ? route.toJSON() : route);
  } catch (error) {
    throw new Error(`Error fetching routes by province: ${error.message}`);
  }
};

const getAvailableDestinations = async (provinceId) => {
  try {
    // Kiểm tra province có tồn tại không
    const province = await Province.findByPk(provinceId);
    if (!province) {
      throw new Error('Province not found');
    }

    // Tìm tất cả routes có province này là điểm khởi hành
    const routes = await Route.findAll({
      where: {
        departureProvinceId: provinceId
      },
      include: [
        {
          model: Province,
          as: 'arrivalProvince',
          attributes: ['id', 'name', 'code']
        }
      ]
    });

    // Trích xuất danh sách province đích (loại bỏ trùng lặp)
    const destinations = routes.map(route => route.arrivalProvince);
    
    // Loại bỏ trùng lặp dựa trên province ID
    const uniqueDestinations = destinations.filter((destination, index, self) => 
      index === self.findIndex(d => d.id === destination.id)
    );

    return {
      departureProvince: {
        id: province.id,
        name: province.name,
        code: province.code
      },
      destinations: uniqueDestinations
    };
  } catch (error) {
    throw new Error(`Error fetching available destinations: ${error.message}`);
  }
};

const searchTrips = async (departureProvinceId, arrivalProvinceId, departureDate) => {
  try {
    // Kiểm tra provinces có tồn tại không
    const departureProvince = await Province.findByPk(departureProvinceId);
    const arrivalProvince = await Province.findByPk(arrivalProvinceId);
    
    if (!departureProvince) {
      throw new Error('Departure province not found');
    }
    if (!arrivalProvince) {
      throw new Error('Arrival province not found');
    }

    // Tìm route giữa 2 provinces
    const route = await Route.findOne({
      where: {
        departureProvinceId: departureProvinceId,
        arrivalProvinceId: arrivalProvinceId
      },
      include: [
        {
          model: Province,
          as: 'departureProvince',
          attributes: ['id', 'name', 'code']
        },
        {
          model: Province,
          as: 'arrivalProvince',
          attributes: ['id', 'name', 'code']
        }
      ]
    });

    if (!route) {
      throw new Error('No route found between these provinces');
    }

    // Convert VN date to UTC date range for accurate filtering
    // User picks VN date (2025-01-15) but schedules are stored in UTC
    // Need to find all trips that occur during that VN day
    
    // Start of VN day: 2025-01-15 00:00:00 VN = 2025-01-14 17:00:00 UTC
    const vnStartOfDay = new Date(departureDate + 'T00:00:00');
    const utcStartOfDay = new Date(vnStartOfDay.getTime() - (7 * 60 * 60 * 1000));
    
    // End of VN day: 2025-01-15 23:59:59 VN = 2025-01-15 16:59:59 UTC  
    const vnEndOfDay = new Date(departureDate + 'T23:59:59');
    const utcEndOfDay = new Date(vnEndOfDay.getTime() - (7 * 60 * 60 * 1000));

    console.log('Search trips timezone conversion:');
    console.log('- Input VN date:', departureDate);
    console.log('- VN start of day:', vnStartOfDay.toISOString());
    console.log('- UTC start of day:', utcStartOfDay.toISOString());
    console.log('- VN end of day:', vnEndOfDay.toISOString());
    console.log('- UTC end of day:', utcEndOfDay.toISOString());

    // Tìm tất cả schedules cho route này trong UTC range
    const { sql, poolPromise } = require('../config/db');
    const pool = await poolPromise;
    
    const result = await pool.request()
      .input('routeId', sql.Int, route.id)
      .input('startTime', sql.DateTime, utcStartOfDay)
      .input('endTime', sql.DateTime, utcEndOfDay)
      .input('currentTime', sql.DateTime, new Date())
      .query(`
        SELECT 
          s.id as scheduleId,
          s.departure_time as departureTime,
          s.price,
          s.status,
          b.id as busId,
          b.license_plate as licensePlate,
          b.seat_count as seatCount,
          b.description as busDescription,
          bt.id as busTypeId,
          bt.name as busTypeName,
          bt.description as busTypeDescription,
          d.id as driverId,
          d.full_name as driverFullName,
          d.phone_number as driverPhoneNumber,
          d.license_number as driverLicenseNumber
        FROM schedules s
        JOIN buses b ON s.bus_id = b.id
        JOIN bus_types bt ON b.bus_type_id = bt.id
        JOIN drivers d ON s.driver_id = d.id
        WHERE s.route_id = @routeId 
          AND s.departure_time >= @startTime
          AND s.departure_time <= @endTime
          AND s.status = 'scheduled'
          AND s.departure_time > @currentTime
        ORDER BY s.departure_time ASC
      `);

    const schedules = result.recordset;

    // Format response
    const trips = schedules.map(schedule => ({
      scheduleId: schedule.scheduleId,
      departureTime: schedule.departureTime,
      price: schedule.price,
      status: schedule.status,
      route: {
        id: route.id,
        distanceKm: route.distanceKm,
        estimatedTime: route.estimatedTime,
        departureProvince: route.departureProvince,
        arrivalProvince: route.arrivalProvince
      },
      bus: {
        id: schedule.busId,
        licensePlate: schedule.licensePlate,
        seatCount: schedule.seatCount,
        description: schedule.busDescription,
        busType: {
          id: schedule.busTypeId,
          name: schedule.busTypeName,
          description: schedule.busTypeDescription
        }
      },
      driver: {
        id: schedule.driverId,
        fullName: schedule.driverFullName,
        phoneNumber: schedule.driverPhoneNumber,
        licenseNumber: schedule.driverLicenseNumber
      }
    }));

    return {
      searchCriteria: {
        departureProvince: route.departureProvince,
        arrivalProvince: route.arrivalProvince,
        departureDate: departureDate
      },
      totalTrips: trips.length,
      trips: trips
    };
  } catch (error) {
    throw new Error(`Error searching trips: ${error.message}`);
  }
};

const getAvailableSeats = async (scheduleId) => {
  try {
    // Kiểm tra schedule có tồn tại không
    const { sql, poolPromise } = require('../config/db');
    const pool = await poolPromise;
    
    const scheduleResult = await pool.request()
      .input('scheduleId', sql.Int, scheduleId)
      .query(`
        SELECT 
          s.id,
          s.departure_time,
          s.price,
          s.status,
          b.id as busId,
          b.license_plate,
          b.seat_count,
          b.description as busDescription,
          bt.name as busTypeName,
          r.id as routeId,
          r.distance_km,
          r.estimated_time,
          r.departure_province_id as departureProvinceId,
          r.arrival_province_id as arrivalProvinceId,
          dp.name as departureProvinceName,
          ap.name as arrivalProvinceName
        FROM schedules s
        JOIN buses b ON s.bus_id = b.id
        JOIN bus_types bt ON b.bus_type_id = bt.id
        JOIN routes r ON s.route_id = r.id
        JOIN provinces dp ON r.departure_province_id = dp.id
        JOIN provinces ap ON r.arrival_province_id = ap.id
        WHERE s.id = @scheduleId
      `);

    if (scheduleResult.recordset.length === 0) {
      throw new Error('Schedule not found');
    }

    const schedule = scheduleResult.recordset[0];

    // Lấy tất cả ghế của schedule này với trạng thái chi tiết
    const seatsResult = await pool.request()
      .input('scheduleId', sql.Int, scheduleId)
      .query(`
        SELECT 
          s.id,
          s.seat_number as seatNumber,
          s.status,
          s.floor,
          CASE 
            WHEN bs.id IS NOT NULL AND b.status = 'paid' THEN 'booked'
            WHEN bs.id IS NOT NULL AND b.status = 'pending' THEN 'pending'
            WHEN s.status = 'blocked' THEN 'blocked'
            ELSE 'available'
          END as currentStatus,
          CASE 
            WHEN bs.id IS NOT NULL AND b.status = 'pending' THEN b.booked_at
            ELSE NULL
          END as pendingSince,
          CASE 
            WHEN bs.id IS NOT NULL AND b.status = 'pending' THEN 
              DATEDIFF(SECOND, b.booked_at, GETDATE())
            ELSE NULL
          END as pendingSeconds
        FROM seats s
        LEFT JOIN booking_seats bs ON s.id = bs.seat_id
        LEFT JOIN bookings b ON bs.booking_id = b.id
        WHERE s.schedule_id = @scheduleId
        ORDER BY 
          CASE 
            WHEN s.floor = 'Tầng 2' OR s.floor = 'upper' THEN 1
            WHEN s.floor = 'Tầng 1' OR s.floor = 'lower' THEN 2
            ELSE 3
          END,
          CAST(s.seat_number AS INT)
      `);

    const seats = seatsResult.recordset;

    // Phân loại ghế theo trạng thái
    const availableSeats = seats.filter(seat => seat.currentStatus === 'available');
    const bookedSeats = seats.filter(seat => seat.currentStatus === 'booked');
    const pendingSeats = seats.filter(seat => seat.currentStatus === 'pending');
    const blockedSeats = seats.filter(seat => seat.currentStatus === 'blocked');

    // Nhóm ghế theo tầng với thông tin status chi tiết
    const seatsByFloor = {
      upper: seats.filter(seat => seat.floor === 'Tầng 2' || seat.floor === 'upper').map(seat => ({
        id: seat.id,
        seatNumber: seat.seatNumber,
        status: seat.currentStatus,
        floor: seat.floor || 'main',
        pendingSince: seat.pendingSince,
        pendingSeconds: seat.pendingSeconds
      })),
      lower: seats.filter(seat => seat.floor === 'Tầng 1' || seat.floor === 'lower').map(seat => ({
        id: seat.id,
        seatNumber: seat.seatNumber,
        status: seat.currentStatus,
        floor: seat.floor || 'main',
        pendingSince: seat.pendingSince,
        pendingSeconds: seat.pendingSeconds
      })),
      main: seats.filter(seat => !seat.floor || seat.floor === 'main' || seat.floor === 'Tầng 1').map(seat => ({
        id: seat.id,
        seatNumber: seat.seatNumber,
        status: seat.currentStatus,
        floor: seat.floor || 'main',
        pendingSince: seat.pendingSince,
        pendingSeconds: seat.pendingSeconds
      }))
    };

    return {
      schedule: {
        id: schedule.id,
        departureTime: schedule.departure_time,
        price: schedule.price,
        status: schedule.status,
        bus: {
          id: schedule.busId,
          licensePlate: schedule.license_plate,
          seatCount: schedule.seat_count,
          description: schedule.busDescription,
          busType: schedule.busTypeName
        },
        route: {
          id: schedule.routeId,
          departureProvinceId: schedule.departureProvinceId,
          arrivalProvinceId: schedule.arrivalProvinceId,
          distanceKm: schedule.distance_km,
          estimatedTime: schedule.estimated_time,
          departureProvince: schedule.departureProvinceName,
          arrivalProvince: schedule.arrivalProvinceName
        }
      },
      seats: {
        total: seats.length,
        available: availableSeats.length,
        booked: bookedSeats.length,
        pending: pendingSeats.length,
        blocked: blockedSeats.length,
        byFloor: seatsByFloor,
        allSeats: seats.map(seat => ({
          id: seat.id,
          seatNumber: seat.seatNumber,
          status: seat.currentStatus,
          floor: seat.floor || 'main',
          pendingSince: seat.pendingSince,
          pendingSeconds: seat.pendingSeconds
        }))
      }
    };
  } catch (error) {
    throw new Error(`Error fetching available seats: ${error.message}`);
  }
};

module.exports = {
  getAllRoutes,
  getRouteById,
  createRoute,
  updateRoute,
  deleteRoute,
  toggleRouteStatus,
  getRoutesByProvince,
  searchTrips,
  getAvailableDestinations,
  getAvailableSeats
}; 