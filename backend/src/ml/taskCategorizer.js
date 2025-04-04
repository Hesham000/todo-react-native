/**
 * ML-based Task Categorizer
 * 
 * This service uses Natural Language Processing to automatically categorize tasks
 * based on their descriptions. It uses a simple keyword-based approach but could
 * be extended to use more sophisticated ML models.
 */

// Categories and their associated keywords
const categories = {
  work: ['meeting', 'project', 'deadline', 'client', 'report', 'presentation', 'email', 'call', 'office', 'work'],
  personal: ['gym', 'workout', 'exercise', 'hobby', 'family', 'friend', 'movie', 'shop', 'buy', 'personal', 'home'],
  health: ['doctor', 'appointment', 'medication', 'pill', 'exercise', 'diet', 'gym', 'health', 'medical', 'fitness'],
  education: ['study', 'course', 'class', 'homework', 'assignment', 'lecture', 'learn', 'read', 'book', 'school', 'university'],
  finance: ['pay', 'bill', 'bank', 'money', 'budget', 'expense', 'tax', 'invoice', 'salary', 'finance', 'financial'],
};

/**
 * Categorize a task based on its title and description
 * 
 * @param {string} title - The task title
 * @param {string} description - The task description
 * @returns {string} - The predicted category
 */
function categorizeTask(title, description) {
  // Combine title and description for analysis
  const text = `${title} ${description}`.toLowerCase();
  
  // Calculate scores for each category
  const scores = {};
  
  for (const [category, keywords] of Object.entries(categories)) {
    scores[category] = keywords.reduce((score, keyword) => {
      // Count occurrences of this keyword in the text
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = text.match(regex);
      return score + (matches ? matches.length : 0);
    }, 0);
  }
  
  // Find the category with the highest score
  let bestCategory = 'uncategorized';
  let highestScore = 0;
  
  for (const [category, score] of Object.entries(scores)) {
    if (score > highestScore) {
      highestScore = score;
      bestCategory = category;
    }
  }
  
  // If no significant matches found, return uncategorized
  return highestScore > 0 ? bestCategory : 'uncategorized';
}

/**
 * Suggest a priority level based on task content
 * 
 * @param {string} title - The task title
 * @param {string} description - The task description
 * @returns {number} - The suggested priority (1-3, where 1 is highest)
 */
function suggestPriority(title, description) {
  const text = `${title} ${description}`.toLowerCase();
  
  // High priority keywords
  const highPriorityWords = ['urgent', 'immediate', 'critical', 'asap', 'important', 'deadline', 'tomorrow', 'today'];
  
  // Medium priority keywords
  const mediumPriorityWords = ['soon', 'next week', 'priority', 'significant', 'needed'];
  
  // Count keyword appearances
  const highPriorityCount = highPriorityWords.reduce((count, word) => {
    return count + (text.includes(word) ? 1 : 0);
  }, 0);
  
  const mediumPriorityCount = mediumPriorityWords.reduce((count, word) => {
    return count + (text.includes(word) ? 1 : 0);
  }, 0);
  
  // Determine priority based on keyword counts
  if (highPriorityCount > 0) {
    return 1; // High priority
  } else if (mediumPriorityCount > 0) {
    return 2; // Medium priority
  } else {
    return 3; // Low priority
  }
}

/**
 * Estimate completion time based on task description
 * 
 * @param {string} title - The task title
 * @param {string} description - The task description
 * @returns {number} - Estimated minutes to complete
 */
function estimateCompletionTime(title, description) {
  const text = `${title} ${description}`.toLowerCase();
  
  // Base time in minutes
  let baseTime = 30;
  
  // Task complexity indicators
  const complexityIndicators = {
    quick: ['quick', 'simple', 'easy', 'fast', 'brief', 'short'],
    medium: ['review', 'update', 'check', 'write', 'read'],
    complex: ['create', 'develop', 'implement', 'analyze', 'research', 'design', 'prepare', 'complex']
  };
  
  // Adjust time based on complexity indicators
  if (complexityIndicators.quick.some(word => text.includes(word))) {
    baseTime = 15;
  } else if (complexityIndicators.complex.some(word => text.includes(word))) {
    baseTime = 60;
  }
  
  // Look for explicit time mentions
  const timePattern = /(\d+)\s*(min|hour|hr)/i;
  const timeMatch = text.match(timePattern);
  
  if (timeMatch) {
    const value = parseInt(timeMatch[1], 10);
    const unit = timeMatch[2].toLowerCase();
    
    if (unit.startsWith('hour') || unit === 'hr') {
      return value * 60; // Convert hours to minutes
    } else if (unit === 'min') {
      return value;
    }
  }
  
  return baseTime;
}

module.exports = {
  categorizeTask,
  suggestPriority,
  estimateCompletionTime
}; 