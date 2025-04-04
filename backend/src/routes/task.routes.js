const express = require('express');
const { check } = require('express-validator');
const {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} = require('../controllers/task.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// Apply protect middleware to all routes
router.use(protect);

// @route   GET /api/tasks
// @desc    Get all tasks for a user
// @access  Private
router.get('/', getTasks);

// @route   GET /api/tasks/:id
// @desc    Get a task by ID
// @access  Private
router.get('/:id', getTaskById);

// @route   POST /api/tasks
// @desc    Create a new task
// @access  Private
router.post(
  '/',
  [
    check('title', 'Title is required').not().isEmpty(),
    check('dueDate', 'Due date must be a valid date').optional().isISO8601().toDate(),
    check('reminder', 'Reminder must be a valid date').optional().isISO8601().toDate(),
    check('priority', 'Priority must be low, medium, or high')
      .optional()
      .isIn(['low', 'medium', 'high']),
  ],
  createTask
);

// @route   PUT /api/tasks/:id
// @desc    Update a task
// @access  Private
router.put(
  '/:id',
  [
    check('title', 'Title is required if provided').optional().not().isEmpty(),
    check('dueDate', 'Due date must be a valid date').optional().isISO8601().toDate(),
    check('reminder', 'Reminder must be a valid date').optional().isISO8601().toDate(),
    check('priority', 'Priority must be low, medium, or high')
      .optional()
      .isIn(['low', 'medium', 'high']),
    check('completed', 'Completed must be a boolean').optional().isBoolean(),
  ],
  updateTask
);

// @route   DELETE /api/tasks/:id
// @desc    Delete a task
// @access  Private
router.delete('/:id', deleteTask);

module.exports = router; 