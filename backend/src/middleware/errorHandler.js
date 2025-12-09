/**
 * Custom error class for API errors
 */
class ApiError extends Error {
  constructor(statusCode, message, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Not found handler
 */
const notFound = (req, res, next) => {
  const error = new ApiError(404, `Ruta no encontrada: ${req.originalUrl}`);
  next(error);
};

/**
 * Global error handler
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Error interno del servidor';
  let errors = err.errors || null;

  // Prisma errors
  if (err.code) {
    switch (err.code) {
      case 'P2002':
        statusCode = 409;
        message = 'Ya existe un registro con estos datos.';
        break;
      case 'P2025':
        statusCode = 404;
        message = 'Registro no encontrado.';
        break;
      case 'P2003':
        statusCode = 400;
        message = 'Error de referencia: el registro relacionado no existe.';
        break;
      default:
        if (err.code.startsWith('P')) {
          statusCode = 400;
          message = 'Error en la base de datos.';
        }
    }
  }

  // Validation errors from express-validator
  if (err.array && typeof err.array === 'function') {
    statusCode = 400;
    message = 'Error de validación';
    errors = err.array();
  }

  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', {
      message: err.message,
      stack: err.stack,
      code: err.code,
    });
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * Async handler wrapper to catch errors
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  ApiError,
  notFound,
  errorHandler,
  asyncHandler,
};
