const Joi = require('joi');

const createFeedbackSchema = Joi.object({
  userId: Joi.number().integer().positive().required(),
  bookingId: Joi.number().integer().positive().required(),
  rating: Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string().max(1000).allow('', null)
});

const updateFeedbackSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5),
  comment: Joi.string().max(1000).allow('', null)
}).min(1);

const feedbackIdSchema = Joi.object({
  id: Joi.number().integer().positive().required()
});

const feedbackFilterSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  rating: Joi.number().integer().min(1).max(5),
  userId: Joi.number().integer().positive(),
  bookingId: Joi.number().integer().positive(),
  startDate: Joi.date().iso(),
  endDate: Joi.date().iso(),
  sortBy: Joi.string().valid('id', 'rating', 'createdAt').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

const validateCreateFeedback = (data) => createFeedbackSchema.validate(data, { abortEarly: false });
const validateUpdateFeedback = (data) => updateFeedbackSchema.validate(data, { abortEarly: false });
const validateFeedbackId = (data) => feedbackIdSchema.validate(data, { abortEarly: false });
const validateFeedbackFilter = (data) => feedbackFilterSchema.validate(data, { abortEarly: false });

module.exports = {
  validateCreateFeedback,
  validateUpdateFeedback,
  validateFeedbackId,
  validateFeedbackFilter
}; 