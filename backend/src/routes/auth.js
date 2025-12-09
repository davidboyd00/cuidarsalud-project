const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate, validate, rules, body } = require('../middleware');

// Public routes
router.post('/register', rules.register, validate, authController.register);
router.post('/login', rules.login, validate, authController.login);

// Protected routes
router.get('/me', authenticate, authController.getMe);
router.put('/me', authenticate, authController.updateMe);
router.put(
  '/change-password',
  authenticate,
  [
    body('currentPassword').notEmpty().withMessage('La contraseña actual es requerida'),
    body('newPassword').isLength({ min: 6 }).withMessage('La nueva contraseña debe tener al menos 6 caracteres'),
  ],
  validate,
  authController.changePassword
);
router.post('/refresh', authenticate, authController.refreshToken);

module.exports = router;
