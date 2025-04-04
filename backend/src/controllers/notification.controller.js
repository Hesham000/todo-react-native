const Notification = require('../models/notification.model');
const User = require('../models/user.model');

/**
 * @desc    Get pending notifications for a user
 * @route   GET /api/notifications
 * @access  Private
 */
const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({
      user: req.user._id,
      sent: false,
    }).populate('task', 'title description');

    res.json(notifications);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Schedule a notification for a task
 * @route   POST /api/notifications/schedule
 * @access  Private
 */
const scheduleNotification = async (req, res, next) => {
  try {
    const { taskId, title, body, scheduledFor } = req.body;

    // Create notification
    const notification = await Notification.create({
      user: req.user._id,
      task: taskId,
      title,
      body,
      scheduledFor: new Date(scheduledFor),
    });

    res.status(201).json(notification);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark notification as sent
 * @route   PUT /api/notifications/:id/sent
 * @access  Private
 */
const markNotificationAsSent = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      res.status(404);
      throw new Error('Notification not found');
    }

    // Ensure notification belongs to the user
    if (notification.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to update this notification');
    }

    notification.sent = true;
    await notification.save();

    res.json({ message: 'Notification marked as sent' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get due notifications for processing
 * @route   GET /api/notifications/due
 * @access  Private (intended for internal service use)
 */
const getDueNotifications = async (req, res, next) => {
  try {
    // Find notifications that are due but not sent yet
    const now = new Date();
    const notifications = await Notification.find({
      scheduledFor: { $lte: now },
      sent: false,
    }).populate('user', 'pushToken').populate('task', 'title description');

    res.json(notifications);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  scheduleNotification,
  markNotificationAsSent,
  getDueNotifications,
}; 