const stopService = require('../services/stopService');
const ResponseHandler = require('../utils/responseHandler');

// Get all stops
const getAllStops = async (req, res) => {
  try {
    const { provinceId, type } = req.query;
    
    let stops;
    if (provinceId) {
      stops = await stopService.getStopsByProvince(parseInt(provinceId));
    } else if (type) {
      stops = await stopService.getStopsByType(type);
    } else {
      stops = await stopService.getAllStops();
    }
    
    const response = ResponseHandler.success(stops, 'Stops retrieved successfully');
    return res.status(response.status).json({
      success: true,
      message: response.message,
      data: response.data
    });
  } catch (error) {
    const response = ResponseHandler.serverError(error.message);
    return res.status(response.status).json({
      success: false,
      message: response.message,
      error: response.data
    });
  }
};

// Get stop by ID
const getStopById = async (req, res) => {
  try {
    const { id } = req.params;
    const stop = await stopService.getStopById(parseInt(id));
    
    if (!stop) {
      const response = ResponseHandler.notFound('Stop not found');
      return res.status(response.status).json({
        success: false,
        message: response.message
      });
    }
    
    const response = ResponseHandler.success(stop, 'Stop retrieved successfully');
    return res.status(response.status).json({
      success: true,
      message: response.message,
      data: response.data
    });
  } catch (error) {
    const response = ResponseHandler.serverError(error.message);
    return res.status(response.status).json({
      success: false,
      message: response.message,
      error: response.data
    });
  }
};

// Create new stop
const createStop = async (req, res) => {
  try {
    const stopData = req.body;
    const newStop = await stopService.createStop(stopData);
    
    const response = ResponseHandler.created(newStop, 'Stop created successfully');
    return res.status(response.status).json({
      success: true,
      message: response.message,
      data: response.data
    });
  } catch (error) {
    const response = ResponseHandler.error(error.message, 400);
    return res.status(response.status).json({
      success: false,
      message: response.message,
      error: response.data
    });
  }
};

// Update stop
const updateStop = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const updatedStop = await stopService.updateStop(parseInt(id), updateData);
    
    const response = ResponseHandler.success(updatedStop, 'Stop updated successfully');
    return res.status(response.status).json({
      success: true,
      message: response.message,
      data: response.data
    });
  } catch (error) {
    if (error.message.includes('not found')) {
      const response = ResponseHandler.notFound(error.message);
      return res.status(response.status).json({
        success: false,
        message: response.message
      });
    }
    const response = ResponseHandler.error(error.message, 400);
    return res.status(response.status).json({
      success: false,
      message: response.message,
      error: response.data
    });
  }
};

// Delete stop
const deleteStop = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await stopService.deleteStop(parseInt(id));
    
    const response = ResponseHandler.success(null, result.message);
    return res.status(response.status).json({
      success: true,
      message: response.message
    });
  } catch (error) {
    if (error.message.includes('not found')) {
      const response = ResponseHandler.notFound(error.message);
      return res.status(response.status).json({
        success: false,
        message: response.message
      });
    }
    const response = ResponseHandler.error(error.message, 400);
    return res.status(response.status).json({
      success: false,
      message: response.message,
      error: response.data
    });
  }
};

// Get stops by province
const getStopsByProvince = async (req, res) => {
  try {
    const { provinceId } = req.params;
    const stops = await stopService.getStopsByProvince(parseInt(provinceId));
    
    const response = ResponseHandler.success(stops, 'Stops retrieved successfully');
    return res.status(response.status).json({
      success: true,
      message: response.message,
      data: response.data
    });
  } catch (error) {
    const response = ResponseHandler.serverError(error.message);
    return res.status(response.status).json({
      success: false,
      message: response.message,
      error: response.data
    });
  }
};

// Get stops by type
const getStopsByType = async (req, res) => {
  try {
    const { type } = req.params;
    const stops = await stopService.getStopsByType(type);
    
    const response = ResponseHandler.success(stops, 'Stops retrieved successfully');
    return res.status(response.status).json({
      success: true,
      message: response.message,
      data: response.data
    });
  } catch (error) {
    const response = ResponseHandler.error(error.message, 400);
    return res.status(response.status).json({
      success: false,
      message: response.message,
      error: response.data
    });
  }
};

module.exports = {
  getAllStops,
  getStopById,
  createStop,
  updateStop,
  deleteStop,
  getStopsByProvince,
  getStopsByType
}; 