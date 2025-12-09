const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const { authenticate, isAdmin, validate, rules } = require('../middleware');

// Public routes
router.get('/', serviceController.getServices);
router.get('/:id', serviceController.getService);

// Admin routes
router.post('/', authenticate, isAdmin, rules.service, validate, serviceController.createService);
router.put('/reorder', authenticate, isAdmin, serviceController.reorderServices);
router.put('/:id', authenticate, isAdmin, rules.service, validate, serviceController.updateService);
router.delete('/:id', authenticate, isAdmin, rules.uuidParam, validate, serviceController.deleteService);

module.exports = router;
