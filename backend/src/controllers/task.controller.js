const { validationResult } = require('express-validator');
const Task = require('../models/Task');
const Notification = require('../models/notification.model');

/**
 * @desc    Get all tasks for a user
 * @route   GET /api/tasks
 * @access  Private
 */
const getTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single task by ID
 * @route   GET /api/tasks/:id
 * @access  Private
 */
const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    // Check if task exists
    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    // Check if task belongs to user
    if (task.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to access this task');
    }

    res.json(task);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new task
 * @route   POST /api/tasks
 * @access  Private
 */
const createTask = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, dueDate, reminder, priority } = req.body;

    // Create the task
    const task = await Task.create({
      user: req.user._id,
      title,
      description,
      dueDate: dueDate || null,
      reminder: reminder || null,
      priority: priority || 'medium',
    });

    // If a reminder is set, create a notification
    if (reminder && new Date(reminder) > new Date()) {
      await Notification.create({
        user: req.user._id,
        task: task._id,
        title: `Reminder: ${title}`,
        body: description || 'Your task is due soon',
        scheduledFor: new Date(reminder),
      });
    }

    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a task
 * @route   PUT /api/tasks/:id
 * @access  Private
 */
const updateTask = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, completed, dueDate, reminder, priority } = req.body;

    // Find task by ID
    const task = await Task.findById(req.params.id);

    // Check if task exists
    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    // Check if task belongs to user
    if (task.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to update this task');
    }

    // Update task fields
    task.title = title || task.title;
    task.description = description !== undefined ? description : task.description;
    task.completed = completed !== undefined ? completed : task.completed;
    task.dueDate = dueDate !== undefined ? dueDate : task.dueDate;
    task.priority = priority || task.priority;

    // Handle reminders
    if (reminder !== undefined) {
      const oldReminder = task.reminder;
      task.reminder = reminder;
      task.reminderSent = false;

      // Delete any existing notifications for this task
      await Notification.deleteMany({ task: task._id });

      // Create a new notification if reminder is set
      if (reminder && new Date(reminder) > new Date()) {
        await Notification.create({
          user: req.user._id,
          task: task._id,
          title: `Reminder: ${task.title}`,
          body: task.description || 'Your task is due soon',
          scheduledFor: new Date(reminder),
        });
      }
    }

    // Save updated task
    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a task
 * @route   DELETE /api/tasks/:id
 * @access  Private
 */
const deleteTask = async (req, res, next) => {
  try {
    // Find task by ID
    const task = await Task.findById(req.params.id);

    // Check if task exists
    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    // Check if task belongs to user
    if (task.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to delete this task');
    }

    // Delete associated notifications
    await Notification.deleteMany({ task: task._id });

    // Delete the task
    await task.deleteOne();
    res.json({ message: 'Task removed' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
}; 