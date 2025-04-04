const express = require('express');
const router = express.Router();
const userPreferenceController = require('../controllers/userPreferenceController');
const auth = require('../middleware/auth.middleware');

// All routes require authentication
router.use(auth.protect);

// Get user preferences
router.get('/', userPreferenceController.getUserPreferences);

// Update user preferences
router.patch('/', userPreferenceController.updateUserPreferences);

// Calculate and update productivity metrics
router.post('/productivity', userPreferenceController.updateProductivityMetrics);

// ML model routes
router.post('/ml-models', userPreferenceController.storeMLModels);
router.get('/ml-models', userPreferenceController.getMLModels);

module.exports = router; 