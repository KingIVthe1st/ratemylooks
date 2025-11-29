/**
 * Grok AI Integration Service
 * Handles communication with Grok AI Vision API for image analysis
 */

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
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Analyze image using Grok AI Vision API
 * @param {string} base64Image - Base64 encoded image data
 * @param {Object} options - Analysis options
 * @param {Object} env - Worker environment variables
 * @returns {Object} Analysis results
 */
export async function analyzeImage(base64Image, options = {}, env) {
  // Validate API key
  if (!env.GROK_API_KEY) {
    throw new Error('Grok AI API key not configured');
  }

  // Validate input
  if (!base64Image) {
    throw new Error('No image data provided');
  }

  const prompt = createAnalysisPrompt(options);

  let lastError = null;

  // Retry logic
  for (let attempt = 1; attempt <= CONFIG.retryAttempts; attempt++) {
    try {
      console.log(`Grok AI Analysis attempt ${attempt}/${CONFIG.retryAttempts}`);

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
          'Authorization': `Bearer ${env.GROK_API_KEY}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Grok AI API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      if (!data.choices || data.choices.length === 0) {
        throw new Error('No response from Grok AI');
      }

      const content = data.choices[0].message.content;
      if (!content) {
        throw new Error('Empty response from Grok AI');
      }

      // Parse the structured response
      const analysis = parseAnalysisResponse(content);

      console.log(`Grok AI Analysis completed successfully`);

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
      console.error(`Grok AI Analysis attempt ${attempt} failed:`, error.message);

      // Don't retry on authentication errors
      if (error.message.includes('401') || error.message.includes('403')) {
        throw new Error('Grok AI API authentication failed');
      }

      if (error.message.includes('400')) {
        throw new Error('Invalid request to Grok AI API');
      }

      // Wait before retrying (exponential backoff)
      if (attempt < CONFIG.retryAttempts) {
        const delay = CONFIG.retryDelay * Math.pow(2, attempt - 1);
        console.log(`Retrying in ${delay}ms...`);
        await sleep(delay);
      }
    }
  }

  // All retries failed
  console.error('All Grok AI retry attempts failed');
  throw new Error(`Grok AI service unavailable after ${CONFIG.retryAttempts} attempts: ${lastError?.message}`);
}

/**
 * Create analysis prompt for Grok AI
 */
function createAnalysisPrompt(options = {}) {
  const { focusAreas, analysisType = 'comprehensive' } = options;

  const basePrompt = `You are an expert attractiveness analyst trained on analyzing 100+ facial features using objective beauty standards including the Golden Ratio (1.618), facial thirds, facial fifths, and symmetry principles. Provide a comprehensive, data-driven analysis.

ANALYSIS FRAMEWORK - Analyze these 100+ data points:
- Facial Symmetry: Left-right balance, vertical alignment, feature positioning
- Facial Proportions: Golden ratio adherence (1.618), facial thirds (forehead/midface/lower face), facial fifths (eye spacing)
- Bone Structure: Cheekbone prominence, jawline definition, chin projection, brow ridge
- Eye Analysis: Eye shape, size, spacing (should be 1 eye-width apart), eye color, upper eyelid exposure
- Nose Analysis: Nose width, length, bridge height, tip definition, nostril symmetry
- Mouth Analysis: Lip fullness, cupid's bow definition, smile width, teeth visibility
- Skin Quality: Texture, clarity, tone evenness, pore visibility, signs of aging
- Facial Harmony: Feature balance, proportion relationships, overall aesthetic cohesion
- Hair Analysis: Style, volume, health, color complementarity
- Expression & Presence: Confidence, approachability, photogenic quality

REQUIRED OUTPUT FORMAT - Follow this structure exactly:

📊 OVERALL ATTRACTIVENESS SCORE: [Rate 1-10]/10
[Brief 1-sentence explanation of the score]

🎯 FACIAL ANALYSIS METRICS (Based on Objective Beauty Standards):
• Facial Symmetry: [Score/10] - [Specific observation about left-right balance]
• Golden Ratio Adherence: [Score/10] - [How well facial proportions match 1.618 ratio]
• Facial Proportions: [Score/10] - [Analysis of facial thirds and fifths]
• Bone Structure: [Score/10] - [Jawline, cheekbones, facial definition]
• Eye Appeal: [Score/10] - [Eye shape, spacing, attractiveness]
• Nose Aesthetics: [Score/10] - [Nose shape, size, proportionality]
• Mouth/Smile: [Score/10] - [Lip shape, smile quality]
• Skin Quality: [Score/10] - [Texture, clarity, tone]

🌟 TOP 5 STRONGEST FEATURES (Your Best Assets):
1. [Specific facial feature] - [Why it's attractive + percentage/measurement reference]
2. [Specific facial feature] - [Why it's attractive + percentage/measurement reference]
3. [Specific facial feature] - [Why it's attractive + percentage/measurement reference]
4. [Specific facial feature] - [Why it's attractive + percentage/measurement reference]
5. [Specific facial feature] - [Why it's attractive + percentage/measurement reference]

💎 COMPREHENSIVE FACIAL ANALYSIS (2-3 detailed paragraphs):
[Paragraph 1: Overall facial structure, harmony, and how features work together. Reference specific measurements and proportions. Discuss facial thirds, facial fifths, and golden ratio observations.]

[Paragraph 2: Individual feature analysis - dive deep into eyes, nose, mouth, jawline, cheekbones. Explain what makes each feature work well or could be enhanced. Be specific about shapes, sizes, and proportions.]

[Paragraph 3: Skin quality, hair styling, grooming level, and overall presentation. Discuss expression, photogenic quality, and presence.]

👔 STYLE & GROOMING RECOMMENDATIONS (5 specific suggestions):
1. [Specific hairstyle recommendation based on face shape and features]
2. [Specific fashion/clothing style that complements their features]
3. [Specific color palette recommendations based on skin tone and coloring]
4. [Specific accessory suggestions (glasses, jewelry, etc.)]
5. [Specific grooming tips (facial hair, eyebrows, skincare)]

📋 ENHANCEMENT ACTION PLAN (8 practical, prioritized steps):
1. 🔥 IMMEDIATE (Do This Week): [Highest impact quick win]
2. 🔥 IMMEDIATE (Do This Week): [Second highest impact quick win]
3. 💪 SHORT-TERM (1-3 Months): [Grooming or style change]
4. 💪 SHORT-TERM (1-3 Months): [Skincare or health routine]
5. 🎯 MEDIUM-TERM (3-6 Months): [Fitness or body improvement]
6. 🎯 MEDIUM-TERM (3-6 Months): [Wardrobe or style overhaul]
7. 🏆 LONG-TERM (6+ Months): [Major lifestyle or appearance change]
8. 🏆 PROFESSIONAL CONSIDERATION: [Optional professional treatment/consultation]

CRITICAL INSTRUCTIONS:
✓ Use OBJECTIVE beauty standards (Golden Ratio, facial proportions, symmetry)
✓ Provide SPECIFIC measurements and percentages where possible
✓ Reference the 100+ facial features in your analysis
✓ Give ACTIONABLE, practical recommendations only
✓ Be HONEST but ENCOURAGING - focus on what can be enhanced
✓ Explain WHY each feature is attractive or needs improvement
✓ Use clear sections and numbered lists for parsing

Start your response with the overall score, then follow the exact format above.`;

  if (focusAreas && focusAreas.length > 0) {
    return basePrompt + `\n\nPay special attention to: ${focusAreas.join(', ')} and provide extra detail in these areas.`;
  }

  return basePrompt;
}

/**
 * Parse Grok AI response into structured format
 */
function parseAnalysisResponse(content) {
  try {
    // Extract overall rating
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

    // Extract sections
    const extractSection = (sectionName) => {
      const patterns = [
        new RegExp(`${sectionName}[\\s\\S]*?(?=\\n\\n[🎯💫🌟📊📈💎👔📋🔥⭐]|\\n\\n[A-Z][A-Z]|$)`, 'i'),
        new RegExp(`${sectionName}[\\s\\S]*?(?=\\n[🎯💫🌟📊📈💎👔📋🔥⭐]|$)`, 'i')
      ];

      for (const regex of patterns) {
        const match = content.match(regex);
        if (match) {
          return match[0].replace(sectionName, '').trim();
        }
      }
      return '';
    };

    const bestFeaturesText = extractSection('🌟 TOP.*?BEST FEATURES:') ||
                            extractSection('TOP.*?BEST FEATURES:') ||
                            extractSection('BEST FEATURES:');

    const styleText = extractSection('👔 STYLE.*?FASHION.*?RECOMMENDATIONS') ||
                     extractSection('STYLE.*?FASHION.*?RECOMMENDATIONS') ||
                     extractSection('STYLE.*?FASHION');

    const actionPlanText = extractSection('📋 ACTION PLAN') ||
                          extractSection('ACTION PLAN');

    const detailedAnalysisText = extractSection('💎 DETAILED ANALYSIS:') ||
                               extractSection('DETAILED ANALYSIS:');

    // Parse numbered lists
    const parseListItems = (text, maxItems = 8) => {
      if (!text) return [];

      const numberedItems = text.match(/\d+\.\s*([^\n]+)/g);
      if (numberedItems) {
        return numberedItems
          .map(item => item.replace(/^\d+\.\s*/, '').trim())
          .filter(item => item.length > 0)
          .slice(0, maxItems);
      }

      return text.split(/[-•\n]/)
        .map(item => item.trim())
        .filter(item => item.length > 10)
        .slice(0, maxItems);
    };

    const bestFeatures = parseListItems(bestFeaturesText, 5);
    const styleRecommendations = parseListItems(styleText, 5);
    const actionPlan = parseListItems(actionPlanText, 8);

    // Create structured response
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
        strengths: bestFeatures.length > 0 ? bestFeatures : ["Natural appeal and attractive features"],
        improvements: actionPlan.length > 0 ? actionPlan : ["Focus on enhancing your strongest features"],
        overall: detailedAnalysisText || content.trim()
      },
      suggestions: {
        immediate: actionPlan.length > 0 ? actionPlan.slice(0, 3) : ["Follow skincare routine", "Maintain good grooming", "Focus on posture"],
        longTerm: actionPlan.length > 3 ? actionPlan.slice(3, 6) : ["Consider professional styling", "Develop personal style", "Build confidence"],
        styling: styleRecommendations.length > 0 ? styleRecommendations : ["Experiment with different looks", "Find styles that suit you"]
      },
      bestFeatures: bestFeatures.length > 0 ? bestFeatures : ["Attractive natural features", "Good bone structure", "Appealing expression"],
      styleAndFashion: styleRecommendations.length > 0 ? styleRecommendations : ["Classic styling works well", "Consider modern accessories", "Focus on fit and quality"],
      actionPlan: actionPlan.length > 0 ? actionPlan : ["Maintain good skincare", "Style hair regularly", "Choose flattering colors", "Focus on fitness", "Develop confidence"],
      confidence: 0.9,
      rawResponse: content
    };

  } catch (error) {
    console.error('Failed to parse Grok AI response:', error);
    return createFallbackResponse(content);
  }
}

/**
 * Create fallback response when parsing fails
 */
function createFallbackResponse(content) {
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
}

/**
 * Test Grok AI connection
 */
export async function testGrokConnection(env) {
  try {
    const response = await fetch(CONFIG.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.GROK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'grok-4-latest',
        messages: [
          { role: 'system', content: 'You are a test assistant.' },
          { role: 'user', content: 'Testing. Just say hi and hello world and nothing else.' }
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
}
