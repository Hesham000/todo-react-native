/**
 * ML Controller
 * 
 * Handles requests for machine learning features
 */
const ml = require('../ml');
const Task = require('../models/task.model');
const User = require('../models/user.model');

/**
 * Categorize a task
 * @route POST /api/ml/categorize
 */
exports.categorizeTask = async (req, res) => {
  try {
    const { title, description } = req.body;
    
    if (!title) {
      return res.status(400).json({ message: 'Task title is required' });
    }
    
    const category = ml.categorizeTask(title, description || '');
    
    return res.status(200).json({ category });
  } catch (error) {
    console.error('Error in categorizeTask:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Suggest task priority
 * @route POST /api/ml/priority
 */
exports.suggestPriority = async (req, res) => {
  try {
    const { title, description } = req.body;
    
    if (!title) {
      return res.status(400).json({ message: 'Task title is required' });
    }
    
    const priority = ml.suggestPriority(title, description || '');
    
    return res.status(200).json({ priority });
  } catch (error) {
    console.error('Error in suggestPriority:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Estimate task completion time
 * @route POST /api/ml/estimate-time
 */
exports.estimateCompletionTime = async (req, res) => {
  try {
    const { title, description } = req.body;
    
    if (!title) {
      return res.status(400).json({ message: 'Task title is required' });
    }
    
    const estimatedMinutes = ml.estimateCompletionTime(title, description || '');
    
    return res.status(200).json({ estimatedMinutes });
  } catch (error) {
    console.error('Error in estimateCompletionTime:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Recommend tasks
 * @route POST /api/ml/recommend
 */
exports.recommendTasks = async (req, res) => {
  try {
    const { tasks } = req.body;
    const userId = req.user?.id;
    
    if (!tasks || !Array.isArray(tasks)) {
      return res.status(400).json({ message: 'Tasks array is required' });
    }
    
    // Get user data for personalization if available
    let userData = {};
    if (userId) {
      const user = await User.findById(userId).select('preferences');
      if (user && user.preferences) {
        userData = user.preferences;
      }
    }
    
    const recommendations = ml.recommendTasks(tasks, userData);
    
    return res.status(200).json({ recommendations });
  } catch (error) {
    console.error('Error in recommendTasks:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Generate productivity insights
 * @route POST /api/ml/insights
 */
exports.getProductivityInsights = async (req, res) => {
  try {
    const { tasks } = req.body;
    const userId = req.user?.id;
    
    if (!tasks || !Array.isArray(tasks)) {
      return res.status(400).json({ message: 'Tasks array is required' });
    }
    
    // If user is authenticated, we can get their actual completed tasks
    let completedTasks = tasks;
    if (userId) {
      // Get the last 100 completed tasks for analysis
      const userTasks = await Task.find({ 
        user: userId,
        completed: true,
        completedAt: { $exists: true }
      })
      .sort({ completedAt: -1 })
      .limit(100);
      
      if (userTasks && userTasks.length > 0) {
        completedTasks = userTasks;
      }
    }
    
    const insights = ml.generateProductivityInsights(completedTasks);
    
    return res.status(200).json({ insights });
  } catch (error) {
    console.error('Error in getProductivityInsights:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Analyze sentiment
 * @route POST /api/ml/sentiment
 */
exports.analyzeSentiment = async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ message: 'Text is required' });
    }
    
    const analysis = ml.analyzeSentiment(text);
    
    return res.status(200).json({ analysis });
  } catch (error) {
    console.error('Error in analyzeSentiment:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Get motivational message
 * @route POST /api/ml/motivate
 */
exports.getMotivationalMessage = async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ message: 'Text is required' });
    }
    
    const sentiment = ml.analyzeSentiment(text);
    const motivation = ml.generateMotivationalResponse(sentiment);
    
    return res.status(200).json({ motivation });
  } catch (error) {
    console.error('Error in getMotivationalMessage:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}; 