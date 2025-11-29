/**
 * Response Utilities
 * Standardized response formatting for API endpoints
 */

import { corsHeaders } from './cors';

/**
 * Create success response
 */
export function createSuccessResponse(data, status = 200, request = null) {
  const response = {
    success: true,
    ...data,
    timestamp: new Date().toISOString()
  };

  return new Response(JSON.stringify(response), {
    status,
    headers: request ? {
      'Content-Type': 'application/json',
      ...corsHeaders(request)
    } : {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}

/**
 * Create error response
 */
export function createErrorResponse(message, status = 500, details = null, request = null) {
  const response = {
    success: false,
    error: message,
    timestamp: new Date().toISOString(),
    ...(details && { details })
  };

  return new Response(JSON.stringify(response), {
    status,
    headers: request ? {
      'Content-Type': 'application/json',
      ...corsHeaders(request)
    } : {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}
