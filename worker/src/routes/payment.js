/**
 * Payment Route Handlers
 * Handles Stripe payment processing and checkout sessions
 */

import Stripe from 'stripe';
import { createSuccessResponse, createErrorResponse } from '../utils/responses';

// Pricing tiers configuration
const PRICING_TIERS = {
  unlock_results: {
    price: 999, // $9.99
    name: 'Unlock Full Analysis',
    features: [
      'Complete attractiveness rating (0-10)',
      'Detailed facial feature analysis',
      'Your strongest features highlighted',
      'Personalized improvement suggestions',
      'Style and grooming recommendations',
      'Detailed action plan for enhancement'
    ]
  },
  basic: {
    price: 499, // $4.99
    name: 'Detailed Analysis',
    features: [
      'Detailed facial feature breakdown',
      'Strengths and weaknesses analysis',
      'Specific score factors',
      'Basic improvement tips'
    ]
  },
  premium: {
    price: 999, // $9.99
    name: 'Improvement Suggestions',
    features: [
      'Everything in Basic',
      'AI-powered hairstyle recommendations',
      'Skincare tips based on analysis',
      'Fashion and style advice',
      'Grooming recommendations'
    ]
  },
  ultimate: {
    price: 2999, // $29.99
    name: 'Complete Glow Up Plan',
    features: [
      'Everything in Premium',
      'Full transformation roadmap',
      'Product recommendations with links',
      'Progress tracking plan',
      'Before/after projections',
      'Personalized action plan'
    ]
  }
};

/**
 * Validate coupon code and calculate discount
 */
function validateCoupon(code, env) {
  if (!code) {
    return { valid: false, message: 'Coupon code is required' };
  }

  // Sanitize and normalize input
  const normalizedCode = code.trim().toUpperCase();

  // Validate against environment variable
  const validCode = env.COUPON_CODE || 'LAUNCH99';
  const discountPercent = parseInt(env.COUPON_DISCOUNT_PERCENT || '99');

  if (normalizedCode !== validCode.toUpperCase()) {
    return { valid: false, message: 'Invalid coupon code' };
  }

  return {
    valid: true,
    code: validCode,
    discount: discountPercent
  };
}

/**
 * Calculate discounted price
 */
function calculateDiscountedPrice(originalPrice, discountPercent) {
  const discountAmount = Math.floor(originalPrice * (discountPercent / 100));
  const discountedPrice = originalPrice - discountAmount;
  return Math.max(discountedPrice, 50); // Minimum $0.50 (Stripe requirement for USD)
}

/**
 * Initialize Stripe with API key
 */
function getStripeInstance(env) {
  const isTestMode = env.TEST_MODE === 'true';

  if (isTestMode) {
    // Mock Stripe for test mode
    return {
      checkout: {
        sessions: {
          create: async (params) => ({
            id: 'test_cs_' + Date.now(),
            url: params.success_url.replace('{CHECKOUT_SESSION_ID}', 'test_session_' + Date.now())
          }),
          retrieve: async (sessionId) => ({
            id: sessionId,
            payment_status: 'paid',
            metadata: { tier: 'ultimate' },
            customer_email: 'test@example.com'
          })
        }
      }
    };
  }

  if (!env.STRIPE_SECRET_KEY) {
    throw new Error('Stripe API key not configured');
  }

  return new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16'
  });
}

/**
 * Create Stripe checkout session
 * POST /api/payment/create-checkout
 */
export async function handleCreateCheckout(request, env) {
  try {
    const body = await request.json();
    const { tier, email, ratingId, couponCode } = body;

    if (!PRICING_TIERS[tier]) {
      return createErrorResponse('Invalid pricing tier', 400);
    }

    const tierData = PRICING_TIERS[tier];
    const isTestMode = env.TEST_MODE === 'true';

    // Validate coupon and calculate price
    let finalPrice = tierData.price;
    let discountApplied = false;
    let couponData = null;

    if (couponCode) {
      const validation = validateCoupon(couponCode, env);
      if (validation.valid) {
        finalPrice = calculateDiscountedPrice(tierData.price, validation.discount);
        discountApplied = true;
        couponData = {
          code: validation.code,
          discount: validation.discount,
          originalPrice: tierData.price,
          savedAmount: tierData.price - finalPrice
        };
      }
    }

    // Test mode - return test checkout URL
    if (isTestMode) {
      const testCheckoutUrl = `${env.FRONTEND_URL || 'http://localhost:3000'}/test-checkout.html?tier=${tier}&price=${finalPrice}&test=true`;

      return createSuccessResponse({
        checkoutUrl: testCheckoutUrl,
        testMode: true,
        message: 'Test mode - no real payment required',
        couponApplied: discountApplied,
        coupon: couponData
      });
    }

    // Real Stripe checkout
    const stripe = getStripeInstance(env);

    // Use Origin header for dynamic redirect URLs, with fallback
    const origin = request.headers.get('Origin');
    const allowedOrigins = [
      'https://ratemylooks.pages.dev',
      'https://ratemylooks.ai',
      'https://www.ratemylooks.ai',
      'http://localhost:3000',
      'http://localhost:5500'
    ];
    // Also allow any *.pages.dev subdomain for preview deployments
    const isAllowedOrigin = origin && (
      allowedOrigins.includes(origin) ||
      origin.endsWith('.pages.dev') ||
      origin.endsWith('.github.io')
    );
    const frontendUrl = isAllowedOrigin ? origin : (env.FRONTEND_URL || 'https://ratemylooks.pages.dev');

    // Build product name and description with coupon info
    const productName = discountApplied
      ? `${tierData.name} - ${couponData.code} Applied (${couponData.discount}% OFF)`
      : tierData.name;

    const productDescription = discountApplied
      ? `Original: $${(tierData.price / 100).toFixed(2)} | You save: $${(couponData.savedAmount / 100).toFixed(2)}`
      : tierData.features.join(', ');

    // Build metadata - Stripe only accepts string values
    const metadata = {
      tier,
      ratingId: ratingId || '',
      email: email || '',
      originalPrice: String(tierData.price),
      finalPrice: String(finalPrice)
    };

    // Only add couponCode if one was applied
    if (discountApplied && couponData) {
      metadata.couponCode = couponData.code;
      metadata.discount = String(couponData.discount);
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: productName,
            description: productDescription
          },
          unit_amount: finalPrice
        },
        quantity: 1
      }],
      mode: 'payment',
      success_url: `${frontendUrl}/?payment_success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/?payment_cancelled=true`,
      metadata
    });

    return createSuccessResponse({
      checkoutUrl: session.url,
      sessionId: session.id,
      couponApplied: discountApplied,
      coupon: couponData
    });

  } catch (error) {
    console.error('Checkout error:', error);
    return createErrorResponse(
      'Failed to create checkout session',
      500,
      { error: error.message }
    );
  }
}

/**
 * Verify payment and unlock premium features
 * POST /api/payment/verify-payment
 */
export async function handleVerifyPayment(request, env) {
  try {
    const body = await request.json();
    const { sessionId, unlockToken } = body;
    const isTestMode = env.TEST_MODE === 'true';

    // Handle test mode verification with unlock token
    if (isTestMode && unlockToken) {
      try {
        const tokenData = JSON.parse(atob(unlockToken));

        if (tokenData.test) {
          return createSuccessResponse({
            verified: true,
            tier: tokenData.tier,
            features: PRICING_TIERS[tokenData.tier].features,
            testMode: true
          });
        }
      } catch (e) {
        // Invalid test token
        console.error('Invalid unlock token:', e);
      }
    }

    // Mock verification in test mode with session ID
    if (isTestMode && sessionId && sessionId.startsWith('test_')) {
      return createSuccessResponse({
        verified: true,
        tier: 'ultimate',
        features: PRICING_TIERS.ultimate.features,
        testMode: true
      });
    }

    // Real Stripe verification
    if (!isTestMode && sessionId) {
      const stripe = getStripeInstance(env);
      const session = await stripe.checkout.sessions.retrieve(sessionId);

      if (session.payment_status === 'paid') {
        const tier = session.metadata.tier || 'basic';

        return createSuccessResponse({
          verified: true,
          tier,
          features: PRICING_TIERS[tier].features,
          email: session.customer_email,
          ratingId: session.metadata.ratingId
        });
      }
    }

    return createSuccessResponse({
      verified: false,
      message: 'Payment not verified'
    });

  } catch (error) {
    console.error('Verification error:', error);
    return createErrorResponse(
      'Failed to verify payment',
      500,
      { error: error.message }
    );
  }
}

/**
 * Test checkout endpoint (test mode only)
 * POST /api/payment/test-checkout
 */
export async function handleTestCheckout(request, env) {
  try {
    const isTestMode = env.TEST_MODE === 'true';

    if (!isTestMode) {
      return createErrorResponse('Test mode is disabled', 403);
    }

    const body = await request.json();
    const { tier, email, ratingId } = body;

    if (!PRICING_TIERS[tier]) {
      return createErrorResponse('Invalid pricing tier', 400);
    }

    // Generate test token
    const testToken = btoa(JSON.stringify({
      tier,
      email,
      ratingId,
      timestamp: Date.now(),
      test: true
    }));

    return createSuccessResponse({
      message: 'Test payment successful',
      data: {
        tier,
        features: PRICING_TIERS[tier].features,
        unlockToken: testToken,
        testMode: true,
        instructions: 'Use this token to unlock premium features in test mode'
      }
    });

  } catch (error) {
    console.error('Test checkout error:', error);
    return createErrorResponse(
      'Test checkout failed',
      500,
      { error: error.message }
    );
  }
}

/**
 * Get pricing information
 * GET /api/payment/pricing
 */
export async function handleGetPricing(request, env) {
  const isTestMode = env.TEST_MODE === 'true';

  return createSuccessResponse({
    pricing: Object.entries(PRICING_TIERS).map(([key, value]) => ({
      id: key,
      ...value,
      priceFormatted: `$${(value.price / 100).toFixed(2)}`
    })),
    testMode: isTestMode,
    testModeMessage: isTestMode ? 'Test mode enabled - payments are simulated' : null
  });
}

/**
 * Validate coupon code
 * POST /api/payment/validate-coupon
 */
export async function handleValidateCoupon(request, env) {
  try {
    const body = await request.json();
    const { code, tier } = body;

    const validation = validateCoupon(code, env);

    if (!validation.valid) {
      return createSuccessResponse({
        valid: false,
        message: validation.message
      });
    }

    // Get tier price for calculation
    const tierData = PRICING_TIERS[tier || 'unlock_results'];
    const originalPrice = tierData.price;
    const discountedPrice = calculateDiscountedPrice(originalPrice, validation.discount);

    return createSuccessResponse({
      valid: true,
      code: validation.code,
      discount: validation.discount,
      originalPrice: originalPrice,
      discountedPrice: discountedPrice,
      savedAmount: originalPrice - discountedPrice,
      priceFormatted: {
        original: `$${(originalPrice / 100).toFixed(2)}`,
        discounted: `$${(discountedPrice / 100).toFixed(2)}`,
        saved: `$${((originalPrice - discountedPrice) / 100).toFixed(2)}`
      }
    });

  } catch (error) {
    console.error('Coupon validation error:', error);
    return createErrorResponse(
      'Failed to validate coupon',
      500,
      { error: error.message }
    );
  }
}
