const express = require('express');
const router = express.Router();

// Test mode check
const isTestMode = process.env.TEST_MODE === 'true';

// Mock Stripe for test mode
const createMockStripe = () => ({
  checkout: {
    sessions: {
      create: async (params) => ({
        id: 'test_cs_' + Date.now(),
        url: params.success_url + '?session_id=test_session_' + Date.now()
      })
    }
  },
  customers: {
    create: async (params) => ({
      id: 'test_cust_' + Date.now(),
      email: params.email
    })
  }
});

// Initialize Stripe (mock in test mode)
const stripe = isTestMode ? createMockStripe() : require('stripe')(process.env.STRIPE_SECRET_KEY);

// Pricing tiers
const PRICING_TIERS = {
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

// Test mode payment endpoint
router.post('/test-checkout', async (req, res) => {
  try {
    if (!isTestMode) {
      return res.status(403).json({
        success: false,
        message: 'Test mode is disabled'
      });
    }

    const { tier, email, ratingId } = req.body;

    if (!PRICING_TIERS[tier]) {
      return res.status(400).json({
        success: false,
        message: 'Invalid pricing tier'
      });
    }

    // Generate test token
    const testToken = Buffer.from(JSON.stringify({
      tier,
      email,
      ratingId,
      timestamp: Date.now(),
      test: true
    })).toString('base64');

    // Return test success response
    res.json({
      success: true,
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
    res.status(500).json({
      success: false,
      message: 'Test checkout failed',
      error: error.message
    });
  }
});

// Create checkout session
router.post('/create-checkout', async (req, res) => {
  try {
    const { tier, email, ratingId } = req.body;

    if (!PRICING_TIERS[tier]) {
      return res.status(400).json({
        success: false,
        message: 'Invalid pricing tier'
      });
    }

    const tierData = PRICING_TIERS[tier];

    // In test mode, return test checkout URL
    if (isTestMode) {
      const testCheckoutUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/test-checkout.html?tier=${tier}&price=${tierData.price}&test=true`;
      
      return res.json({
        success: true,
        checkoutUrl: testCheckoutUrl,
        testMode: true,
        message: 'Test mode - no real payment required',
        testCard: process.env.TEST_CARD_NUMBER
      });
    }

    // Real Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: tierData.name,
            description: tierData.features.join(', ')
          },
          unit_amount: tierData.price
        },
        quantity: 1
      }],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel.html`,
      metadata: {
        tier,
        ratingId,
        email
      }
    });

    res.json({
      success: true,
      checkoutUrl: session.url,
      sessionId: session.id
    });

  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create checkout session',
      error: error.message
    });
  }
});

// Verify payment/unlock premium features
router.post('/verify-payment', async (req, res) => {
  try {
    const { sessionId, unlockToken } = req.body;

    // Handle test mode verification
    if (isTestMode && unlockToken) {
      try {
        const tokenData = JSON.parse(Buffer.from(unlockToken, 'base64').toString());
        
        if (tokenData.test) {
          return res.json({
            success: true,
            verified: true,
            tier: tokenData.tier,
            features: PRICING_TIERS[tokenData.tier].features,
            testMode: true
          });
        }
      } catch (e) {
        // Invalid test token
      }
    }

    // Mock verification in test mode
    if (isTestMode && sessionId && sessionId.startsWith('test_')) {
      return res.json({
        success: true,
        verified: true,
        tier: 'ultimate',
        features: PRICING_TIERS.ultimate.features,
        testMode: true
      });
    }

    // Real Stripe verification
    if (!isTestMode && sessionId) {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      
      if (session.payment_status === 'paid') {
        const tier = session.metadata.tier || 'basic';
        
        return res.json({
          success: true,
          verified: true,
          tier,
          features: PRICING_TIERS[tier].features,
          email: session.customer_email,
          ratingId: session.metadata.ratingId
        });
      }
    }

    res.json({
      success: false,
      verified: false,
      message: 'Payment not verified'
    });

  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment',
      error: error.message
    });
  }
});

// Get pricing information
router.get('/pricing', (req, res) => {
  res.json({
    success: true,
    pricing: Object.entries(PRICING_TIERS).map(([key, value]) => ({
      id: key,
      ...value,
      priceFormatted: `$${(value.price / 100).toFixed(2)}`
    })),
    testMode: isTestMode,
    testModeMessage: isTestMode ? 'Test mode enabled - payments are simulated' : null
  });
});

module.exports = router;