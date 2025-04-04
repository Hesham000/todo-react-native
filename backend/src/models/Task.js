const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    category: {
      type: String,
      trim: true,
      default: 'other',
    },
    dueDate: {
      type: Date,
    },
    reminder: {
      type: Date,
    },
    reminderSent: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Add pre-save middleware to update completedAt timestamp when a task is marked as completed
taskSchema.pre('save', function (next) {
  // If task is being marked as completed and doesn't have a completedAt date
  if (this.completed && !this.completedAt) {
    this.completedAt = new Date();
  }
  // If task is being marked as not completed, clear the completedAt field
  if (!this.completed && this.completedAt) {
    this.completedAt = null;
  }
  next();
});

module.exports = mongoose.model('Task', taskSchema); 