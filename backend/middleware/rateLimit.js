/**
 * Rate Limiting Middleware
 * Controls request frequency to prevent abuse and manage API usage
 */

const rateLimit = require('express-rate-limit');

// Create rate limiter with different limits for different endpoints
const createRateLimit = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      error: 'Too many requests',
      message: message,
      retryAfter: Math.ceil(windowMs / 1000 / 60) // minutes
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    
    // Custom key generator to track by IP
    keyGenerator: (req) => {
      return req.ip || req.connection.remoteAddress || 'unknown';
    },
    
    // Skip successful requests for certain endpoints
    skipSuccessfulRequests: false,
    
    // Skip failed requests
    skipFailedRequests: false,
    
    // Custom handler for when limit is exceeded
    handler: (req, res) => {
      console.warn(`🚫 Rate limit exceeded for IP: ${req.ip} on ${req.path}`);
      res.status(429).json({
        error: 'Too many requests',
        message: message,
        retryAfter: Math.ceil(windowMs / 1000 / 60), // minutes
        timestamp: new Date().toISOString()
      });
    }
  });
};

// General rate limit - 100 requests per hour for free tier
const generalLimiter = createRateLimit(
  60 * 60 * 1000, // 1 hour
  100, // 100 requests per hour
  'You have exceeded the free tier limit of 100 requests per hour. Please try again later.'
);

// Analysis endpoint specific rate limit - more restrictive for AI analysis
const analysisLimiter = createRateLimit(
  60 * 60 * 1000, // 1 hour
  50, // 50 analyses per hour
  'Analysis limit reached. You can perform 50 photo analyses per hour on the free tier.'
);

// Short burst protection - prevent rapid-fire requests
const burstLimiter = createRateLimit(
  60 * 1000, // 1 minute
  10, // 10 requests per minute
  'Too many requests in a short time. Please slow down and try again.'
);

// Export middleware functions
module.exports = {
  general: generalLimiter,
  analysis: analysisLimiter,
  burst: burstLimiter,
  
  // Apply multiple rate limiters
  applyAnalysisLimits: [burstLimiter, analysisLimiter],
  
  // Development mode - more lenient limits
  development: createRateLimit(
    60 * 1000, // 1 minute
    1000, // 1000 requests per minute
    'Development rate limit exceeded'
  )
};