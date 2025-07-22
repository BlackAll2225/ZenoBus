const schedulePatternService = require('../services/schedulePatternService');

const getAll = async (req, res) => {
  try {
    const { routeId, busTypeId, isActive } = req.query;
    const filters = {};
    
    if (routeId) filters.routeId = parseInt(routeId);
    if (busTypeId) filters.busTypeId = parseInt(busTypeId);
    if (isActive !== undefined) filters.isActive = isActive === 'true';
    
    const patterns = await schedulePatternService.getAll(filters);
    return res.success(patterns, 'Lấy danh sách mẫu lịch trình thành công');
  } catch (error) {
    return res.serverError(error.message);
  }
};

const getById = async (req, res) => {
  try {
    const pattern = await schedulePatternService.getById(req.params.id);
    if (!pattern) {
      return res.notFound('Không tìm thấy mẫu lịch trình');
    }
    return res.success(pattern, 'Lấy thông tin mẫu lịch trình thành công');
  } catch (error) {
    return res.serverError(error.message);
  }
};

const create = async (req, res) => {
  try {
    const { 
      name, 
      description, 
      routeId, 
      busTypeId, 
      departureTimes, 
      daysOfWeek, 
      basePrice, 
      isActive = true 
    } = req.body;

    // Validate required fields
    if (!name || !routeId || !busTypeId || !departureTimes || !daysOfWeek || !basePrice) {
      return res.validationError('Thiếu thông tin bắt buộc', [
        'name', 'routeId', 'busTypeId', 'departureTimes', 'daysOfWeek', 'basePrice'
      ]);
    }

    // Validate departureTimes format (JSON array)
    try {
      const times = JSON.parse(departureTimes);
      if (!Array.isArray(times) || times.length === 0) {
        return res.validationError('departureTimes phải là JSON array không rỗng');
      }
    } catch (error) {
      return res.validationError('departureTimes phải là JSON array hợp lệ');
    }

    // Validate daysOfWeek format
    const days = daysOfWeek.split(',').map(d => d.trim());
    const validDays = ['1', '2', '3', '4', '5', '6', '7'];
    if (!days.every(day => validDays.includes(day))) {
      return res.validationError('daysOfWeek phải chứa các số từ 1-7 (1=Thứ 2, 7=Chủ nhật)');
    }

    // Validate basePrice
    if (basePrice <= 0) {
      return res.validationError('basePrice phải lớn hơn 0');
    }

    const pattern = await schedulePatternService.create({
      name,
      description,
      routeId: parseInt(routeId),
      busTypeId: parseInt(busTypeId),
      departureTimes,
      daysOfWeek,
      basePrice: parseFloat(basePrice),
      isActive
    });

    return res.created(pattern, 'Tạo mẫu lịch trình thành công');
  } catch (error) {
    if (error.message.includes('đã tồn tại')) {
      return res.error(error.message, 409);
    }
    return res.serverError(error.message);
  }
};

const update = async (req, res) => {
  try {
    const { 
      name, 
      description, 
      routeId, 
      busTypeId, 
      departureTimes, 
      daysOfWeek, 
      basePrice, 
      isActive 
    } = req.body;

    // Validate required fields
    if (!name || !routeId || !busTypeId || !departureTimes || !daysOfWeek || !basePrice) {
      return res.validationError('Thiếu thông tin bắt buộc', [
        'name', 'routeId', 'busTypeId', 'departureTimes', 'daysOfWeek', 'basePrice'
      ]);
    }

    // Validate departureTimes format (JSON array)
    try {
      const times = JSON.parse(departureTimes);
      if (!Array.isArray(times) || times.length === 0) {
        return res.validationError('departureTimes phải là JSON array không rỗng');
      }
    } catch (error) {
      return res.validationError('departureTimes phải là JSON array hợp lệ');
    }

    // Validate daysOfWeek format
    const days = daysOfWeek.split(',').map(d => d.trim());
    const validDays = ['1', '2', '3', '4', '5', '6', '7'];
    if (!days.every(day => validDays.includes(day))) {
      return res.validationError('daysOfWeek phải chứa các số từ 1-7 (1=Thứ 2, 7=Chủ nhật)');
    }

    // Validate basePrice
    if (basePrice <= 0) {
      return res.validationError('basePrice phải lớn hơn 0');
    }

    const pattern = await schedulePatternService.update(req.params.id, {
      name,
      description,
      routeId: parseInt(routeId),
      busTypeId: parseInt(busTypeId),
      departureTimes,
      daysOfWeek,
      basePrice: parseFloat(basePrice),
      isActive
    });

    if (!pattern) {
      return res.notFound('Không tìm thấy mẫu lịch trình');
    }

    return res.success(pattern, 'Cập nhật mẫu lịch trình thành công');
  } catch (error) {
    if (error.message.includes('đã tồn tại')) {
      return res.error(error.message, 409);
    }
    return res.serverError(error.message);
  }
};

const remove = async (req, res) => {
  try {
    const result = await schedulePatternService.remove(req.params.id);
    
    if (!result) {
      return res.notFound('Không tìm thấy mẫu lịch trình');
    }
    
    if (result.error) {
      return res.error(result.error, 409);
    }
    
    return res.success(null, 'Xóa mẫu lịch trình thành công');
  } catch (error) {
    return res.serverError(error.message);
  }
};

module.exports = { getAll, getById, create, update, remove }; 