const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BusType = sequelize.define('BusType', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  description: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'bus_types',
  timestamps: false
});

module.exports = BusType; 