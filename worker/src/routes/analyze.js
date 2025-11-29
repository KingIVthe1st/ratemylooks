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
