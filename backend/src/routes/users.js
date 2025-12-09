const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, isAdmin, validate, rules, body } = require('../middleware');

// All routes require admin
router.use(authenticate, isAdmin);

// Stats
router.get('/stats', userController.getUserStats);

// CRUD
router.get('/', userController.getUsers);
router.get('/:id', rules.uuidParam, validate, userController.getUser);
router.post(
  '/',
  [
    ...rules.register,
    body('role').optional().isIn(['USER', 'STAFF', 'ADMIN']).withMessage('Rol inválido'),
  ],
  validate,
  userController.createUser
);
router.put('/:id', rules.uuidParam, validate, userController.updateUser);
router.put(
  '/:id/reset-password',
  rules.uuidParam,
  body('newPassword').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  validate,
  userController.resetUserPassword
);
router.delete('/:id', rules.uuidParam, validate, userController.deleteUser);

module.exports = router;
