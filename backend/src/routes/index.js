/**
 * Main routes index file
 */
const express = require('express');
const authRoutes = require('./auth.routes');
const taskRoutes = require('./task.routes');
const userRoutes = require('./user.routes');
const mlRoutes = require('./ml.routes');

const router = express.Router();

// Register routes
router.use('/auth', authRoutes);
router.use('/tasks', taskRoutes);
router.use('/users', userRoutes);
router.use('/ml', mlRoutes);

module.exports = router; 