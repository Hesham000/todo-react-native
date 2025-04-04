const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Routes
const authRoutes = require('./routes/auth.routes');
const taskRoutes = require('./routes/task.routes');
const notificationRoutes = require('./routes/notification.routes');
const userPreferenceRoutes = require('./routes/userPreference');

// Middleware
const errorHandler = require('./middleware/error.middleware');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/preferences', userPreferenceRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Todo App API' });
});

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 