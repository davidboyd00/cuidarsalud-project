const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { authenticate, isAdmin, isStaff, validate, rules } = require('../middleware');

// Public routes
router.get('/slots', appointmentController.getAvailableSlots);

// User routes (authenticated)
router.get('/my', authenticate, appointmentController.getMyAppointments);
router.post('/', authenticate, rules.appointment, validate, appointmentController.createAppointment);
router.put('/:id/cancel', authenticate, rules.uuidParam, validate, appointmentController.cancelAppointment);

// Staff/Admin routes
router.get('/', authenticate, isStaff, appointmentController.getAllAppointments);
router.get('/stats', authenticate, isAdmin, appointmentController.getAppointmentStats);
router.get('/:id', authenticate, rules.uuidParam, validate, appointmentController.getAppointment);
router.put('/:id/status', authenticate, isStaff, rules.uuidParam, validate, appointmentController.updateAppointmentStatus);

module.exports = router;
