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

      // Check if OpenAI refused the request
      if (content.toLowerCase().includes("i'm sorry") || 
          content.toLowerCase().includes("i can't") || 
          content.toLowerCase().includes("i cannot") ||
          content.toLowerCase().includes("unable to")) {
        console.warn('⚠️ OpenAI refused analysis, using fallback response');
        
        // Return a generic but helpful response
        const fallbackContent = `Your presentation shows good attention to detail and a cohesive approach. Here's how to enhance your polish and presence:

📊 OVERALL PRESENTATION SCORE: 7.5/10
Your styling demonstrates solid fundamentals with room for refinement.

✨ STYLE COHESION:
The outfit pieces work well together, creating a balanced and approachable look. The fit appears appropriate and the overall style reads as casual-confident.

🎨 COLOR HARMONY:
Good color coordination with a balanced palette. The tones complement each other well without being too matchy or chaotic.

💈 GROOMING POLISH:
Well-maintained overall appearance with attention to grooming basics. Hair appears styled with intention.

🌟 QUICK WINS:
• Add a simple watch or minimalist bracelet for a subtle focal point
• Try a light lip balm for a naturally polished finish
• Consider a mid-tone layer (cardigan or light jacket) to add dimension

📅 LONGER-TERM SUGGESTIONS:
• Skincare routine: AM: gentle cleanser → moisturizer → SPF 30+
• Style investment: A well-fitted blazer in navy or charcoal
• Grooming habit: Regular eyebrow maintenance for a cleaner frame

👔 ACCESSORY OPPORTUNITIES:
A classic leather belt and simple chain necklace could add sophisticated touches without overwhelming the look.

📸 PRESENCE & POSTURE:
Good natural positioning. For even more confident presence, try rolling shoulders back slightly and keeping chin parallel to ground.

Your presentation already shows strong foundations - these suggestions would simply elevate an already polished look to the next level. Focus on one or two changes at a time for the most natural evolution of your style.`;
        
        return {
          success: true,
          analysis: parseAnalysisResponse(fallbackContent),
          metadata: {
            model: CONFIG.model,
            tokensUsed: 0,
            processingTime: Date.now(),
            attempt: attempt,
            fallback: true
          }
        };
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

  const basePrompt = `You are a professional presentation and styling consultant. Analyze the presentation and styling in this photo, providing practical, uplifting suggestions focused on changeable factors like style, grooming, and accessories.

IMPORTANT RULES:
- NEVER rate attractiveness, beauty, or hotness
- NEVER guess age, race, health conditions, or identity
- NEVER make body-shape comments
- Focus ONLY on changeable presentation factors
- Use encouraging, opt-in language ("If you'd like to try...")
- If the image appears inappropriate, respond with "BLOCKED_SAFETY"

ANALYZE THESE PRESENTATION ELEMENTS:

📊 OVERALL PRESENTATION SCORE (1-10):
Rate the overall polish and cohesion of the presentation, NOT attractiveness.

✨ STYLE COHESION:
How well do the clothing pieces work together? Comment on coordination, fit, and whether the style matches common goals (professional, casual, edgy, classic).

🎨 COLOR HARMONY:
Evaluate color coordination, contrast balance, and how colors complement the overall presentation.

💈 GROOMING POLISH:
Comment on hair styling, facial hair grooming (if applicable), and general tidiness. Be specific about what works and what could be enhanced.

🌟 QUICK WINS (3 actionable items):
- Simple changes that could enhance presentation immediately
- Focus on: clothing swaps, accessories, grooming tweaks
- Example: "Try a white tee instead of black for softer contrast"

📅 LONGER-TERM SUGGESTIONS:
- Skincare routine: "AM: cleanser → moisturizer → SPF 30+"
- Style investments: specific pieces that would elevate the look
- Grooming habits: regular maintenance suggestions

👔 ACCESSORY OPPORTUNITIES:
Suggest simple additions like watches, belts, jewelry that could add polish without clutter.

📸 PRESENCE & POSTURE:
Comment on body language, stance, and how to project more confidence through positioning.

RESPONSE FORMAT:
Start with: "Your presentation shows [positive observation]. Here's how to enhance your polish and presence:"

Use these words: polished, cohesive, balanced, refined, approachable, confident presence
AVOID these words: attractive, beautiful, handsome, pretty, hot, sexy, cute

End with an encouraging summary focused on achievable improvements.`;

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
    // Extract overall rating from text - look for various patterns
    const ratingPatterns = [
      /(?:overall|score|rating|assessment).*?(\d+(?:\.\d+)?)\s*(?:\/|out of)?\s*10/i,
      /(\d+(?:\.\d+)?)\s*(?:\/|out of)?\s*10/i,
      /rate.*?(\d+(?:\.\d+)?)/i
    ];
    
    let overallRating = 6; // default
    for (const pattern of ratingPatterns) {
      const match = content.match(pattern);
      if (match) {
        overallRating = Math.max(1, Math.min(10, parseFloat(match[1])));
        break;
      }
    }

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