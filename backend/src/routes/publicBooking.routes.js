const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/publicBookingController');
const { body, query, param } = require('express-validator');
const { validate } = require('../middleware');

// Validaciones
const bookingValidation = [
  body('serviceId')
    .isUUID()
    .withMessage('ID de servicio inválido'),
  body('date')
    .isISO8601()
    .withMessage('Fecha inválida'),
  body('startTime')
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Hora inválida (formato HH:MM)'),
  body('patientName')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('El nombre debe tener entre 3 y 100 caracteres'),
  body('patientRut')
    .trim()
    .notEmpty()
    .withMessage('El RUT es requerido'),
  body('patientEmail')
    .isEmail()
    .normalizeEmail()
    .withMessage('El correo electrónico no es válido'),
  body('patientPhone')
    .optional()
    .isMobilePhone('es-CL')
    .withMessage('El teléfono no es válido'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Las notas no pueden exceder 500 caracteres'),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('La dirección no puede exceder 200 caracteres'),
];

// ==================== RUTAS PÚBLICAS ====================

// Obtener disponibilidad del calendario (mes completo)
router.get('/calendar', bookingController.getCalendarAvailability);

// Obtener slots disponibles para una fecha específica
router.get('/slots', bookingController.getAvailableSlots);

// Crear una nueva cita (público)
router.post('/', bookingValidation, validate, bookingController.createPublicBooking);

// Buscar citas por RUT o email
router.get('/search', bookingController.searchBookings);

// Obtener cita por token de cancelación
router.get('/cancel/:token', bookingController.getBookingByToken);

// Cancelar cita por token
router.post('/cancel/:token', bookingController.cancelBookingByToken);

module.exports = router;
