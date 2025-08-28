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
  model: 'gpt-4o', // Updated to newer vision model
  maxTokens: 1500, // Increased for more detailed analysis
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
                  url: base64Image.startsWith('data:') ? base64Image : `data:image/jpeg;base64,${base64Image}`,
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

  const basePrompt = `You are a professional attractiveness analyst providing detailed, confidence-building feedback. Analyze this person's photo and provide:

1. OVERALL RATING (1-10): Give a fair, encouraging rating
2. FACIAL FEATURES: Comment on eyes, smile, facial structure, skin
3. STYLE & PRESENTATION: Clothing, grooming, overall aesthetic  
4. PHOTO QUALITY: Lighting, angle, composition
5. CONFIDENCE BOOSTERS: Specific positive highlights
6. GENTLE IMPROVEMENTS: 2-3 actionable, kind suggestions
7. FINAL ENCOURAGEMENT: Personal, uplifting message

Be specific, honest but kind, and focus on helping them feel confident while providing genuinely helpful feedback. Make your response personal to what you actually see in their photo.

Format your response as natural, encouraging text - no JSON needed.`;

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
    // Extract overall rating from text
    const ratingMatch = content.match(/(?:OVERALL RATING|overall rating).*?(\d+(?:\.\d+)?)(?:\s*\/?\s*10)?/i);
    const overallRating = ratingMatch ? Math.max(1, Math.min(10, parseFloat(ratingMatch[1]))) : 6;

    // Create structured response from the text analysis
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
      analysis: {
        strengths: ["Detailed analysis provided"],
        improvements: ["Check detailed feedback"],
        overall: content.trim() // This is the key - store the full OpenAI response as analysis text
      },
      suggestions: {
        immediate: ["Follow the specific recommendations"],
        longTerm: ["Continue with suggested improvements"],
        styling: ["Apply styling suggestions from analysis"]
      },
      confidence: 0.85,
      rawResponse: content
    };

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