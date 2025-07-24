const routeService = require('../services/routeService');

const getAllRoutes = async (req, res) => {
  try {
    const includeInactive = req.query.include_inactive === 'true';
    const routes = await routeService.getAllRoutes(includeInactive);
    res.success(routes, 'Routes retrieved successfully');
  } catch (error) {
    res.error(error.message, 500);
  }
};

const getRouteById = async (req, res) => {
  try {
    const { id } = req.params;
    const route = await routeService.getRouteById(id);
    res.success(route, 'Route retrieved successfully');
  } catch (error) {
    if (error.message === 'Route not found') {
      res.error(error.message, 404);
    } else {
      res.error(error.message, 500);
    }
  }
};

const createRoute = async (req, res) => {
  try {
    const routeData = req.body;
    const route = await routeService.createRoute(routeData);
    res.success(route, 'Route created successfully', 201);
  } catch (error) {
    if (error.message.includes('not found') || error.message.includes('already exists')) {
      res.error(error.message, 400);
    } else {
      res.error(error.message, 500);
    }
  }
};

const updateRoute = async (req, res) => {
  try {
    const { id } = req.params;
    const routeData = req.body;
    const route = await routeService.updateRoute(id, routeData);
    res.success(route, 'Route updated successfully');
  } catch (error) {
    if (error.message === 'Route not found') {
      res.error(error.message, 404);
    } else if (error.message.includes('not found') || error.message.includes('already exists')) {
      res.error(error.message, 400);
    } else {
      res.error(error.message, 500);
    }
  }
};

const toggleRouteStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await routeService.toggleRouteStatus(id);
    
    // Tạo message chi tiết dựa trên kết quả
    let message = 'Route status toggled successfully';
    if (result.statusChanged === 'disabled' && result.affectedPatternsCount > 0) {
      message += `. ${result.affectedPatternsCount} schedule pattern(s) have also been disabled.`;
    } else if (result.statusChanged === 'enabled') {
      message += '. Schedule patterns remain unchanged and need to be enabled manually if required.';
    }
    
    res.success(result, message);
  } catch (error) {
    if (error.message === 'Route not found') {
      res.error(error.message, 404);
    } else {
      res.error(error.message, 500);
    }
  }
};

const deleteRoute = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await routeService.deleteRoute(id);
    res.success(result, 'Route deleted successfully');
  } catch (error) {
    if (error.message === 'Route not found') {
      res.error(error.message, 404);
    } else {
      res.error(error.message, 500);
    }
  }
};

const getRoutesByProvince = async (req, res) => {
  try {
    const { provinceId } = req.params;
    const routes = await routeService.getRoutesByProvince(provinceId);
    res.success(routes, 'Routes retrieved successfully');
  } catch (error) {
    res.error(error.message, 500);
  }
};

const getAvailableDestinations = async (req, res) => {
  try {
    const { provinceId } = req.params;
    const destinations = await routeService.getAvailableDestinations(provinceId);
    res.success(destinations, 'Available destinations retrieved successfully');
  } catch (error) {
    if (error.message === 'Province not found') {
      res.error(error.message, 404);
    } else {
      res.error(error.message, 500);
    }
  }
};

const searchTrips = async (req, res) => {
  try {
    const { departureProvinceId, arrivalProvinceId, departureDate } = req.query;
    
    // Validate required parameters
    if (!departureProvinceId || !arrivalProvinceId || !departureDate) {
      return res.error('Missing required parameters: departureProvinceId, arrivalProvinceId, departureDate', 400);
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(departureDate)) {
      return res.error('Invalid date format. Use YYYY-MM-DD', 400);
    }

    const trips = await routeService.searchTrips(departureProvinceId, arrivalProvinceId, departureDate);
    res.success(trips, 'Trips found successfully');
  } catch (error) {
    if (error.message.includes('not found')) {
      res.error(error.message, 404);
    } else if (error.message.includes('Invalid')) {
      res.error(error.message, 400);
    } else {
      res.error(error.message, 500);
    }
  }
};

const getAvailableSeats = async (req, res) => {
  try {
    const { scheduleId } = req.params;
    
    // Validate schedule ID
    if (!scheduleId || isNaN(scheduleId) || parseInt(scheduleId) <= 0) {
      return res.error('Invalid schedule ID. Must be a positive integer', 400);
    }

    const seats = await routeService.getAvailableSeats(scheduleId);
    res.success(seats, 'Available seats retrieved successfully');
  } catch (error) {
    if (error.message.includes('not found')) {
      res.error(error.message, 404);
    } else if (error.message.includes('Invalid')) {
      res.error(error.message, 400);
    } else {
      res.error(error.message, 500);
    }
  }
};

module.exports = {
  getAllRoutes,
  getRouteById,
  createRoute,
  updateRoute,
  deleteRoute,
  toggleRouteStatus,
  getRoutesByProvince,
  getAvailableDestinations,
  searchTrips,
  getAvailableSeats
};
