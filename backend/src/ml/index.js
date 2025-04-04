/**
 * ML Services Index
 * 
 * This file serves as a central export point for all ML-related services.
 */

const taskCategorizer = require('./taskCategorizer');
const smartRecommender = require('./smartRecommender');
const sentimentAnalyzer = require('./sentimentAnalyzer');

module.exports = {
  // Task categorization
  categorizeTask: taskCategorizer.categorizeTask,
  suggestPriority: taskCategorizer.suggestPriority,
  estimateCompletionTime: taskCategorizer.estimateCompletionTime,
  
  // Smart recommendations
  recommendTasks: smartRecommender.recommendTasks,
  generateProductivityInsights: smartRecommender.generateProductivityInsights,
  
  // Sentiment analysis
  analyzeSentiment: sentimentAnalyzer.analyzeSentiment,
  generateMotivationalResponse: sentimentAnalyzer.generateMotivationalResponse
}; 