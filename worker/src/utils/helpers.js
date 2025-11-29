/**
 * Helper Utilities
 * Common utility functions used across the Worker
 */

/**
 * Generate unique ID (UUID v4 alternative)
 */
export function generateId() {
  return crypto.randomUUID();
}

/**
 * Sleep/delay function
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Format error message for logging
 */
export function formatError(error) {
  return {
    message: error.message,
    status: error.status || 500,
    code: error.code,
    timestamp: new Date().toISOString()
  };
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return input;

  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .trim()
    .substring(0, 1000); // Limit length
}

/**
 * Validate email format
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Parse JSON safely
 */
export function safeJsonParse(text, fallback = null) {
  try {
    return JSON.parse(text);
  } catch (error) {
    console.error('JSON parse error:', error);
    return fallback;
  }
}

/**
 * Create custom error with status code
 */
export function createError(message, status = 500, code = null) {
  const error = new Error(message);
  error.status = status;
  if (code) error.code = code;
  return error;
}
