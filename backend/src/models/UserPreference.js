const mongoose = require('mongoose');

const userPreferenceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
      unique: true
    },
    // Store common categories used by this user
    preferredCategories: [{
      type: String,
      trim: true
    }],
    // Store serialized ML models (optional)
    mlModels: {
      priorityModel: String,
      categoryModel: String,
      durationModel: String
    },
    // Store user patterns
    workingHours: {
      start: {
        type: Number, // 0-23 hour
        default: 9
      },
      end: {
        type: Number, // 0-23 hour
        default: 17
      }
    },
    // Productivity metrics
    productivity: {
      averageTasksPerDay: {
        type: Number,
        default: 0
      },
      highPriorityCompletionRate: {
        type: Number,
        default: 0
      },
      averageCompletionTime: {
        type: Number, // in days
        default: 0
      },
      lastCalculated: {
        type: Date,
        default: Date.now
      }
    }
  },
  {
    timestamps: true
  }
);

// Create or update user preferences
userPreferenceSchema.statics.createOrUpdate = async function (userId, dataToUpdate) {
  try {
    // Use findOneAndUpdate with upsert:true to create if doesn't exist
    const userPreference = await this.findOneAndUpdate(
      { user: userId },
      { $set: dataToUpdate },
      { new: true, upsert: true, runValidators: true }
    );
    return userPreference;
  } catch (error) {
    throw new Error(`Error updating user preferences: ${error.message}`);
  }
};

// Update preferred categories based on usage frequency
userPreferenceSchema.statics.updatePreferredCategories = async function (userId, category) {
  try {
    // Get user preferences
    let userPref = await this.findOne({ user: userId });
    
    // If no user preferences exist yet, create them
    if (!userPref) {
      userPref = new this({
        user: userId,
        preferredCategories: [category]
      });
      await userPref.save();
      return userPref;
    }
    
    // Add category if it doesn't exist already
    if (!userPref.preferredCategories.includes(category)) {
      userPref.preferredCategories.push(category);
      // Keep only the 10 most recent categories
      if (userPref.preferredCategories.length > 10) {
        userPref.preferredCategories.shift();
      }
      await userPref.save();
    }
    
    return userPref;
  } catch (error) {
    throw new Error(`Error updating preferred categories: ${error.message}`);
  }
};

const UserPreference = mongoose.model('UserPreference', userPreferenceSchema);

module.exports = UserPreference; 