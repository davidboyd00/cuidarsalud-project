const { authenticate, isAdmin, isStaff, optionalAuth } = require('./auth');
const { ApiError, notFound, errorHandler, asyncHandler } = require('./errorHandler');
const { validate, rules, body, param, query } = require('./validation');

module.exports = {
  // Auth middlewares
  authenticate,
  isAdmin,
  isStaff,
  optionalAuth,
  
  // Error handling
  ApiError,
  notFound,
  errorHandler,
  asyncHandler,
  
  // Validation
  validate,
  rules,
  body,
  param,
  query,
};
