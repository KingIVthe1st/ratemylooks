/**
 * RateMyLooks.ai Cloudflare Worker
 * Main entry point for the API Worker
 * Handles all routes and request processing
 */

import { handleAnalyze, handleAnalyzeBase64 } from './routes/analyze';
import {
  handleCreateCheckout,
  handleVerifyPayment,
  handleTestCheckout,
  handleGetPricing,
  handleValidateCoupon
} from './routes/payment';
import { corsHeaders, handleCorsPreflightRequest } from './utils/cors';
import { createErrorResponse } from './utils/responses';
import { RateLimiter } from './utils/rateLimit';

/**
 * Main Worker fetch handler
 * Routes all incoming requests to appropriate handlers
 */
export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return handleCorsPreflightRequest();
    }

    try {
      const url = new URL(request.url);
      const path = url.pathname;

      // Initialize rate limiter
      const rateLimiter = new RateLimiter(env);

      // Apply rate limiting (skip for health check)
      if (path !== '/health') {
        const rateLimitResult = await rateLimiter.checkLimit(request);
        if (!rateLimitResult.allowed) {
          return createErrorResponse(
            'Too many requests. Please try again later.',
            429,
            { retryAfter: rateLimitResult.retryAfter }
          );
        }
      }

      // Route handling
      switch (true) {
        // Health check endpoint
        case path === '/health':
          return new Response(
            JSON.stringify({
              status: 'healthy',
              timestamp: new Date().toISOString(),
              environment: env.NODE_ENV || 'production',
              worker: 'ratemylooks-api'
            }),
            {
              status: 200,
              headers: {
                'Content-Type': 'application/json',
                ...corsHeaders(request)
              }
            }
          );

        // Root endpoint
        case path === '/':
          return new Response(
            JSON.stringify({
              message: 'RateMyLooks.ai API Worker',
              version: '1.0.0',
              status: 'running',
              endpoints: {
                analyze: 'POST /api/analyze',
                analyzeBase64: 'POST /api/analyze/base64',
                payment: 'POST /api/payment/*',
                health: 'GET /health'
              }
            }),
            {
              status: 200,
              headers: {
                'Content-Type': 'application/json',
                ...corsHeaders(request)
              }
            }
          );

        // Analysis endpoints
        case path === '/api/analyze' && request.method === 'POST':
          return await handleAnalyze(request, env);

        case path === '/api/analyze/base64' && request.method === 'POST':
          return await handleAnalyzeBase64(request, env);

        case path === '/api/test-ai' && request.method === 'GET':
          const { testGrokConnection } = await import('./services/grokService');
          const testResult = await testGrokConnection(env);
          return new Response(
            JSON.stringify({
              success: testResult.connected,
              service: 'Grok AI',
              ...testResult
            }),
            {
              status: 200,
              headers: {
                'Content-Type': 'application/json',
                ...corsHeaders(request)
              }
            }
          );

        case path === '/api/analyze/limits' && request.method === 'GET':
          return new Response(
            JSON.stringify({
              success: true,
              limits: {
                analysisPerHour: 50,
                requestsPerHour: 100,
                maxFileSize: '10MB',
                allowedFormats: ['jpeg', 'jpg', 'png', 'webp']
              },
              timestamp: new Date().toISOString()
            }),
            {
              status: 200,
              headers: {
                'Content-Type': 'application/json',
                ...corsHeaders(request)
              }
            }
          );

        case path === '/api/analyze/formats' && request.method === 'GET':
          return new Response(
            JSON.stringify({
              success: true,
              formats: {
                allowed: ['jpeg', 'jpg', 'png', 'webp'],
                maxFileSize: 10485760,
                maxFileSizeMB: 10,
                recommendations: [
                  'Use high-quality images for best results',
                  'Ensure good lighting and clear facial features',
                  'Avoid heavily filtered or edited photos',
                  'Front-facing photos work best for analysis'
                ]
              }
            }),
            {
              status: 200,
              headers: {
                'Content-Type': 'application/json',
                ...corsHeaders(request)
              }
            }
          );

        // Payment endpoints
        case path === '/api/payment/create-checkout' && request.method === 'POST':
          return await handleCreateCheckout(request, env);

        case path === '/api/payment/verify-payment' && request.method === 'POST':
          return await handleVerifyPayment(request, env);

        case path === '/api/payment/test-checkout' && request.method === 'POST':
          return await handleTestCheckout(request, env);

        case path === '/api/payment/pricing' && request.method === 'GET':
          return await handleGetPricing(request, env);

        case path === '/api/payment/validate-coupon' && request.method === 'POST':
          return await handleValidateCoupon(request, env);

        // 404 handler
        default:
          return createErrorResponse(
            'Route not found',
            404,
            { path: path, method: request.method }
          );
      }

    } catch (error) {
      console.error('Worker error:', error);
      return createErrorResponse(
        error.message || 'Internal server error',
        error.status || 500,
        env.NODE_ENV === 'development' ? { stack: error.stack } : null
      );
    }
  }
};
