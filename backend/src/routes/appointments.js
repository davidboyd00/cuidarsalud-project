const express = require('express');
const router = express.Router();
const {
  getAllAppointments,
  getMyAppointments,
  getAppointmentById,
  updateAppointment,
  updateAppointmentStatus,
  deleteAppointment,
} = require('../controllers/appointmentController');
const { authenticate, isAdmin, isStaff } = require('../middleware/auth');

// Rutas para usuarios autenticados
router.get('/mine', authenticate, getMyAppointments);

// Rutas para admin/staff
router.get('/', authenticate, isStaff, getAllAppointments);
router.get('/:id', authenticate, isStaff, getAppointmentById);
router.put('/:id', authenticate, isStaff, updateAppointment);
router.put('/:id/status', authenticate, isStaff, updateAppointmentStatus);
router.delete('/:id', authenticate, isAdmin, deleteAppointment);

module.exports = router;