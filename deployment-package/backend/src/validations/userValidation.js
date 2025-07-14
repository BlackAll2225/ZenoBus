const Joi = require('joi');

// Validation schema for user update
const userUpdateSchema = Joi.object({
  fullName: Joi.string()
    .min(2)
    .max(100)
    .pattern(/^[a-zA-ZÀ-ỹ\s]+$/)
    .messages({
      'string.min': 'Họ tên phải có ít nhất 2 ký tự',
      'string.max': 'Họ tên không được quá 100 ký tự',
      'string.pattern.base': 'Họ tên chỉ được chứa chữ cái và khoảng trắng'
    }),
  
  email: Joi.string()
    .email()
    .max(100)
    .messages({
      'string.email': 'Email không hợp lệ',
      'string.max': 'Email không được quá 100 ký tự'
    }),
  
  phoneNumber: Joi.string()
    .pattern(/^[0-9]{10,11}$/)
    .messages({
      'string.pattern.base': 'Số điện thoại phải có 10-11 chữ số'
    })
}).min(1).messages({
  'object.min': 'Phải cung cấp ít nhất một trường để cập nhật'
});

// Validation schema for user search
const userSearchSchema = Joi.object({
  query: Joi.string()
    .min(1)
    .max(100)
    .required()
    .messages({
      'string.min': 'Từ khóa tìm kiếm phải có ít nhất 1 ký tự',
      'string.max': 'Từ khóa tìm kiếm không được quá 100 ký tự',
      'any.required': 'Từ khóa tìm kiếm là bắt buộc'
    }),
  
  limit: Joi.number()
    .integer()
    .min(1)
    .max(50)
    .default(10)
    .messages({
      'number.integer': 'Giới hạn phải là số nguyên',
      'number.min': 'Giới hạn phải lớn hơn 0',
      'number.max': 'Giới hạn không được quá 50'
    })
});

// Validation schema for user filters
const userFiltersSchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.integer': 'Trang phải là số nguyên',
      'number.min': 'Trang phải lớn hơn 0'
    }),
  
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10)
    .messages({
      'number.integer': 'Giới hạn phải là số nguyên',
      'number.min': 'Giới hạn phải lớn hơn 0',
      'number.max': 'Giới hạn không được quá 100'
    }),
  
  search: Joi.string()
    .max(100)
    .allow('')
    .messages({
      'string.max': 'Từ khóa tìm kiếm không được quá 100 ký tự'
    }),
  
  startDate: Joi.date()
    .iso()
    .messages({
      'date.base': 'Ngày bắt đầu không hợp lệ',
      'date.format': 'Ngày bắt đầu phải có định dạng ISO'
    }),
  
  endDate: Joi.date()
    .iso()
    .greater(Joi.ref('startDate'))
    .messages({
      'date.base': 'Ngày kết thúc không hợp lệ',
      'date.format': 'Ngày kết thúc phải có định dạng ISO',
      'date.greater': 'Ngày kết thúc phải sau ngày bắt đầu'
    }),
  
  sortBy: Joi.string()
    .valid('id', 'fullName', 'email', 'phoneNumber', 'createdAt')
    .default('createdAt')
    .messages({
      'any.only': 'Trường sắp xếp không hợp lệ'
    }),
  
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'Thứ tự sắp xếp phải là asc hoặc desc'
    })
});

// Validation schema for user ID
const userIdSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'ID người dùng phải là số',
      'number.integer': 'ID người dùng phải là số nguyên',
      'number.positive': 'ID người dùng phải là số dương',
      'any.required': 'ID người dùng là bắt buộc'
    })
});

// Validation functions
const validateUserUpdate = (data) => {
  return userUpdateSchema.validate(data, { abortEarly: false });
};

const validateUserSearch = (data) => {
  return userSearchSchema.validate(data, { abortEarly: false });
};

const validateUserFilters = (data) => {
  return userFiltersSchema.validate(data, { abortEarly: false });
};

const validateUserId = (data) => {
  return userIdSchema.validate(data, { abortEarly: false });
};

module.exports = {
  validateUserUpdate,
  validateUserSearch,
  validateUserFilters,
  validateUserId,
  userUpdateSchema,
  userSearchSchema,
  userFiltersSchema,
  userIdSchema
}; 