const express = require('express');
const { check } = require('express-validator');
const {
  getNotifications,
  scheduleNotification,
  markNotificationAsSent,
  getDueNotifications,
} = require('../controllers/notification.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// Apply protect middleware to all routes
router.use(protect);

// @route   GET /api/notifications
// @desc    Get pending notifications for a user
// @access  Private
router.get('/', getNotifications);

// @route   POST /api/notifications/schedule
// @desc    Schedule a notification for a task
// @access  Private
router.post(
  '/schedule',
  [
    check('taskId', 'Task ID is required').not().isEmpty(),
    check('title', 'Title is required').not().isEmpty(),
    check('body', 'Body is required').not().isEmpty(),
    check('scheduledFor', 'Scheduled date must be a valid date').isISO8601().toDate(),
  ],
  scheduleNotification
);

// @route   PUT /api/notifications/:id/sent
// @desc    Mark notification as sent
// @access  Private
router.put('/:id/sent', markNotificationAsSent);

// @route   GET /api/notifications/due
// @desc    Get due notifications for processing
// @access  Private (intended for internal service use)
router.get('/due', getDueNotifications);

module.exports = router; 