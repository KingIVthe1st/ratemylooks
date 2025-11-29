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
  handleGetPricing
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
/**
 * Analysis Route Handlers
 * Handles image upload and AI-powered attractiveness analysis
 */

import { analyzeImage } from '../services/grokService';
import { generateDetailedAnalysis } from '../services/ratingService';
import {
  validateImage,
  convertToBase64,
  parseMultipartFormData
} from '../utils/imageProcessor';
import { createSuccessResponse, createErrorResponse } from '../utils/responses';
import { corsHeaders } from '../utils/cors';
import { generateId } from '../utils/helpers';

/**
 * Handle multipart/form-data image upload and analysis
 * POST /api/analyze
 */
export async function handleAnalyze(request, env) {
  const startTime = Date.now();
  const analysisId = generateId();

  console.log(`Analysis ${analysisId} started`);

  try {
    const contentType = request.headers.get('content-type') || '';

    // Parse multipart form data
    if (!contentType.includes('multipart/form-data')) {
      return createErrorResponse(
        'Content-Type must be multipart/form-data',
        400,
        { code: 'INVALID_CONTENT_TYPE' }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const imageFile = formData.get('image');

    if (!imageFile) {
      return createErrorResponse(
        'No image file provided',
        400,
        { code: 'MISSING_IMAGE' }
      );
    }

    // Convert File to Buffer
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Validate image
    const validation = validateImage({
      buffer,
      size: buffer.length,
      mimetype: imageFile.type,
      originalname: imageFile.name
    });

    console.log(`Image validation passed:`, validation);

    // Convert to base64
    const base64Image = convertToBase64(buffer, imageFile.type);
    console.log(`Image converted to base64 (${base64Image.length} chars)`);

    // Extract analysis options
    const focusAreas = formData.get('focusAreas');
    const analysisType = formData.get('analysisType') || 'comprehensive';
    const includeAdvice = formData.get('includeAdvice') !== 'false';

    const options = {
      focusAreas: focusAreas ? focusAreas.split(',') : null,
      analysisType,
      includeAdvice
    };

    // Perform AI analysis
    const aiResult = await analyzeImage(base64Image, options, env);

    if (!aiResult.success) {
      throw new Error('AI analysis failed');
    }

    // Generate detailed analysis
    const detailedAnalysis = generateDetailedAnalysis(aiResult.analysis, options);

    // Calculate processing time
    const processingTime = Date.now() - startTime;

    console.log(`Analysis ${analysisId} completed in ${processingTime}ms`);

    // Build response
    return createSuccessResponse({
      analysisId,
      data: {
        ...detailedAnalysis,
        metadata: {
          ...aiResult.metadata,
          processingTime,
          imageSize: buffer.length,
          imageFormat: validation.format,
          timestamp: new Date().toISOString()
        }
      }
    });

  } catch (error) {
    console.error(`Analysis ${analysisId} failed:`, error.message);

    return createErrorResponse(
      error.message || 'Analysis failed',
      error.status || 500,
      {
        analysisId,
        code: error.code || 'ANALYSIS_ERROR',
        processingTime: Date.now() - startTime
      }
    );
  }
}

/**
 * Handle base64 image data analysis
 * POST /api/analyze/base64
 */
export async function handleAnalyzeBase64(request, env) {
  const startTime = Date.now();
  const analysisId = generateId();

  console.log(`Base64 analysis ${analysisId} started`);

  try {
    const body = await request.json();
    const { imageData, options = {} } = body;

    if (!imageData) {
      return createErrorResponse(
        'No image data provided',
        400,
        { code: 'MISSING_IMAGE_DATA' }
      );
    }

    // Perform AI analysis
    const aiResult = await analyzeImage(imageData, options, env);

    if (!aiResult.success) {
      throw new Error('AI analysis failed');
    }

    // Generate detailed analysis
    const detailedAnalysis = generateDetailedAnalysis(aiResult.analysis, options);

    // Calculate processing time
    const processingTime = Date.now() - startTime;

    console.log(`Base64 analysis ${analysisId} completed in ${processingTime}ms`);

    // Build response
    return createSuccessResponse({
      analysisId,
      data: {
        ...detailedAnalysis,
        metadata: {
          ...aiResult.metadata,
          processingTime,
          inputType: 'base64',
          timestamp: new Date().toISOString()
        }
      }
    });

  } catch (error) {
    console.error(`Base64 analysis ${analysisId} failed:`, error.message);

    return createErrorResponse(
      error.message || 'Analysis failed',
      error.status || 500,
      {
        analysisId,
        code: error.code || 'ANALYSIS_ERROR',
        processingTime: Date.now() - startTime
      }
    );
  }
}
