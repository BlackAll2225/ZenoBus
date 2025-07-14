const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Stop = sequelize.define('Stop', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  provinceId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'province_id'
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  address: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  type: {
    type: DataTypes.STRING(10),
    allowNull: false,
    validate: {
      isIn: [['pickup', 'dropoff']]
    }
  }
}, {
  tableName: 'stops',
  timestamps: false
});

module.exports = Stop; 