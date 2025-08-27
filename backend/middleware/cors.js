/**
 * CORS Configuration Middleware
 * Handles Cross-Origin Resource Sharing for frontend-backend communication
 */

const cors = require('cors');

// CORS configuration
const corsOptions = {
  // Allow GitHub Pages frontend and localhost for development
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      // GitHub Pages patterns
      /^https:\/\/.*\.github\.io$/,
      /^https:\/\/.*\.github\.dev$/,
      
      // Local development
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:5500', // Live Server extension
      'http://127.0.0.1:5500',
      
      // Production domains (add your actual domain here)
      'https://ratemylooks.ai',
      'https://www.ratemylooks.ai'
    ];
    
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (typeof allowedOrigin === 'string') {
        return origin === allowedOrigin;
      }
      return allowedOrigin.test(origin);
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`⚠️  CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'), false);
    }
  },
  
  // Allowed HTTP methods
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  
  // Allowed headers
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'Pragma'
  ],
  
  // Allow credentials
  credentials: true,
  
  // Preflight cache duration
  maxAge: 86400, // 24 hours
  
  // Handle preflight requests
  preflightContinue: false,
  optionsSuccessStatus: 200
};

module.exports = cors(corsOptions);