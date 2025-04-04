const UserPreference = require('../models/UserPreference');
const Task = require('../models/Task');

// Get user preferences
exports.getUserPreferences = async (req, res) => {
  try {
    let userPreference = await UserPreference.findOne({ user: req.user._id });
    
    // If no preferences exist yet, create default ones
    if (!userPreference) {
      userPreference = new UserPreference({ user: req.user._id });
      await userPreference.save();
    }
    
    res.json(userPreference);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user preferences
exports.updateUserPreferences = async (req, res) => {
  try {
    const allowedUpdates = ['preferredCategories', 'workingHours', 'mlModels'];
    const updates = Object.keys(req.body).filter(key => allowedUpdates.includes(key));
    
    if (updates.length === 0) {
      return res.status(400).json({ message: 'No valid updates provided' });
    }
    
    const dataToUpdate = {};
    updates.forEach(update => {
      dataToUpdate[update] = req.body[update];
    });
    
    const userPreference = await UserPreference.createOrUpdate(req.user._id, dataToUpdate);
    res.json(userPreference);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Calculate and update productivity metrics
exports.updateProductivityMetrics = async (req, res) => {
  try {
    // Get all user's tasks
    const tasks = await Task.find({ user: req.user._id });
    
    if (tasks.length === 0) {
      return res.status(200).json({ message: 'No tasks found to calculate metrics' });
    }
    
    // Calculate metrics
    const completedTasks = tasks.filter(task => task.completed);
    const highPriorityTasks = tasks.filter(task => task.priority === 'high');
    const highPriorityCompletedTasks = highPriorityTasks.filter(task => task.completed);
    
    // Average tasks per day
    const oldestTask = tasks.reduce((oldest, task) => 
      new Date(task.createdAt) < new Date(oldest.createdAt) ? task : oldest, tasks[0]);
    
    const daysSinceFirstTask = Math.max(1, Math.ceil(
      (new Date() - new Date(oldestTask.createdAt)) / (1000 * 60 * 60 * 24)
    ));
    const averageTasksPerDay = completedTasks.length / daysSinceFirstTask;
    
    // High priority completion rate
    const highPriorityCompletionRate = highPriorityTasks.length > 0 ? 
      highPriorityCompletedTasks.length / highPriorityTasks.length : 0;
    
    // Average completion time (for tasks with completedAt)
    const tasksWithCompletionTime = completedTasks.filter(task => task.completedAt);
    let averageCompletionTime = 0;
    
    if (tasksWithCompletionTime.length > 0) {
      const totalCompletionDays = tasksWithCompletionTime.reduce((total, task) => {
        const createdDate = new Date(task.createdAt);
        const completedDate = new Date(task.completedAt);
        const days = (completedDate - createdDate) / (1000 * 60 * 60 * 24);
        return total + days;
      }, 0);
      
      averageCompletionTime = totalCompletionDays / tasksWithCompletionTime.length;
    }
    
    // Update productivity metrics
    const productivityData = {
      productivity: {
        averageTasksPerDay,
        highPriorityCompletionRate,
        averageCompletionTime,
        lastCalculated: new Date()
      }
    };
    
    const userPreference = await UserPreference.createOrUpdate(req.user._id, productivityData);
    res.json(userPreference);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Store ML model data
exports.storeMLModels = async (req, res) => {
  try {
    const { priorityModel, categoryModel, durationModel } = req.body;
    
    if (!priorityModel && !categoryModel && !durationModel) {
      return res.status(400).json({ message: 'No model data provided' });
    }
    
    const mlModels = {};
    if (priorityModel) mlModels.priorityModel = priorityModel;
    if (categoryModel) mlModels.categoryModel = categoryModel;
    if (durationModel) mlModels.durationModel = durationModel;
    
    const userPreference = await UserPreference.createOrUpdate(req.user._id, { mlModels });
    res.json({ success: true, message: 'ML models stored successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get ML model data
exports.getMLModels = async (req, res) => {
  try {
    const userPreference = await UserPreference.findOne({ user: req.user._id });
    
    if (!userPreference || !userPreference.mlModels) {
      return res.json({ 
        priorityModel: null, 
        categoryModel: null, 
        durationModel: null 
      });
    }
    
    res.json({
      priorityModel: userPreference.mlModels.priorityModel || null,
      categoryModel: userPreference.mlModels.categoryModel || null,
      durationModel: userPreference.mlModels.durationModel || null
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 