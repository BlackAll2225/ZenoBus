class ResponseHandler {
  static success(data = null, message = 'Success') {
    return {
      status: 200,
      message,
      data
    };
  }

  static created(data = null, message = 'Created successfully') {
    return {
      status: 201,
      message,
      data
    };
  }

  static error(message = 'Error', status = 400, data = null) {
    return {
      status,
      message,
      data
    };
  }

  static notFound(message = 'Resource not found') {
    return {
      status: 404,
      message,
      data: null
    };
  }

  static unauthorized(message = 'Unauthorized') {
    return {
      status: 401,
      message,
      data: null
    };
  }

  static validationError(message = 'Validation Error', fields = []) {
    return {
      status: 400,
      message,
      data: { fields }
    };
  }

  static serverError(message = 'Internal Server Error') {
    return {
      status: 500,
      message,
      data: null
    };
  }
}

module.exports = ResponseHandler; 