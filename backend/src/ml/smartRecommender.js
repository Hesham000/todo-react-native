/**
 * Smart Task Recommender
 * 
 * This service uses ML techniques to provide intelligent task recommendations
 * based on user behavior patterns, task history, and productivity metrics.
 */

// Mock user productivity data (in a real app, this would come from a database)
const mockProductivityData = {
  timeOfDay: {
    morning: { productive: 80, tasks: ['work', 'education'] },
    afternoon: { productive: 60, tasks: ['personal', 'health'] },
    evening: { productive: 40, tasks: ['personal', 'finance'] },
    night: { productive: 30, tasks: ['personal'] },
  },
  dayOfWeek: {
    weekday: { productive: 75, tasks: ['work', 'education', 'finance'] },
    weekend: { productive: 50, tasks: ['personal', 'health'] },
  }
};

/**
 * Current time period classifier
 * 
 * @returns {Object} Time period information
 */
function getCurrentTimePeriod() {
  const now = new Date();
  const hour = now.getHours();
  const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday
  
  // Determine time of day
  let timeOfDay;
  if (hour >= 5 && hour < 12) {
    timeOfDay = 'morning';
  } else if (hour >= 12 && hour < 17) {
    timeOfDay = 'afternoon';
  } else if (hour >= 17 && hour < 22) {
    timeOfDay = 'evening';
  } else {
    timeOfDay = 'night';
  }
  
  // Determine if weekday or weekend
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const dayType = isWeekend ? 'weekend' : 'weekday';
  
  return {
    timeOfDay,
    dayType,
    hour,
    dayOfWeek
  };
}

/**
 * Recommend tasks based on user productivity patterns
 * 
 * @param {Array} tasks - List of pending tasks
 * @param {Object} userData - User data for personalization
 * @returns {Array} Sorted tasks based on recommendations
 */
function recommendTasks(tasks, userData = {}) {
  const timePeriod = getCurrentTimePeriod();
  
  // Get productivity data for current time period
  const timeOfDayData = mockProductivityData.timeOfDay[timePeriod.timeOfDay];
  const dayTypeData = mockProductivityData.dayOfWeek[timePeriod.dayType];
  
  // Score each task based on productivity patterns
  const scoredTasks = tasks.map(task => {
    let score = task.priority === 1 ? 100 : task.priority === 2 ? 50 : 20;
    
    // Increase score for task categories that are productive at this time
    if (timeOfDayData.tasks.includes(task.category)) {
      score += timeOfDayData.productive / 2;
    }
    
    if (dayTypeData.tasks.includes(task.category)) {
      score += dayTypeData.productive / 2;
    }
    
    // Deadline factor - tasks due soon get higher scores
    if (task.dueDate) {
      const dueDate = new Date(task.dueDate);
      const now = new Date();
      const daysUntilDue = Math.max(0, Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24)));
      
      if (daysUntilDue === 0) {
        score += 100; // Due today
      } else if (daysUntilDue === 1) {
        score += 70; // Due tomorrow
      } else if (daysUntilDue <= 3) {
        score += 40; // Due within 3 days
      } else if (daysUntilDue <= 7) {
        score += 20; // Due within a week
      }
    }
    
    // Adjust score based on estimated completion time and current time available
    if (task.estimatedMinutes) {
      // Favor tasks that fit into current time window
      // For example, if it's late evening, favor shorter tasks
      if (timePeriod.timeOfDay === 'night' && task.estimatedMinutes <= 30) {
        score += 20;
      } else if (timePeriod.timeOfDay === 'evening' && task.estimatedMinutes <= 60) {
        score += 15;
      } else if (timePeriod.timeOfDay === 'morning' && task.estimatedMinutes > 60) {
        score += 15; // Longer, focused work in the morning
      }
    }
    
    return {
      ...task,
      recommendationScore: score
    };
  });
  
  // Sort tasks by recommendation score (highest first)
  return scoredTasks.sort((a, b) => b.recommendationScore - a.recommendationScore);
}

/**
 * Generate insights about user productivity patterns
 * 
 * @param {Array} completedTasks - List of user's completed tasks
 * @returns {Object} Productivity insights
 */
function generateProductivityInsights(completedTasks) {
  if (!completedTasks || completedTasks.length === 0) {
    return {
      mostProductiveTime: null,
      mostProductiveDay: null,
      averageTasksPerDay: 0,
      suggestions: ["Start completing tasks to see productivity insights"]
    };
  }
  
  // Simple analysis of completed tasks
  const completionTimeData = {};
  const completionDayData = {};
  let totalCompletionTime = 0;
  let taskCount = completedTasks.length;
  let daysCovered = new Set();
  
  completedTasks.forEach(task => {
    const completionDate = new Date(task.completedAt);
    const hour = completionDate.getHours();
    const dayOfWeek = completionDate.getDay();
    const timeKey = Math.floor(hour / 4) * 4; // Group in 4-hour blocks
    const dayKey = dayOfWeek;
    const dateString = completionDate.toISOString().split('T')[0];
    
    // Track time of day performance
    completionTimeData[timeKey] = completionTimeData[timeKey] || { count: 0, minutes: 0 };
    completionTimeData[timeKey].count += 1;
    completionTimeData[timeKey].minutes += task.actualMinutes || 0;
    
    // Track day of week performance
    completionDayData[dayKey] = completionDayData[dayKey] || { count: 0, minutes: 0 };
    completionDayData[dayKey].count += 1;
    completionDayData[dayKey].minutes += task.actualMinutes || 0;
    
    // Track total time
    totalCompletionTime += task.actualMinutes || 0;
    
    // Track unique days
    daysCovered.add(dateString);
  });
  
  // Determine most productive time and day
  let mostProductiveTime = null;
  let highestTimeCount = 0;
  
  for (const [time, data] of Object.entries(completionTimeData)) {
    if (data.count > highestTimeCount) {
      highestTimeCount = data.count;
      mostProductiveTime = time;
    }
  }
  
  let mostProductiveDay = null;
  let highestDayCount = 0;
  
  for (const [day, data] of Object.entries(completionDayData)) {
    if (data.count > highestDayCount) {
      highestDayCount = data.count;
      mostProductiveDay = day;
    }
  }
  
  // Convert numeric time and day to readable format
  const timeLabels = ['Early morning (12am-4am)', 'Morning (4am-8am)', 'Late morning (8am-12pm)', 
                      'Afternoon (12pm-4pm)', 'Evening (4pm-8pm)', 'Night (8pm-12am)'];
  const dayLabels = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  const readableTime = timeLabels[mostProductiveTime / 4];
  const readableDay = dayLabels[mostProductiveDay];
  
  // Generate suggestions based on patterns
  const suggestions = [];
  
  if (mostProductiveTime !== null) {
    suggestions.push(`You are most productive during ${readableTime}. Consider scheduling important tasks during this time.`);
  }
  
  if (mostProductiveDay !== null) {
    suggestions.push(`${readableDay} is your most productive day. Plan challenging tasks for this day if possible.`);
  }
  
  if (totalCompletionTime > 0 && taskCount > 0) {
    const avgTimePerTask = totalCompletionTime / taskCount;
    suggestions.push(`On average, you spend ${Math.round(avgTimePerTask)} minutes per task.`);
  }
  
  return {
    mostProductiveTime: readableTime,
    mostProductiveDay: readableDay,
    averageTasksPerDay: daysCovered.size > 0 ? (taskCount / daysCovered.size).toFixed(1) : 0,
    suggestions
  };
}

module.exports = {
  recommendTasks,
  generateProductivityInsights,
  getCurrentTimePeriod
}; 