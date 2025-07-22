const ResponseHandler = require('../utils/responseHandler');

const responseMiddleware = (req, res, next) => {
  // Thêm các phương thức response vào res object
  res.success = (data = null, message = 'Success') => {
    return res.status(200).json(ResponseHandler.success(data, message));
  };

  res.created = (data = null, message = 'Created successfully') => {
    return res.status(201).json(ResponseHandler.created(data, message));
  };

  res.error = (message = 'Error', status = 400, data = null) => {
    return res.status(status).json(ResponseHandler.error(message, status, data));
  };

  res.notFound = (message = 'Resource not found') => {
    return res.status(404).json(ResponseHandler.notFound(message));
  };

  res.unauthorized = (message = 'Unauthorized') => {
    return res.status(401).json(ResponseHandler.unauthorized(message));
  };

  res.validationError = (message = 'Validation Error', fields = []) => {
    return res.status(400).json(ResponseHandler.validationError(message, fields));
  };

  res.serverError = (message = 'Internal Server Error') => {
    return res.status(500).json(ResponseHandler.serverError(message));
  };

  next();
};

module.exports = responseMiddleware; 