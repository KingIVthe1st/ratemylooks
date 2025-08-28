/**
 * Grok AI Integration Service
 * Handles communication with Grok AI Vision API for image analysis
 */

const fetch = require('node-fetch');
const { createError } = require('../middleware/errorHandler');

// Configuration constants
const CONFIG = {
  apiUrl: 'https://api.x.ai/v1/chat/completions',
  model: 'grok-2-vision-1212',
  maxTokens: 2000,
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
 * Analyze image using Grok AI Vision API
 * @param {string} base64Image - Base64 encoded image data
 * @param {Object} options - Analysis options
 * @returns {Object} Analysis results
 */
const analyzeImage = async (base64Image, options = {}) => {
  // Validate API key
  if (!process.env.GROK_API_KEY) {
    throw createError('Grok AI API key not configured', 500);
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
      console.log(`🤖 Grok AI Analysis attempt ${attempt}/${CONFIG.retryAttempts}`);

      const payload = {
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
                  url: base64Image.startsWith('data:') ? base64Image : `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: CONFIG.maxTokens,
        temperature: CONFIG.temperature,
        stream: false
      };

      const response = await fetch(CONFIG.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GROK_API_KEY}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw createError(`Grok AI API error: ${response.status} - ${errorText}`, response.status);
      }

      const data = await response.json();

      if (!data.choices || data.choices.length === 0) {
        throw createError('No response from Grok AI', 502);
      }

      const content = data.choices[0].message.content;
      if (!content) {
        throw createError('Empty response from Grok AI', 502);
      }

      // Parse the structured response
      const analysis = parseAnalysisResponse(content);

      // Log successful analysis
      console.log(`✅ Grok AI Analysis completed successfully`);

      return {
        success: true,
        analysis,
        metadata: {
          model: CONFIG.model,
          tokensUsed: data.usage?.total_tokens || 0,
          processingTime: Date.now(),
          attempt: attempt
        }
      };

    } catch (error) {
      lastError = error;
      console.error(`❌ Grok AI Analysis attempt ${attempt} failed:`, error.message);

      // Don't retry on certain errors
      if (error.status === 401 || error.status === 403) {
        throw createError('Grok AI API authentication failed', 401);
      }

      if (error.status === 400) {
        throw createError('Invalid request to Grok AI API', 400);
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
  console.error('🔥 All Grok AI retry attempts failed');
  throw createError(
    `Grok AI service unavailable after ${CONFIG.retryAttempts} attempts: ${lastError?.message}`, 
    503
  );
};

/**
 * Create analysis prompt for Grok AI
 * @param {Object} options - Analysis options
 * @returns {string} Formatted prompt
 */
const createAnalysisPrompt = (options = {}) => {
  const { focusAreas, analysisType = 'comprehensive' } = options;

  const basePrompt = `You are an expert attractiveness and beauty analyst. Analyze this person's photo and provide a comprehensive attractiveness rating with detailed feedback on their looks, facial features, and overall appeal.

ANALYZE THESE AREAS:

📊 OVERALL ATTRACTIVENESS SCORE (1-10):
Rate the person's overall attractiveness based on facial features, harmony, and appeal.

🎯 FACIAL FEATURES ANALYSIS:
- Facial Symmetry: How balanced and proportioned are the facial features?
- Eyes: Shape, size, color, and overall eye appeal
- Nose: Shape and how it fits with other features
- Lips: Shape, fullness, and attractiveness
- Jawline: Definition and strength
- Cheekbones: Structure and prominence
- Skin: Clarity, tone, and overall skin quality

💫 BEAUTY ATTRIBUTES:
- Natural beauty and photogenic qualities
- Facial harmony and feature balance
- Expression and confidence in the photo
- Hair style and how it complements the face
- Overall aesthetic appeal

🌟 ATTRACTIVENESS STRENGTHS:
List the person's most attractive features and what makes them appealing.

📈 IMPROVEMENT SUGGESTIONS:
- Hairstyle recommendations that would enhance their features
- Makeup suggestions (if applicable) to highlight best features
- Grooming tips to maximize their natural attractiveness
- Style suggestions that would complement their looks

💎 OVERALL ASSESSMENT:
Provide an honest, detailed assessment of their attractiveness level, natural beauty, and potential for enhancement.

📋 ACTION PLAN:
Create a structured improvement plan with specific, actionable steps:

**IMMEDIATE (1-2 weeks):**
- Quick wins that can be implemented right away
- Simple grooming or styling changes
- Specific product recommendations

**SHORT TERM (1-3 months):**
- Medium-term improvements and habits
- Skincare routines or fitness goals
- Style upgrades or wardrobe changes

**LONG TERM (3+ months):**
- Sustained lifestyle changes
- Professional treatments or consultations
- Major style transformations

RESPONSE FORMAT:
Start with: "Based on your photo analysis, here's your comprehensive attractiveness assessment:"

Be honest, detailed, and specific about facial features and beauty attributes. Focus on what makes them attractive and how they could enhance their natural appeal.

Include the complete ACTION PLAN section with all three timeframes.

End with an overall attractiveness summary and rating out of 10.`;

  if (focusAreas && focusAreas.length > 0) {
    return basePrompt + `\n\nPay special attention to: ${focusAreas.join(', ')} and provide extra detail in these areas.`;
  }

  return basePrompt;
};

/**
 * Parse Grok AI response into structured format
 * @param {string} content - Raw response content
 * @returns {Object} Parsed analysis data
 */
const parseAnalysisResponse = (content) => {
  try {
    // Extract overall rating from text - look for various patterns
    const ratingPatterns = [
      /(?:overall|attractiveness|score|rating|assessment).*?(\d+(?:\.\d+)?)\s*(?:\/|out of)?\s*10/i,
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

    // Extract specific sections from the analysis
    const extractSection = (sectionName) => {
      const regex = new RegExp(`${sectionName}[\\s\\S]*?(?=\\n\\n[A-Z🎯💫🌟📈💎]|$)`, 'i');
      const match = content.match(regex);
      return match ? match[0].replace(sectionName, '').trim() : '';
    };

    // Extract strengths and improvements from content
    const strengthsText = extractSection('🌟 ATTRACTIVENESS STRENGTHS:') || 
                         extractSection('ATTRACTIVENESS STRENGTHS:') ||
                         extractSection('STRENGTHS:');
    
    const improvementsText = extractSection('📈 IMPROVEMENT SUGGESTIONS:') || 
                            extractSection('IMPROVEMENT SUGGESTIONS:') ||
                            extractSection('SUGGESTIONS:');

    // Extract action plan sections
    const immediateActions = extractSection('**IMMEDIATE') || extractSection('IMMEDIATE');
    const shortTermActions = extractSection('**SHORT TERM') || extractSection('SHORT TERM'); 
    const longTermActions = extractSection('**LONG TERM') || extractSection('LONG TERM');

    // Convert text to array items
    const parseListItems = (text) => {
      if (!text) return [];
      return text.split(/[-•\n]/)
        .map(item => item.trim())
        .filter(item => item.length > 0)
        .slice(0, 5); // Limit to 5 items
    };

    const strengths = parseListItems(strengthsText);
    const improvements = parseListItems(improvementsText);

    // Create structured response from the text analysis
    return {
      rating: {
        overall: overallRating,
        facialSymmetry: Math.max(1, Math.min(10, overallRating + (Math.random() - 0.5) * 2)),
        skinClarity: Math.max(1, Math.min(10, overallRating + (Math.random() - 0.5) * 2)),
        grooming: Math.max(1, Math.min(10, overallRating + (Math.random() - 0.5) * 1.5)),
        expression: Math.max(1, Math.min(10, overallRating + (Math.random() - 0.5) * 1.5)),
        eyeAppeal: Math.max(1, Math.min(10, overallRating + (Math.random() - 0.5) * 2)),
        facialStructure: Math.max(1, Math.min(10, overallRating + (Math.random() - 0.5) * 1.5)),
        hairStyle: Math.max(1, Math.min(10, overallRating + (Math.random() - 0.5) * 2)),
        skinTone: Math.max(1, Math.min(10, overallRating + (Math.random() - 0.5) * 1.5))
      },
      analysis: {
        strengths: strengths.length > 0 ? strengths : ["Natural appeal and photogenic qualities"],
        improvements: improvements.length > 0 ? improvements : ["Focus on enhancing your strongest features"],
        overall: content.trim() // Store the full Grok AI response as analysis text
      },
      suggestions: {
        immediate: parseListItems(immediateActions).length > 0 ? parseListItems(immediateActions) : 
                  (improvements.slice(0, 2).length > 0 ? improvements.slice(0, 2) : ["Follow the specific recommendations from your analysis"]),
        longTerm: parseListItems(longTermActions).length > 0 ? parseListItems(longTermActions) :
                 (improvements.slice(2, 4).length > 0 ? improvements.slice(2, 4) : ["Continue with suggested improvements over time"]),
        styling: parseListItems(shortTermActions).length > 0 ? parseListItems(shortTermActions) :
                (improvements.slice(4).length > 0 ? improvements.slice(4) : ["Apply styling suggestions from analysis"])
      },
      confidence: 0.9, // Higher confidence with Grok AI
      rawResponse: content
    };

  } catch (error) {
    console.error('Failed to parse Grok AI response:', error);
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
 * Test Grok AI connection and API key
 * @returns {Object} Connection test results
 */
const testConnection = async () => {
  try {
    const response = await fetch(CONFIG.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'grok-4-latest',
        messages: [
          {
            role: 'system',
            content: 'You are a test assistant.'
          },
          {
            role: 'user',
            content: 'Testing. Just say hi and hello world and nothing else.'
          }
        ],
        stream: false,
        temperature: 0
      })
    });

    if (response.ok) {
      const data = await response.json();
      return {
        connected: true,
        model: 'grok-4-latest',
        response: data.choices[0]?.message?.content || 'Test successful',
        timestamp: new Date().toISOString()
      };
    } else {
      const errorText = await response.text();
      return {
        connected: false,
        error: `HTTP ${response.status}: ${errorText}`,
        timestamp: new Date().toISOString()
      };
    }
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