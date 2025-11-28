/**
 * CORS Utilities
 * Handles Cross-Origin Resource Sharing for frontend-backend communication
 */

/**
 * Allowed origins configuration
 */
const ALLOWED_ORIGINS = [
  // GitHub Pages patterns
  /^https:\/\/.*\.github\.io$/,
  /^https:\/\/.*\.github\.dev$/,

  // Cloudflare Pages
  /^https:\/\/.*\.pages\.dev$/,
  'https://ratemylooks.pages.dev',

  // Local development
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'http://localhost:8080',

  // Production domains
  'https://ratemylooks.ai',
  'https://www.ratemylooks.ai'
];

/**
 * Check if origin is allowed
 */
function isOriginAllowed(origin) {
  if (!origin) return true; // Allow requests with no origin

  return ALLOWED_ORIGINS.some(allowedOrigin => {
    if (typeof allowedOrigin === 'string') {
      return origin === allowedOrigin;
    }
    return allowedOrigin.test(origin);
  });
}

/**
 * Get CORS headers for response
 */
export function corsHeaders(request) {
  const origin = request.headers.get('Origin');
  const headers = {
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Cache-Control, Pragma',
    'Access-Control-Max-Age': '86400',
    'Content-Type': 'application/json'
  };

  if (origin && isOriginAllowed(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Credentials'] = 'true';
  } else if (!origin) {
    headers['Access-Control-Allow-Origin'] = '*';
  }

  return headers;
}

/**
 * Handle CORS preflight OPTIONS request
 */
export function handleCorsPreflightRequest() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Cache-Control, Pragma',
      'Access-Control-Max-Age': '86400'
    }
  });
}
