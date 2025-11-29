/**
 * Rating Service
 * Business logic for processing and enhancing AI analysis results
 */

/**
 * Generate detailed analysis with enhanced insights
 */
export function generateDetailedAnalysis(aiAnalysis, options = {}) {
  try {
    if (!aiAnalysis || !aiAnalysis.rating) {
      throw new Error('Invalid analysis data');
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
    throw new Error('Failed to process analysis results');
  }
}

/**
 * Calculate overall rating with weighted categories
 */
function calculateRating(ratings) {
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
    return ratings.overall || 5;
  }

  const calculatedRating = weightedSum / totalWeight;
  return Math.round(calculatedRating * 10) / 10;
}

/**
 * Generate enhanced insights from AI analysis
 */
function generateEnhancedInsights(analysis) {
  const insights = {
    strengths: [],
    focusAreas: [],
    personalityIndicators: [],
    recommendations: [],
    detailedFeatures: {},
    specificAdvice: []
  };

  if (analysis.detailedAnalysis) {
    insights.detailedFeatures = analysis.detailedAnalysis;
  }

  if (!analysis.rating) return insights;

  const ratings = analysis.rating;
  const avgRating = calculateRating(ratings);

  // Identify strengths and focus areas
  Object.entries(ratings).forEach(([category, rating]) => {
    if (rating >= 7) {
      insights.strengths.push(formatCategoryName(category));
    } else if (rating < 6) {
      insights.focusAreas.push(formatCategoryName(category));
    }
  });

  // Generate personality indicators
  if (ratings.expression >= 7) {
    insights.personalityIndicators.push("Appears confident and approachable");
  }
  if (ratings.grooming >= 8) {
    insights.personalityIndicators.push("Shows attention to detail and self-care");
  }

  // Generate recommendations
  if (avgRating >= 8) {
    insights.recommendations.push("You have strong natural features - focus on maintaining your current routine");
    insights.recommendations.push("Consider subtle enhancements to highlight your best features");
  } else if (avgRating >= 6) {
    insights.recommendations.push("You have good potential - small improvements can make a big difference");
    insights.recommendations.push("Focus on grooming consistency and finding your best styling approach");
  } else {
    insights.recommendations.push("Start with basic grooming fundamentals and gradually build your routine");
    insights.recommendations.push("Small daily improvements will compound over time");
  }

  // Add specific advice
  if (analysis.specificSuggestions) {
    Object.entries(analysis.specificSuggestions).forEach(([category, suggestions]) => {
      if (suggestions && suggestions.length > 0) {
        insights.specificAdvice.push({
          category: category,
          suggestions: suggestions.slice(0, 3)
        });
      }
    });
  }

  return insights;
}

/**
 * Generate category breakdown with interpretations
 */
function generateCategoryBreakdown(ratings) {
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
}

/**
 * Calculate confidence score for the analysis
 */
function calculateConfidence(analysis) {
  let confidence = analysis.confidence || 0.8;

  if (analysis.rating) {
    const ratings = Object.values(analysis.rating).filter(r => typeof r === 'number');
    const avgRating = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
    const variance = ratings.reduce((sum, r) => sum + Math.pow(r - avgRating, 2), 0) / ratings.length;

    if (variance > 4) {
      confidence *= 0.9;
    }
  }

  return Math.max(0.1, Math.min(1.0, confidence));
}

/**
 * Get rating level description
 */
function getRatingLevel(rating) {
  if (rating >= 9) return 'Excellent';
  if (rating >= 7) return 'Good';
  if (rating >= 5) return 'Average';
  if (rating >= 3) return 'Below Average';
  return 'Needs Improvement';
}

/**
 * Get category-specific description
 */
function getCategoryDescription(category, rating) {
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
}

/**
 * Get priority level for improvement
 */
function getPriorityLevel(rating) {
  if (rating < 4) return 'high';
  if (rating < 6) return 'medium';
  return 'low';
}

/**
 * Format category name for display
 */
function formatCategoryName(category) {
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
}

/**
 * Generate personalized improvement plan
 */
function generateImprovementPlan(analysis) {
  const plan = {
    immediate: { actions: [], timeframe: '1-7 days' },
    shortTerm: { actions: [], timeframe: '1-4 weeks' },
    longTerm: { actions: [], timeframe: '1-6 months' }
  };

  if (!analysis.rating) return plan;

  if (analysis.suggestions) {
    plan.immediate.actions = analysis.suggestions.immediate || [];
    plan.shortTerm.actions = analysis.suggestions.styling || [];
    plan.longTerm.actions = analysis.suggestions.longTerm || [];
  }

  return plan;
}
