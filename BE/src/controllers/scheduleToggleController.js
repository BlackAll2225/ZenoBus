const scheduleToggleService = require('../services/scheduleToggleService');
const { responseHandler } = require('../utils/responseHandler');

const scheduleToggleController = {
  // Bật/tắt lịch trình
  async toggleSchedule(req, res) {
    try {
      const { scheduleId, isEnabled, isSeatEnabled, adminNote } = req.body;
      const adminId = req.user.id;

      // Validation
      if (!scheduleId || isEnabled === undefined) {
        return responseHandler.badRequest(res, 'Thiếu thông tin bắt buộc: scheduleId, isEnabled');
      }

      const result = await scheduleToggleService.toggleSchedule({
        scheduleId,
        isEnabled,
        isSeatEnabled,
        adminNote,
        adminId
      });

      if (!result) {
        return responseHandler.notFound(res, 'Không tìm thấy lịch trình');
      }

      responseHandler.success(res, result, 'Cập nhật trạng thái lịch trình thành công');
    } catch (error) {
      console.error('Error in toggleSchedule:', error);
      responseHandler.error(res, error.message || 'Có lỗi xảy ra khi cập nhật trạng thái lịch trình');
    }
  },

  // Bật/tắt ghế
  async toggleSeats(req, res) {
    try {
      const { scheduleId, seatIds, isEnabled, adminNote } = req.body;
      const adminId = req.user.id;

      // Validation
      if (!scheduleId || !seatIds || !Array.isArray(seatIds) || isEnabled === undefined) {
        return responseHandler.badRequest(res, 'Thiếu thông tin bắt buộc: scheduleId, seatIds (array), isEnabled');
      }

      const result = await scheduleToggleService.toggleSeats({
        scheduleId,
        seatIds,
        isEnabled,
        adminNote,
        adminId
      });

      if (result.updated === 0) {
        return responseHandler.notFound(res, 'Không tìm thấy ghế để cập nhật');
      }

      responseHandler.success(res, result, 'Cập nhật trạng thái ghế thành công');
    } catch (error) {
      console.error('Error in toggleSeats:', error);
      responseHandler.error(res, error.message || 'Có lỗi xảy ra khi cập nhật trạng thái ghế');
    }
  },

  // Lấy thông tin quản lý lịch trình
  async getScheduleManagement(req, res) {
    try {
      const scheduleId = parseInt(req.params.scheduleId);
      if (!scheduleId) {
        return responseHandler.badRequest(res, 'ID lịch trình không hợp lệ');
      }

      const result = await scheduleToggleService.getScheduleManagement(scheduleId);
      if (!result) {
        return responseHandler.notFound(res, 'Không tìm thấy thông tin quản lý lịch trình');
      }

      responseHandler.success(res, result, 'Lấy thông tin quản lý lịch trình thành công');
    } catch (error) {
      console.error('Error in getScheduleManagement:', error);
      responseHandler.error(res, error.message || 'Có lỗi xảy ra khi lấy thông tin quản lý lịch trình');
    }
  },

  // Lấy danh sách ghế với trạng thái
  async getScheduleSeats(req, res) {
    try {
      const scheduleId = parseInt(req.params.scheduleId);
      if (!scheduleId) {
        return responseHandler.badRequest(res, 'ID lịch trình không hợp lệ');
      }

      const result = await scheduleToggleService.getScheduleSeats(scheduleId);
      if (!result) {
        return responseHandler.notFound(res, 'Không tìm thấy lịch trình');
      }

      responseHandler.success(res, result, 'Lấy danh sách ghế thành công');
    } catch (error) {
      console.error('Error in getScheduleSeats:', error);
      responseHandler.error(res, error.message || 'Có lỗi xảy ra khi lấy danh sách ghế');
    }
  },

  // Bật/tắt nhiều lịch trình
  async bulkToggleSchedules(req, res) {
    try {
      const { scheduleIds, isEnabled, isSeatEnabled, adminNote } = req.body;
      const adminId = req.user.id;

      // Validation
      if (!scheduleIds || !Array.isArray(scheduleIds) || scheduleIds.length === 0 || isEnabled === undefined) {
        return responseHandler.badRequest(res, 'Thiếu thông tin bắt buộc: scheduleIds (array), isEnabled');
      }

      const result = await scheduleToggleService.bulkToggleSchedules({
        scheduleIds,
        isEnabled,
        isSeatEnabled,
        adminNote,
        adminId
      });

      if (result.updated === 0) {
        return responseHandler.notFound(res, 'Không tìm thấy lịch trình để cập nhật');
      }

      responseHandler.success(res, result, 'Cập nhật trạng thái nhiều lịch trình thành công');
    } catch (error) {
      console.error('Error in bulkToggleSchedules:', error);
      responseHandler.error(res, error.message || 'Có lỗi xảy ra khi cập nhật trạng thái nhiều lịch trình');
    }
  }
};

module.exports = scheduleToggleController; 