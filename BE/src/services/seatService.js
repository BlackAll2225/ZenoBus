const Seat = require('../models/SeatModel');
const { QueryTypes } = require('sequelize');
const db = require('../config/database');

const getAll = async (scheduleId) => {
  if (scheduleId) {
    return await Seat.findAll({ where: { scheduleId } });
  }
  return await Seat.findAll();
};

const getById = async (id) => {
  return await Seat.findByPk(id);
};

const getAvailableSeats = async (scheduleId) => {
  const query = `
    SELECT 
      s.id,
      s.seat_number as seatNumber,
      s.floor,
      s.schedule_id as scheduleId,
      s.status,
      CASE 
        WHEN bs.id IS NOT NULL THEN 'booked'
        ELSE 'available'
      END as bookingStatus
    FROM seats s
    LEFT JOIN booking_seats bs ON s.id = bs.seat_id
    WHERE s.schedule_id = :scheduleId
    ORDER BY s.floor, s.seat_number
  `;
  
  return await db.query(query, {
    replacements: { scheduleId },
    type: QueryTypes.SELECT
  });
};

const create = async (data) => {
  // Kiểm tra trùng số ghế trong cùng schedule
  const existed = await Seat.findOne({ where: { scheduleId: data.scheduleId, seatNumber: data.seatNumber } });
  if (existed) throw new Error('Số ghế đã tồn tại trong lịch trình này');
  return await Seat.create(data);
};

const update = async (id, data) => {
  const seat = await Seat.findByPk(id);
  if (!seat) return null;
  // Nếu cập nhật số ghế, kiểm tra trùng trong cùng schedule
  if (data.seatNumber && data.seatNumber !== seat.seatNumber) {
    const existed = await Seat.findOne({ where: { scheduleId: seat.scheduleId, seatNumber: data.seatNumber } });
    if (existed) throw new Error('Số ghế đã tồn tại trong lịch trình này');
  }
  await seat.update(data);
  return seat;
};

const remove = async (id) => {
  const seat = await Seat.findByPk(id);
  if (!seat) return null;
  await seat.destroy();
  return true;
};

module.exports = { getAll, getById, create, update, remove, getAvailableSeats }; 