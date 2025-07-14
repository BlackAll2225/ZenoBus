const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Bus = sequelize.define('Bus', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  licensePlate: {
    type: DataTypes.STRING(20),
    allowNull: false,
    field: 'license_plate'
  },
  seatCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'seat_count'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  busTypeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'bus_type_id'
  }
}, {
  tableName: 'buses',
  timestamps: false
});

const BusType = require('./BusTypeModel');
Bus.belongsTo(BusType, { foreignKey: 'busTypeId', as: 'busType' });

module.exports = Bus; 