/**
 * Rating Service
 * Business logic for processing and enhancing AI analysis results
 */

const { createError } = require('../middleware/errorHandler');

/**
 * Generate detailed analysis with enhanced insights
 * @param {Object} aiAnalysis - Raw AI analysis results
 * @param {Object} options - Analysis options
 * @returns {Object} Enhanced analysis
 */
const generateDetailedAnalysis = (aiAnalysis, options = {}) => {
  try {
    if (!aiAnalysis || !aiAnalysis.rating) {
      throw createError('Invalid analysis data', 400);
    }

    const enhanced = {
      ...aiAnalysis,
      enhancedInsights: generateEnhancedInsights(aiAnalysis),
      categoryBreakdown: generateCategoryBreakdown(aiAnalysis.rating),
      improvementPlan: generateImprovementPlan(aiAnalysis),
      confidence: calculateConfidence(aiAnalysis),
      timestamp: new Date().toISOString()
    };

    return enhanced;

  } catch (error) {
    console.error('Error generating detailed analysis:', error);
    throw createError('Failed to process analysis results', 500);
  }
};

/**
 * Calculate overall rating with weighted categories
 * @param {Object} ratings - Individual category ratings
 * @returns {number} Weighted overall rating
 */
const calculateRating = (ratings) => {
  // Weights for different categories
  const weights = {
    facialSymmetry: 0.25,
    skinClarity: 0.20,
    grooming: 0.20,
    expression: 0.15,
    eyeAppeal: 0.10,
    facialStructure: 0.10
  };

  let weightedSum = 0;
  let totalWeight = 0;

  Object.entries(weights).forEach(([category, weight]) => {
    if (ratings[category] && typeof ratings[category] === 'number') {
      weightedSum += ratings[category] * weight;
      totalWeight += weight;
    }
  });

  if (totalWeight === 0) {
    return ratings.overall || 5; // Fallback
  }

  const calculatedRating = weightedSum / totalWeight;
  return Math.round(calculatedRating * 10) / 10; // Round to 1 decimal place
};

/**
 * Generate improvement suggestions based on analysis
 * @param {Object} analysis - Analysis results
 * @returns {Array} Categorized improvement suggestions
 */
const generateImprovementSuggestions = (analysis) => {
  const suggestions = {
    immediate: [],
    shortTerm: [],
    longTerm: [],
    grooming: [],
    styling: [],
    lifestyle: []
  };

  if (!analysis.rating) return suggestions;

  const ratings = analysis.rating;

  // Grooming suggestions
  if (ratings.grooming < 7) {
    suggestions.grooming.push("Focus on consistent skincare routine");
    suggestions.grooming.push("Consider professional grooming services");
    suggestions.immediate.push("Ensure hair is well-styled and neat");
  }

  // Skin clarity suggestions
  if (ratings.skinClarity < 7) {
    suggestions.immediate.push("Use gentle cleanser and moisturizer daily");
    suggestions.shortTerm.push("Consider consulting a dermatologist");
    suggestions.lifestyle.push("Stay hydrated and get adequate sleep");
  }

  // Expression suggestions
  if (ratings.expression < 7) {
    suggestions.immediate.push("Practice genuine, relaxed smiles in the mirror");
    suggestions.shortTerm.push("Work on confident posture and eye contact");
  }

  // Eye appeal suggestions
  if (ratings.eyeAppeal < 7) {
    suggestions.styling.push("Consider eyebrow grooming or shaping");
    suggestions.immediate.push("Use eye cream to reduce any puffiness");
  }

  // General lifestyle suggestions
  suggestions.lifestyle.push("Maintain regular exercise routine");
  suggestions.lifestyle.push("Eat a balanced diet rich in nutrients");
  suggestions.lifestyle.push("Practice good posture");

  // Style suggestions
  suggestions.styling.push("Experiment with different hairstyles");
  suggestions.styling.push("Choose clothing that fits well and flatters");
  suggestions.styling.push("Consider color analysis for best color choices");

  return suggestions;
};

/**
 * Generate enhanced insights from AI analysis
 * @param {Object} analysis - AI analysis results
 * @returns {Object} Enhanced insights
 */
const generateEnhancedInsights = (analysis) => {
  const insights = {
    strengths: [],
    focusAreas: [],
    personalityIndicators: [],
    recommendations: []
  };

  if (!analysis.rating) return insights;

  const ratings = analysis.rating;
  const avgRating = calculateRating(ratings);

  // Identify strengths (ratings 7+)
  Object.entries(ratings).forEach(([category, rating]) => {
    if (rating >= 7) {
      insights.strengths.push(formatCategoryName(category));
    } else if (rating < 6) {
      insights.focusAreas.push(formatCategoryName(category));
    }
  });

  // Generate personality indicators based on expression and overall presentation
  if (ratings.expression >= 7) {
    insights.personalityIndicators.push("Appears confident and approachable");
  }
  if (ratings.grooming >= 8) {
    insights.personalityIndicators.push("Shows attention to detail and self-care");
  }

  // Generate recommendations based on overall rating
  if (avgRating >= 8) {
    insights.recommendations.push("You have strong natural features - focus on maintaining your current routine");
  } else if (avgRating >= 6) {
    insights.recommendations.push("You have good potential - small improvements can make a big difference");
  } else {
    insights.recommendations.push("Focus on basic grooming and styling fundamentals first");
  }

  return insights;
};

/**
 * Generate category breakdown with interpretations
 * @param {Object} ratings - Rating scores
 * @returns {Object} Category breakdown
 */
const generateCategoryBreakdown = (ratings) => {
  const breakdown = {};

  Object.entries(ratings).forEach(([category, rating]) => {
    breakdown[category] = {
      score: rating,
      level: getRatingLevel(rating),
      description: getCategoryDescription(category, rating),
      priority: getPriorityLevel(rating)
    };
  });

  return breakdown;
};

/**
 * Calculate confidence score for the analysis
 * @param {Object} analysis - Analysis results
 * @returns {number} Confidence score (0-1)
 */
const calculateConfidence = (analysis) => {
  let confidence = analysis.confidence || 0.8;

  // Adjust confidence based on rating consistency
  if (analysis.rating) {
    const ratings = Object.values(analysis.rating).filter(r => typeof r === 'number');
    const avgRating = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
    const variance = ratings.reduce((sum, r) => sum + Math.pow(r - avgRating, 2), 0) / ratings.length;
    
    // Lower confidence if ratings are highly inconsistent
    if (variance > 4) {
      confidence *= 0.9;
    }
  }

  return Math.max(0.1, Math.min(1.0, confidence));
};

/**
 * Get rating level description
 * @param {number} rating - Numeric rating
 * @returns {string} Level description
 */
const getRatingLevel = (rating) => {
  if (rating >= 9) return 'Excellent';
  if (rating >= 7) return 'Good';
  if (rating >= 5) return 'Average';
  if (rating >= 3) return 'Below Average';
  return 'Needs Improvement';
};

/**
 * Get category-specific description
 * @param {string} category - Rating category
 * @param {number} rating - Rating score
 * @returns {string} Description
 */
const getCategoryDescription = (category, rating) => {
  const descriptions = {
    overall: {
      high: 'Strong overall attractiveness with well-balanced features',
      medium: 'Good overall appearance with room for enhancement',
      low: 'Several areas could benefit from attention and improvement'
    },
    facialSymmetry: {
      high: 'Well-balanced facial proportions and symmetry',
      medium: 'Generally balanced features with minor asymmetries',
      low: 'Some facial asymmetry that could be addressed through styling'
    },
    skinClarity: {
      high: 'Clear, healthy-looking skin with good complexion',
      medium: 'Generally good skin with minor blemishes or concerns',
      low: 'Skin could benefit from improved skincare routine'
    },
    grooming: {
      high: 'Excellent grooming and personal care habits evident',
      medium: 'Well-groomed with some areas for refinement',
      low: 'Basic grooming improvements would make a significant difference'
    },
    expression: {
      high: 'Engaging, positive expression that enhances attractiveness',
      medium: 'Pleasant expression with natural appeal',
      low: 'Expression could be more engaging or confident'
    },
    eyeAppeal: {
      high: 'Attractive, expressive eyes that draw positive attention',
      medium: 'Nice eyes that could be enhanced with better grooming',
      low: 'Eye area could benefit from targeted improvements'
    },
    facialStructure: {
      high: 'Strong, well-defined facial structure',
      medium: 'Good bone structure with attractive features',
      low: 'Facial structure could be enhanced through styling techniques'
    }
  };

  const level = rating >= 7 ? 'high' : rating >= 5 ? 'medium' : 'low';
  return descriptions[category]?.[level] || 'No specific feedback available';
};

/**
 * Get priority level for improvement
 * @param {number} rating - Rating score
 * @returns {string} Priority level
 */
const getPriorityLevel = (rating) => {
  if (rating < 4) return 'high';
  if (rating < 6) return 'medium';
  return 'low';
};

/**
 * Format category name for display
 * @param {string} category - Category key
 * @returns {string} Formatted name
 */
const formatCategoryName = (category) => {
  const names = {
    facialSymmetry: 'Facial Symmetry',
    skinClarity: 'Skin Clarity',
    grooming: 'Grooming',
    expression: 'Expression',
    eyeAppeal: 'Eye Appeal',
    facialStructure: 'Facial Structure',
    overall: 'Overall'
  };

  return names[category] || category;
};

/**
 * Generate personalized improvement plan
 * @param {Object} analysis - Analysis results
 * @returns {Object} Structured improvement plan
 */
const generateImprovementPlan = (analysis) => {
  const plan = {
    immediate: { actions: [], timeframe: '1-7 days' },
    shortTerm: { actions: [], timeframe: '1-4 weeks' },
    longTerm: { actions: [], timeframe: '1-6 months' }
  };

  if (!analysis.rating) return plan;

  const suggestions = generateImprovementSuggestions(analysis);

  plan.immediate.actions = [...suggestions.immediate, ...suggestions.grooming.slice(0, 2)];
  plan.shortTerm.actions = [...suggestions.shortTerm, ...suggestions.styling];
  plan.longTerm.actions = [...suggestions.longTerm, ...suggestions.lifestyle];

  return plan;
};

module.exports = {
  generateDetailedAnalysis,
  calculateRating,
  generateImprovementSuggestions,
  generateEnhancedInsights,
  generateCategoryBreakdown,
  calculateConfidence,
  getRatingLevel,
  formatCategoryName
};