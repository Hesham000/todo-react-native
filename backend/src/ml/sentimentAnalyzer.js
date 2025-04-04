/**
 * Task Sentiment Analyzer
 * 
 * This service analyzes task descriptions to detect sentiment and emotional tone,
 * which can be used to provide motivational support or adjust UI elements.
 */

// Sentiment classification words
const sentimentWords = {
  positive: [
    'excited', 'happy', 'great', 'good', 'love', 'excellent', 'amazing', 'awesome',
    'fantastic', 'enjoy', 'fun', 'nice', 'looking forward', 'interested', 'motivated',
    'eager', 'pleased', 'accomplish', 'achieve', 'success', 'celebration', 'proud'
  ],
  neutral: [
    'ok', 'fine', 'alright', 'moderate', 'adequate', 'acceptable', 'standard',
    'normal', 'usual', 'routine', 'regular', 'typical', 'common', 'ordinary',
    'decent', 'fair', 'reasonable', 'satisfactory', 'sufficient', 'enough'
  ],
  negative: [
    'boring', 'hard', 'difficult', 'challenging', 'tough', 'tedious', 'dreading',
    'hate', 'dislike', 'annoying', 'frustrating', 'bad', 'terrible', 'awful',
    'dreadful', 'stressful', 'overwhelming', 'exhausting', 'tiring', 'afraid',
    'worried', 'anxious', 'nervous', 'concerned', 'unhappy', 'sad'
  ]
};

/**
 * Analyze the sentiment of task text
 * 
 * @param {string} text - Task title and description
 * @returns {Object} Sentiment analysis results
 */
function analyzeSentiment(text) {
  if (!text) {
    return {
      sentiment: 'neutral',
      scores: { positive: 0, neutral: 0, negative: 0 },
      emotionalTone: 'neutral',
      emotionalIntensity: 0
    };
  }
  
  const lowercaseText = text.toLowerCase();
  const words = lowercaseText.split(/\W+/);
  
  // Count occurrences of sentiment words
  const sentimentCounts = {
    positive: 0,
    neutral: 0,
    negative: 0
  };
  
  // Track matched words for explanation
  const matchedWords = {
    positive: [],
    neutral: [],
    negative: []
  };
  
  // Check for exact word matches
  words.forEach(word => {
    for (const [sentiment, wordList] of Object.entries(sentimentWords)) {
      if (wordList.includes(word)) {
        sentimentCounts[sentiment]++;
        matchedWords[sentiment].push(word);
      }
    }
  });
  
  // Also check for phrases in the original text
  for (const [sentiment, wordList] of Object.entries(sentimentWords)) {
    wordList.forEach(phrase => {
      if (phrase.includes(' ') && lowercaseText.includes(phrase)) {
        sentimentCounts[sentiment]++;
        matchedWords[sentiment].push(phrase);
      }
    });
  }
  
  // Determine the dominant sentiment
  let dominantSentiment = 'neutral';
  let highestCount = sentimentCounts.neutral;
  
  if (sentimentCounts.positive > highestCount) {
    dominantSentiment = 'positive';
    highestCount = sentimentCounts.positive;
  }
  
  if (sentimentCounts.negative > highestCount) {
    dominantSentiment = 'negative';
    highestCount = sentimentCounts.negative;
  }
  
  // Calculate intensity based on the ratio of sentiment words to total
  const totalSentimentWords = sentimentCounts.positive + sentimentCounts.neutral + sentimentCounts.negative;
  const totalWords = words.length;
  
  // Normalize scores to percentages
  const normalizedScores = {
    positive: totalSentimentWords > 0 ? (sentimentCounts.positive / totalSentimentWords) * 100 : 0,
    neutral: totalSentimentWords > 0 ? (sentimentCounts.neutral / totalSentimentWords) * 100 : 100,
    negative: totalSentimentWords > 0 ? (sentimentCounts.negative / totalSentimentWords) * 100 : 0
  };
  
  // Determine emotional tone
  let emotionalTone = 'neutral';
  let emotionalIntensity = 0;
  
  if (dominantSentiment === 'positive') {
    if (normalizedScores.positive > 75) {
      emotionalTone = 'excited';
      emotionalIntensity = 2;
    } else {
      emotionalTone = 'pleased';
      emotionalIntensity = 1;
    }
  } else if (dominantSentiment === 'negative') {
    if (lowercaseText.includes('stress') || 
        lowercaseText.includes('overwhelm') || 
        lowercaseText.includes('anxious')) {
      emotionalTone = 'stressed';
      emotionalIntensity = 2;
    } else if (lowercaseText.includes('bore') || 
               lowercaseText.includes('tedious') || 
               lowercaseText.includes('mundane')) {
      emotionalTone = 'bored';
      emotionalIntensity = 1;
    } else {
      emotionalTone = 'frustrated';
      emotionalIntensity = 1;
    }
  }
  
  return {
    sentiment: dominantSentiment,
    scores: normalizedScores,
    matchedWords,
    emotionalTone,
    emotionalIntensity
  };
}

/**
 * Generate motivational message based on sentiment analysis
 * 
 * @param {Object} sentimentData - Results from analyzeSentiment
 * @returns {Object} - Motivational message and suggestion
 */
function generateMotivationalResponse(sentimentData) {
  if (!sentimentData) {
    return {
      message: "You've got this!",
      suggestion: "Break your task into smaller parts to make it more manageable."
    };
  }
  
  const { sentiment, emotionalTone, emotionalIntensity } = sentimentData;
  
  // Default responses
  const responses = {
    positive: {
      message: "Great attitude! You're on the right track.",
      suggestion: "Use this positive energy to tackle your most important tasks."
    },
    neutral: {
      message: "You've got this!",
      suggestion: "Setting a timer can help you stay focused on this task."
    },
    negative: {
      message: "This task seems challenging, but you can handle it.",
      suggestion: "Break it down into smaller steps to make it more manageable."
    }
  };
  
  // More specific responses based on emotional tone
  const specificResponses = {
    excited: {
      message: "Your enthusiasm is contagious! Channel that energy!",
      suggestion: "This is a great time to tackle something challenging."
    },
    pleased: {
      message: "You seem positive about this task - that's half the battle!",
      suggestion: "Build on this momentum by planning your next steps."
    },
    stressed: {
      message: "It's normal to feel overwhelmed sometimes. Take a deep breath.",
      suggestion: "Focus on just the first step. Progress, not perfection."
    },
    bored: {
      message: "Even routine tasks can be opportunities for small improvements.",
      suggestion: "Try setting a personal challenge to make this more interesting."
    },
    frustrated: {
      message: "This task may be challenging, but you've overcome difficult things before.",
      suggestion: "Consider asking for help or taking a short break to reset."
    }
  };
  
  // Select appropriate response
  let response;
  if (specificResponses[emotionalTone]) {
    response = specificResponses[emotionalTone];
  } else {
    response = responses[sentiment];
  }
  
  return response;
}

module.exports = {
  analyzeSentiment,
  generateMotivationalResponse
}; 