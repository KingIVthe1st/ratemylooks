/**
 * Global Error Handling Middleware
 * Centralized error handling for the entire application
 */

/**
 * Global error handler middleware
 * @param {Error} err - Error object
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
const errorHandler = (err, req, res, next) => {
  // Log error details for debugging
  console.error(`🔥 Error on ${req.method} ${req.path}:`, {
    message: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString(),
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Default error response
  let statusCode = 500;
  let message = 'Internal server error';
  let details = null;

  // Handle specific error types
  if (err.name === 'ValidationError') {
    // Mongoose validation error
    statusCode = 400;
    message = 'Validation error';
    details = Object.values(err.errors).map(e => e.message);
  } else if (err.name === 'CastError') {
    // Invalid ObjectId or similar
    statusCode = 400;
    message = 'Invalid ID format';
  } else if (err.code === 11000) {
    // MongoDB duplicate key error
    statusCode = 409;
    message = 'Duplicate entry';
  } else if (err.name === 'JsonWebTokenError') {
    // JWT errors
    statusCode = 401;
    message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  } else if (err.name === 'MulterError') {
    // File upload errors
    statusCode = 400;
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'File too large. Maximum size is 10MB.';
    } else if (err.code === 'LIMIT_FILE_COUNT') {
      message = 'Too many files. Maximum 1 file allowed.';
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      message = 'Unexpected file field';
    } else {
      message = 'File upload error';
    }
  } else if (err.statusCode || err.status) {
    // Custom errors with status codes
    statusCode = err.statusCode || err.status;
    message = err.message;
  } else if (err.message) {
    // Use error message if available
    message = err.message;
    
    // Check for specific error patterns
    if (err.message.includes('CORS')) {
      statusCode = 403;
      message = 'CORS policy violation';
    } else if (err.message.includes('OpenAI')) {
      statusCode = 502;
      message = 'AI service temporarily unavailable';
    } else if (err.message.includes('timeout')) {
      statusCode = 408;
      message = 'Request timeout';
    } else if (err.message.includes('Network')) {
      statusCode = 503;
      message = 'Service temporarily unavailable';
    }
  }

  // Build error response
  const errorResponse = {
    error: true,
    message: message,
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method
  };

  // Add details in development mode
  if (process.env.NODE_ENV === 'development') {
    errorResponse.details = details;
    errorResponse.stack = err.stack;
  }

  // Add error ID for tracking
  errorResponse.errorId = require('uuid').v4();

  // Send error response
  res.status(statusCode).json(errorResponse);
};

/**
 * Async error wrapper for route handlers
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Express middleware function
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Create custom error with status code
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @returns {Error} Custom error object
 */
const createError = (message, statusCode = 500) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

module.exports = {
  errorHandler,
  asyncHandler,
  createError
};