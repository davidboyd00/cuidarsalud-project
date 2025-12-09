const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const serviceRoutes = require('./services');
const appointmentRoutes = require('./appointments');
const contentRoutes = require('./content');
const userRoutes = require('./users');

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/services', serviceRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/users', userRoutes);

// Content routes (mounted at root level for cleaner URLs)
router.use('/', contentRoutes);

module.exports = router;
