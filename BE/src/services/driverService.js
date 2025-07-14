const Driver = require('../models/DriverModel');
const { Op } = require('sequelize');

class DriverService {
  /**
   * Lấy tất cả tài xế
   * @param {Object} filters - Bộ lọc
   * @returns {Promise<Array>} Danh sách tài xế
   */
  async getAllDrivers(filters = {}) {
    try {
      const whereClause = {};
      
      // Lọc theo trạng thái active
      if (filters.isActive !== undefined) {
        whereClause.isActive = filters.isActive;
      }
      
      // Tìm kiếm theo tên
      if (filters.search) {
        whereClause.fullName = {
          [Op.like]: `%${filters.search}%`
        };
      }

      const drivers = await Driver.findAll({
        where: whereClause,
        order: [['fullName', 'ASC']]
      });

      return drivers;
    } catch (error) {
      throw new Error(`Error getting drivers: ${error.message}`);
    }
  }

  /**
   * Lấy tài xế theo ID
   * @param {number} id - ID tài xế
   * @returns {Promise<Object>} Thông tin tài xế
   */
  async getDriverById(id) {
    try {
      const driver = await Driver.findByPk(id);
      if (!driver) {
        throw new Error('Driver not found');
      }
      return driver;
    } catch (error) {
      throw new Error(`Error getting driver: ${error.message}`);
    }
  }

  /**
   * Tạo tài xế mới
   * @param {Object} driverData - Dữ liệu tài xế
   * @returns {Promise<Object>} Tài xế đã tạo
   */
  async createDriver(driverData) {
    try {
      const driver = await Driver.create(driverData);
      return driver;
    } catch (error) {
      throw new Error(`Error creating driver: ${error.message}`);
    }
  }

  /**
   * Cập nhật tài xế
   * @param {number} id - ID tài xế
   * @param {Object} updateData - Dữ liệu cập nhật
   * @returns {Promise<Object>} Tài xế đã cập nhật
   */
  async updateDriver(id, updateData) {
    try {
      const driver = await Driver.findByPk(id);
      if (!driver) {
        throw new Error('Driver not found');
      }
      
      await driver.update(updateData);
      return driver;
    } catch (error) {
      throw new Error(`Error updating driver: ${error.message}`);
    }
  }

  /**
   * Xóa tài xế (soft delete)
   * @param {number} id - ID tài xế
   * @returns {Promise<boolean>} Kết quả xóa
   */
  async deleteDriver(id) {
    try {
      const driver = await Driver.findByPk(id);
      if (!driver) {
        throw new Error('Driver not found');
      }
      
      await driver.update({ isActive: false });
      return true;
    } catch (error) {
      throw new Error(`Error deleting driver: ${error.message}`);
    }
  }

  /**
   * Lấy danh sách tài xế active cho dropdown
   * @returns {Promise<Array>} Danh sách tài xế active
   */
  async getActiveDrivers() {
    try {
      const drivers = await Driver.findAll({
        where: { isActive: true },
        attributes: ['id', 'fullName', 'phoneNumber', 'licenseNumber'],
        order: [['fullName', 'ASC']]
      });
      return drivers;
    } catch (error) {
      throw new Error(`Error getting active drivers: ${error.message}`);
    }
  }
}

module.exports = new DriverService(); 