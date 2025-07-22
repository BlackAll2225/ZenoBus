const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SchedulePattern = sequelize.define('SchedulePattern', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  description: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  routeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'route_id'
  },
  busTypeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'bus_type_id'
  },
  departureTimes: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'departure_times'
  },
  daysOfWeek: {
    type: DataTypes.STRING(20),
    allowNull: false,
    field: 'days_of_week'
  },
  basePrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'base_price'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'is_active'
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'created_at'
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'updated_at'
  }
}, {
  tableName: 'schedule_patterns',
  timestamps: false
});

// Import models for associations
const Route = require('./RouteModel');
const BusType = require('./BusTypeModel');
const Province = require('./provinceModel');

// Define associations
SchedulePattern.belongsTo(Route, { foreignKey: 'routeId', as: 'route' });
SchedulePattern.belongsTo(BusType, { foreignKey: 'busTypeId', as: 'busType' });

module.exports = SchedulePattern; 