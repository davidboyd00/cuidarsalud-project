const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');
const { authenticate, isAdmin, optionalAuth, validate, rules } = require('../middleware');

// ==================== SITE CONTENT ====================
// Public
router.get('/content', contentController.getAllContent);
router.get('/content/:key', contentController.getContent);

// Admin
router.put('/content/:key', authenticate, isAdmin, contentController.upsertContent);
router.delete('/content/:key', authenticate, isAdmin, contentController.deleteContent);

// ==================== SETTINGS ====================
// Public
router.get('/settings', contentController.getAllSettings);
router.get('/settings/:key', contentController.getSetting);

// Admin
router.put('/settings/:key', authenticate, isAdmin, contentController.updateSetting);

// ==================== TEAM ====================
// Public
router.get('/team', contentController.getTeamMembers);
router.get('/team/:id', rules.uuidParam, validate, contentController.getTeamMember);

// Admin
router.post('/team', authenticate, isAdmin, rules.teamMember, validate, contentController.createTeamMember);
router.put('/team/:id', authenticate, isAdmin, rules.uuidParam, validate, contentController.updateTeamMember);
router.delete('/team/:id', authenticate, isAdmin, rules.uuidParam, validate, contentController.deleteTeamMember);

// ==================== REVIEWS ====================
// Public
router.get('/reviews', contentController.getReviews);
router.post('/reviews', optionalAuth, rules.review, validate, contentController.createReview);

// Admin
router.get('/reviews/all', authenticate, isAdmin, contentController.getAllReviews);
router.put('/reviews/:id', authenticate, isAdmin, rules.uuidParam, validate, contentController.updateReview);
router.delete('/reviews/:id', authenticate, isAdmin, rules.uuidParam, validate, contentController.deleteReview);

// ==================== CONTACT ====================
// Public
router.post('/contact', rules.contactMessage, validate, contentController.createContactMessage);

// Admin
router.get('/contact', authenticate, isAdmin, contentController.getContactMessages);
router.put('/contact/:id/read', authenticate, isAdmin, rules.uuidParam, validate, contentController.markMessageAsRead);
router.delete('/contact/:id', authenticate, isAdmin, rules.uuidParam, validate, contentController.deleteContactMessage);

module.exports = router;
