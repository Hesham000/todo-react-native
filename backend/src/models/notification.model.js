const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    task: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Task',
    },
    title: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
    scheduledFor: {
      type: Date,
      required: true,
    },
    sent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Create index for faster querying
notificationSchema.index({ user: 1, scheduledFor: 1 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification; 