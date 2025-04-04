/**
 * ML Routes
 */
const express = require('express');
const router = express.Router();
const mlController = require('../controllers/ml.controller');
const { auth } = require('../middleware/auth');

// Task categorization
router.post('/categorize', mlController.categorizeTask);
router.post('/priority', mlController.suggestPriority);
router.post('/estimate-time', mlController.estimateCompletionTime);

// Task recommendations and insights
router.post('/recommend', auth, mlController.recommendTasks);
router.post('/insights', auth, mlController.getProductivityInsights);

// Sentiment analysis
router.post('/sentiment', mlController.analyzeSentiment);
router.post('/motivate', mlController.getMotivationalMessage);

module.exports = router; 