/**
 * OpenAI Integration Service
 * Handles communication with OpenAI Vision API for image analysis
 */

const OpenAI = require('openai');
const { createError } = require('../middleware/errorHandler');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Configuration constants
const CONFIG = {
  model: 'gpt-4-vision-preview',
  maxTokens: 1000,
  temperature: 0.7,
  retryAttempts: 3,
  retryDelay: 1000, // ms
};

/**
 * Sleep function for retry delays
 * @param {number} ms - Milliseconds to sleep
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Analyze image using OpenAI Vision API
 * @param {string} base64Image - Base64 encoded image data
 * @param {Object} options - Analysis options
 * @returns {Object} Analysis results
 */
const analyzeImage = async (base64Image, options = {}) => {
  // Validate API key
  if (!process.env.OPENAI_API_KEY) {
    throw createError('OpenAI API key not configured', 500);
  }

  // Validate input
  if (!base64Image) {
    throw createError('No image data provided', 400);
  }

  const prompt = createAnalysisPrompt(options);

  let lastError = null;

  // Retry logic
  for (let attempt = 1; attempt <= CONFIG.retryAttempts; attempt++) {
    try {
      console.log(`🤖 OpenAI Analysis attempt ${attempt}/${CONFIG.retryAttempts}`);

      const response = await openai.chat.completions.create({
        model: CONFIG.model,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: base64Image,
                  detail: 'high'
                }
              }
            ]
          }
        ],
        max_tokens: CONFIG.maxTokens,
        temperature: CONFIG.temperature,
      });

      if (!response.choices || response.choices.length === 0) {
        throw createError('No response from OpenAI', 502);
      }

      const content = response.choices[0].message.content;
      if (!content) {
        throw createError('Empty response from OpenAI', 502);
      }

      // Parse the structured response
      const analysis = parseAnalysisResponse(content);

      // Log successful analysis
      console.log(`✅ OpenAI Analysis completed successfully`);

      return {
        success: true,
        analysis,
        metadata: {
          model: CONFIG.model,
          tokensUsed: response.usage?.total_tokens || 0,
          processingTime: Date.now(),
          attempt: attempt
        }
      };

    } catch (error) {
      lastError = error;
      console.error(`❌ OpenAI Analysis attempt ${attempt} failed:`, error.message);

      // Don't retry on certain errors
      if (error.status === 401 || error.status === 403) {
        throw createError('OpenAI API authentication failed', 401);
      }

      if (error.status === 400) {
        throw createError('Invalid request to OpenAI API', 400);
      }

      // Wait before retrying (exponential backoff)
      if (attempt < CONFIG.retryAttempts) {
        const delay = CONFIG.retryDelay * Math.pow(2, attempt - 1);
        console.log(`⏳ Retrying in ${delay}ms...`);
        await sleep(delay);
      }
    }
  }

  // All retries failed
  console.error('🔥 All OpenAI retry attempts failed');
  throw createError(
    `OpenAI service unavailable after ${CONFIG.retryAttempts} attempts: ${lastError?.message}`, 
    503
  );
};

/**
 * Create analysis prompt for OpenAI
 * @param {Object} options - Analysis options
 * @returns {string} Formatted prompt
 */
const createAnalysisPrompt = (options = {}) => {
  const { focusAreas, analysisType = 'comprehensive' } = options;

  const basePrompt = `You are an expert aesthetic analyst and style consultant providing detailed, constructive feedback on facial attractiveness. Analyze this photo thoroughly and provide feedback in the following JSON format:

{
  "rating": {
    "overall": [number from 1-10],
    "facialSymmetry": [number from 1-10],
    "skinClarity": [number from 1-10],
    "grooming": [number from 1-10],
    "expression": [number from 1-10],
    "eyeAppeal": [number from 1-10],
    "facialStructure": [number from 1-10],
    "hairStyle": [number from 1-10],
    "skinTone": [number from 1-10]
  },
  "detailedAnalysis": {
    "faceShape": "description of face shape (oval, round, square, heart, diamond, etc.)",
    "eyeShape": "description of eye shape and characteristics",
    "eyebrowShape": "description of eyebrow shape and thickness",
    "noseShape": "description of nose characteristics",
    "lipShape": "description of lip shape and fullness",
    "jawlineDefinition": "description of jawline strength and definition",
    "cheekboneStructure": "description of cheekbone prominence",
    "skinTexture": "detailed skin analysis",
    "hairTexture": "hair type and current styling",
    "overallHarmony": "how features work together"
  },
  "analysis": {
    "strengths": ["list of specific positive features with details"],
    "improvements": ["constructive suggestions for enhancement"],
    "overall": "detailed overall assessment"
  },
  "specificSuggestions": {
    "hairstyles": ["specific hairstyle recommendations based on face shape"],
    "eyebrowStyling": ["specific eyebrow shaping suggestions"],
    "skincare": ["targeted skincare recommendations"],
    "accessories": ["accessory suggestions like glasses frames, earrings, etc."],
    "grooming": ["specific grooming improvements"],
    "styling": ["clothing necklines, collar types that would flatter"]
  },
  "actionableSteps": {
    "immediate": ["changes you can make today"],
    "shortTerm": ["improvements over 1-4 weeks"],
    "longTerm": ["lifestyle changes over months"]
  },
  "confidence": [number from 0.1-1.0 indicating analysis confidence]
}

Guidelines for your analysis:
1. Be extremely detailed and specific in your observations
2. Provide actionable, realistic suggestions (NO surgery recommendations)
3. Consider face shape when suggesting hairstyles
4. Suggest specific eyebrow shapes, hair cuts, accessories
5. Include skincare routine suggestions
6. Consider what accessories would complement their features
7. Be encouraging while being honest about areas for improvement
8. Give specific examples ("try a side part" vs "change your hair")
9. Consider their current styling and suggest improvements
10. Focus only on non-surgical, achievable changes

Analyze every aspect of their appearance in detail and provide comprehensive, actionable advice.`;

  if (focusAreas && focusAreas.length > 0) {
    return basePrompt + `\n\nPay special attention to: ${focusAreas.join(', ')} and provide extra detail in these areas.`;
  }

  return basePrompt;
};

/**
 * Parse OpenAI response into structured format
 * @param {string} content - Raw response content
 * @returns {Object} Parsed analysis data
 */
const parseAnalysisResponse = (content) => {
  try {
    // Try to extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      // Fallback: create structured response from text
      return createFallbackResponse(content);
    }

    const jsonContent = jsonMatch[0];
    const parsed = JSON.parse(jsonContent);

    // Validate required fields
    if (!parsed.rating || !parsed.analysis) {
      return createFallbackResponse(content);
    }

    // Ensure all required rating fields exist
    const requiredRatingFields = ['overall', 'facialSymmetry', 'skinClarity', 'grooming', 'expression', 'eyeAppeal', 'facialStructure'];
    requiredRatingFields.forEach(field => {
      if (!parsed.rating[field]) {
        parsed.rating[field] = parsed.rating.overall || 6;
      }
    });

    // Ensure rating values are within bounds
    const rating = parsed.rating;
    Object.keys(rating).forEach(key => {
      if (typeof rating[key] === 'number') {
        rating[key] = Math.max(1, Math.min(10, rating[key]));
      }
    });

    // Ensure confidence is within bounds
    if (parsed.confidence) {
      parsed.confidence = Math.max(0.1, Math.min(1.0, parsed.confidence));
    } else {
      parsed.confidence = 0.8; // Default confidence
    }

    return parsed;

  } catch (error) {
    console.error('Failed to parse OpenAI response:', error);
    return createFallbackResponse(content);
  }
};

/**
 * Create fallback response when JSON parsing fails
 * @param {string} content - Raw response content
 * @returns {Object} Fallback structured response
 */
const createFallbackResponse = (content) => {
  // Extract potential rating from text
  const ratingMatch = content.match(/(\d+(?:\.\d+)?)\s*(?:\/10|out of 10)/i);
  const overallRating = ratingMatch ? Math.max(1, Math.min(10, parseFloat(ratingMatch[1]))) : 6;

  return {
    rating: {
      overall: overallRating,
      facialSymmetry: overallRating,
      skinClarity: overallRating,
      grooming: overallRating,
      expression: overallRating,
      eyeAppeal: overallRating,
      facialStructure: overallRating,
      hairStyle: overallRating,
      skinTone: overallRating
    },
    detailedAnalysis: {
      faceShape: "Analysis in progress",
      eyeShape: "Analysis in progress",
      eyebrowShape: "Analysis in progress",
      noseShape: "Analysis in progress",
      lipShape: "Analysis in progress",
      jawlineDefinition: "Analysis in progress",
      cheekboneStructure: "Analysis in progress",
      skinTexture: "Analysis in progress",
      hairTexture: "Analysis in progress",
      overallHarmony: "Analysis in progress"
    },
    analysis: {
      strengths: ["Analysis completed"],
      improvements: ["Detailed analysis available in text"],
      overall: content.substring(0, 500) + (content.length > 500 ? '...' : '')
    },
    suggestions: {
      immediate: ["Continue with good grooming habits"],
      longTerm: ["Maintain a healthy lifestyle"],
      styling: ["Experiment with different styles"]
    },
    confidence: 0.6,
    rawResponse: content
  };
};

/**
 * Test OpenAI connection and API key
 * @returns {Object} Connection test results
 */
const testConnection = async () => {
  try {
    const response = await openai.models.list();
    return {
      connected: true,
      models: response.data.length,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      connected: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

module.exports = {
  analyzeImage,
  testConnection,
  CONFIG
};