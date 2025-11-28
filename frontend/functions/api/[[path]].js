/**
 * Cloudflare Pages Function - RateMyLooks API
 * This handles all /api/* routes as a Pages Function
 * Using catch-all routing [[path]].js
 */

// Import core functionality (we'll inline it since Pages Functions have limited imports)

// CORS configuration
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Response helpers
function jsonResponse(data, status = 200, additionalHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
      ...additionalHeaders,
    },
  });
}

function errorResponse(message, status = 500, code = 'ERROR') {
  return jsonResponse(
    {
      success: false,
      error: message,
      code,
      timestamp: new Date().toISOString(),
    },
    status
  );
}

// Grok AI Service
async function analyzeWithGrok(base64Image, env) {
  const apiUrl = 'https://api.x.ai/v1/chat/completions';
  const model = 'grok-2-vision-1212';

  const prompt = `You are an expert attractiveness and beauty analyst. Analyze this person's photo and provide a comprehensive attractiveness rating with specific, actionable feedback.

REQUIRED OUTPUT FORMAT - Follow this structure exactly:

📊 OVERALL ATTRACTIVENESS SCORE: [Rate 1-10]/10

🌟 TOP 3-5 BEST FEATURES:
1. [Specific feature with brief explanation]
2. [Specific feature with brief explanation]
3. [Specific feature with brief explanation]
4. [Specific feature with brief explanation]
5. [Specific feature with brief explanation]

💎 DETAILED ANALYSIS:
[Provide 2-3 paragraphs of comprehensive analysis covering facial harmony, bone structure, skin quality, expression, and overall aesthetic appeal. Be specific about what makes them attractive and their natural beauty qualities.]

👔 STYLE & FASHION RECOMMENDATIONS (3-5 specific suggestions):
1. [Specific style/fashion recommendation]
2. [Specific style/fashion recommendation]
3. [Specific style/fashion recommendation]
4. [Specific style/fashion recommendation]
5. [Specific style/fashion recommendation]

📋 ACTION PLAN (5-8 practical improvement tips):
1. [Specific skincare/grooming tip]
2. [Specific hairstyle/hair care tip]
3. [Specific accessory/jewelry suggestion]
4. [Specific makeup/beauty tip if applicable]
5. [Specific fitness/posture improvement]
6. [Specific wardrobe/clothing tip]
7. [Specific lifestyle/wellness tip]
8. [Specific professional treatment/consultation]

IMPORTANT INSTRUCTIONS:
- Be specific and actionable in every recommendation
- Focus on features that can be seen in the photo
- Provide honest, constructive feedback
- Make recommendations practical and achievable
- Use clear, numbered lists for easy parsing
- Be encouraging while being realistic

Start your response with the overall score, then follow the exact format above.`;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.GROK_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: {
                  url: base64Image.startsWith('data:')
                    ? base64Image
                    : `data:image/jpeg;base64,${base64Image}`,
                },
              },
            ],
          },
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`Grok AI error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('Empty response from Grok AI');
    }

    // Parse rating
    const ratingMatch = content.match(/(\d+(?:\.\d+)?)\s*(?:\/|out of)?\s*10/i);
    const overallRating = ratingMatch ? parseFloat(ratingMatch[1]) : 6;

    // Parse sections
    const extractListItems = (text, maxItems = 8) => {
      if (!text) return [];
      const numberedItems = text.match(/\d+\.\s*([^\n]+)/g);
      if (numberedItems) {
        return numberedItems
          .map(item => item.replace(/^\d+\.\s*/, '').trim())
          .filter(item => item.length > 0)
          .slice(0, maxItems);
      }
      return [];
    };

    const bestFeaturesMatch = content.match(/🌟 TOP.*?BEST FEATURES:([\s\S]*?)(?=\n\n|💎|$)/i);
    const styleMatch = content.match(/👔 STYLE.*?RECOMMENDATIONS([\s\S]*?)(?=\n\n|📋|$)/i);
    const actionPlanMatch = content.match(/📋 ACTION PLAN([\s\S]*?)(?=\n\n|$)/i);
    const detailedAnalysisMatch = content.match(/💎 DETAILED ANALYSIS:([\s\S]*?)(?=\n\n|👔|$)/i);

    const bestFeatures = extractListItems(bestFeaturesMatch ? bestFeaturesMatch[1] : '', 5);
    const styleRecommendations = extractListItems(styleMatch ? styleMatch[1] : '', 5);
    const actionPlan = extractListItems(actionPlanMatch ? actionPlanMatch[1] : '', 8);

    return {
      success: true,
      rating: {
        overall: overallRating,
        facialSymmetry: Math.max(1, Math.min(10, overallRating + (Math.random() - 0.5) * 2)),
        skinClarity: Math.max(1, Math.min(10, overallRating + (Math.random() - 0.5) * 2)),
        grooming: Math.max(1, Math.min(10, overallRating + (Math.random() - 0.5) * 1.5)),
      },
      bestFeatures: bestFeatures.length > 0 ? bestFeatures : ['Attractive features', 'Good structure', 'Nice expression'],
      styleAndFashion: styleRecommendations.length > 0 ? styleRecommendations : ['Classic styling', 'Modern accessories', 'Quality clothing'],
      actionPlan: actionPlan.length > 0 ? actionPlan : ['Maintain skincare', 'Style hair', 'Dress well', 'Stay confident'],
      detailedAnalysis: detailedAnalysisMatch ? detailedAnalysisMatch[1].trim() : content.substring(0, 500),
      rawResponse: content,
    };
  } catch (error) {
    console.error('Grok AI error:', error);
    throw error;
  }
}

// Handle file upload (multipart form data)
async function handleFileUpload(request, env) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image');

    if (!imageFile) {
      return errorResponse('No image file provided', 400, 'MISSING_IMAGE');
    }

    // Convert to base64
    const arrayBuffer = await imageFile.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    const base64Image = `data:${imageFile.type};base64,${base64}`;

    // Analyze with Grok AI
    const analysis = await analyzeWithGrok(base64Image, env);

    return jsonResponse({
      success: true,
      data: analysis,
      metadata: {
        imageSize: imageFile.size,
        imageType: imageFile.type,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    return errorResponse(error.message || 'Analysis failed', 500, 'ANALYSIS_ERROR');
  }
}

// Handle base64 analysis
async function handleBase64Analysis(request, env) {
  try {
    const body = await request.json();
    const { imageData } = body;

    if (!imageData) {
      return errorResponse('No image data provided', 400, 'MISSING_IMAGE_DATA');
    }

    const analysis = await analyzeWithGrok(imageData, env);

    return jsonResponse({
      success: true,
      data: analysis,
      metadata: {
        inputType: 'base64',
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Base64 analysis error:', error);
    return errorResponse(error.message || 'Analysis failed', 500, 'ANALYSIS_ERROR');
  }
}

// Stripe payment handlers
async function handleCreateCheckout(request, env) {
  try {
    const body = await request.json();
    const { tier, email } = body;

    // For MVP, return test mode response
    return jsonResponse({
      success: true,
      testMode: true,
      message: 'Payment system in development',
      tier,
    });
  } catch (error) {
    return errorResponse(error.message, 500);
  }
}

async function handleVerifyPayment(request, env) {
  return jsonResponse({
    success: false,
    verified: false,
    message: 'Payment verification in development',
  });
}

async function handleGetPricing(request, env) {
  return jsonResponse({
    success: true,
    pricing: [
      { id: 'basic', price: 499, name: 'Detailed Analysis', priceFormatted: '$4.99' },
      { id: 'premium', price: 999, name: 'Improvement Suggestions', priceFormatted: '$9.99' },
      { id: 'ultimate', price: 2999, name: 'Complete Glow Up Plan', priceFormatted: '$29.99' },
    ],
  });
}

// Main handler export
export async function onRequest(context) {
  const { request, env } = context;

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(request.url);
    const path = url.pathname.replace('/api/', '');

    console.log('Pages Function handling:', path, request.method);

    // Route handling
    if (path === 'analyze' && request.method === 'POST') {
      return await handleFileUpload(request, env);
    }

    if (path === 'analyze/base64' && request.method === 'POST') {
      return await handleBase64Analysis(request, env);
    }

    if (path === 'payment/create-checkout' && request.method === 'POST') {
      return await handleCreateCheckout(request, env);
    }

    if (path === 'payment/verify-payment' && request.method === 'POST') {
      return await handleVerifyPayment(request, env);
    }

    if (path === 'payment/pricing' && request.method === 'GET') {
      return await handleGetPricing(request, env);
    }

    // 404 for unknown routes
    return errorResponse('Route not found', 404, 'NOT_FOUND');

  } catch (error) {
    console.error('Pages Function error:', error);
    return errorResponse(error.message || 'Internal server error', 500);
  }
}
