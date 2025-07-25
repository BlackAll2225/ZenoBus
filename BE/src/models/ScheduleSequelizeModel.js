const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Schedule = sequelize.define('Schedule', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  busId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'bus_id'
  },
  routeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'route_id'
  },
  driverId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'driver_id'
  },
  departureTime: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'departure_time'
  },
  actualDepartureTime: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'actual_departure_time'
  },
  actualArrivalTime: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'actual_arrival_time'
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('scheduled', 'completed', 'cancelled', 'delayed'),
    allowNull: false,
    defaultValue: 'scheduled'
  },
  isAutoGenerated: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'is_auto_generated'
  },
  patternId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'pattern_id'
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'created_at'
  }
}, {
  tableName: 'schedules',
  timestamps: false
});

// Import models for associations
const Bus = require('./BusModel');
const Route = require('./RouteModel');
const Driver = require('./DriverModel');
const SchedulePattern = require('./SchedulePatternModel');

// Define associations
Schedule.belongsTo(Bus, { foreignKey: 'busId', as: 'bus' });
Schedule.belongsTo(Route, { foreignKey: 'routeId', as: 'route' });
Schedule.belongsTo(Driver, { foreignKey: 'driverId', as: 'driver' });
Schedule.belongsTo(SchedulePattern, { foreignKey: 'patternId', as: 'pattern' });

module.exports = Schedule; 