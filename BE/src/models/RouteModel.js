const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Province = require('./provinceModel');

const Route = sequelize.define('Route', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  departureProvinceId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'departure_province_id',
    references: {
      model: 'provinces',
      key: 'id'
    }
  },
  arrivalProvinceId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'arrival_province_id',
    references: {
      model: 'provinces',
      key: 'id'
    }
  },
  distanceKm: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'distance_km'
  },
  estimatedTime: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'estimated_time'
  },
  isActive: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: true,
    field: 'is_active'
  }
}, {
  tableName: 'routes',
  timestamps: false
});

// Define associations
Route.belongsTo(Province, { as: 'departureProvince', foreignKey: 'departureProvinceId' });
Route.belongsTo(Province, { as: 'arrivalProvince', foreignKey: 'arrivalProvinceId' });

module.exports = Route;
