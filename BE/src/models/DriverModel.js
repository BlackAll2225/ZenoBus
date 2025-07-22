const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Driver = sequelize.define('Driver', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  fullName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'full_name'
  },
  phoneNumber: {
    type: DataTypes.STRING(20),
    allowNull: false,
    field: 'phone_number'
  },
  licenseNumber: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'license_number'
  },
  hireDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'hire_date'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'is_active'
  }
}, {
  tableName: 'drivers',
  timestamps: false
});

module.exports = Driver; 