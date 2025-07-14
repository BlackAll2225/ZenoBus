const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Seat = sequelize.define('Seat', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  scheduleId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'schedule_id'
  },
  seatNumber: {
    type: DataTypes.STRING(10),
    allowNull: false,
    field: 'seat_number'
  },
  floor: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'available'
  }
}, {
  tableName: 'seats',
  timestamps: false
});

module.exports = Seat; 