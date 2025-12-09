const { body, param, query, validationResult } = require('express-validator');
const { ApiError } = require('./errorHandler');

/**
 * Middleware to handle validation results
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const extractedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));
    
    throw new ApiError(400, 'Error de validación', extractedErrors);
  }
  next();
};

/**
 * Common validation rules
 */
const rules = {
  // Auth validations
  register: [
    body('email')
      .isEmail()
      .withMessage('Ingrese un email válido')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 6 })
      .withMessage('La contraseña debe tener al menos 6 caracteres'),
    body('firstName')
      .trim()
      .notEmpty()
      .withMessage('El nombre es requerido'),
    body('lastName')
      .trim()
      .notEmpty()
      .withMessage('El apellido es requerido'),
    body('phone')
      .optional()
      .isMobilePhone('any')
      .withMessage('Ingrese un teléfono válido'),
  ],
  
  login: [
    body('email')
      .isEmail()
      .withMessage('Ingrese un email válido')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('La contraseña es requerida'),
  ],

  // Service validations
  service: [
    body('title')
      .trim()
      .notEmpty()
      .withMessage('El título es requerido'),
    body('description')
      .trim()
      .notEmpty()
      .withMessage('La descripción es requerida'),
    body('price')
      .isFloat({ min: 0 })
      .withMessage('El precio debe ser un número positivo'),
    body('priceType')
      .optional()
      .isIn(['FIXED', 'HOURLY', 'CONSULTATION'])
      .withMessage('Tipo de precio inválido'),
    body('duration')
      .optional()
      .isInt({ min: 1 })
      .withMessage('La duración debe ser un número positivo'),
  ],

  // Appointment validations
  appointment: [
    body('serviceId')
      .isUUID()
      .withMessage('ID de servicio inválido'),
    body('date')
      .isISO8601()
      .withMessage('Fecha inválida'),
    body('time')
      .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage('Hora inválida (formato HH:MM)'),
    body('address')
      .optional()
      .trim()
      .isLength({ min: 10 })
      .withMessage('La dirección debe tener al menos 10 caracteres'),
    body('notes')
      .optional()
      .trim(),
  ],

  // Review validations
  review: [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('El nombre es requerido'),
    body('content')
      .trim()
      .isLength({ min: 10 })
      .withMessage('El contenido debe tener al menos 10 caracteres'),
    body('rating')
      .isInt({ min: 1, max: 5 })
      .withMessage('La calificación debe estar entre 1 y 5'),
  ],

  // Contact message validations
  contactMessage: [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('El nombre es requerido'),
    body('email')
      .isEmail()
      .withMessage('Ingrese un email válido')
      .normalizeEmail(),
    body('message')
      .trim()
      .isLength({ min: 10 })
      .withMessage('El mensaje debe tener al menos 10 caracteres'),
    body('phone')
      .optional()
      .isMobilePhone('any')
      .withMessage('Ingrese un teléfono válido'),
  ],

  // Site content validations
  siteContent: [
    body('key')
      .trim()
      .notEmpty()
      .withMessage('La clave es requerida'),
    body('section')
      .trim()
      .notEmpty()
      .withMessage('La sección es requerida'),
    body('content')
      .isObject()
      .withMessage('El contenido debe ser un objeto'),
  ],

  // Team member validations
  teamMember: [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('El nombre es requerido'),
    body('position')
      .trim()
      .notEmpty()
      .withMessage('El cargo es requerido'),
    body('email')
      .optional()
      .isEmail()
      .withMessage('Ingrese un email válido'),
  ],

  // UUID param validation
  uuidParam: [
    param('id')
      .isUUID()
      .withMessage('ID inválido'),
  ],

  // Pagination query validation
  pagination: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('La página debe ser un número positivo'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('El límite debe estar entre 1 y 100'),
  ],
};

module.exports = {
  validate,
  rules,
  body,
  param,
  query,
};
