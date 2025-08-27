/**
 * Analysis Routes
 * Handles image upload and AI-powered attractiveness analysis
 */

const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

// Import middleware and services
const { asyncHandler } = require('../middleware/errorHandler');
const { applyAnalysisLimits } = require('../middleware/rateLimit');
const { validateImage, convertToBase64 } = require('../utils/imageProcessor');
const { analyzeImage, testConnection } = require('../services/openai');
const { generateDetailedAnalysis } = require('../services/ratingService');

const router = express.Router();

// Configure multer for image uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 1 // Single file only
  },
  fileFilter: (req, file, cb) => {
    // Allow only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

/**
 * POST /api/analyze
 * Main endpoint for photo analysis
 */
router.post('/analyze', 
  applyAnalysisLimits, // Apply rate limiting
  upload.single('image'), // Handle image upload
  asyncHandler(async (req, res) => {
    const startTime = Date.now();
    const analysisId = uuidv4();

    console.log(`🔍 Starting analysis ${analysisId}`);

    try {
      // Validate file upload
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No image file provided',
          code: 'MISSING_IMAGE'
        });
      }

      // Validate image
      const validation = validateImage(req.file);
      console.log(`✅ Image validation passed:`, validation);

      // Convert to base64
      const base64Image = convertToBase64(req.file.buffer, req.file.mimetype);
      console.log(`🔄 Image converted to base64 (${base64Image.length} chars)`);

      // Extract analysis options from request
      const options = {
        focusAreas: req.body.focusAreas ? req.body.focusAreas.split(',') : null,
        analysisType: req.body.analysisType || 'comprehensive',
        includeAdvice: req.body.includeAdvice !== 'false'
      };

      // Perform AI analysis
      const aiResult = await analyzeImage(base64Image, options);
      
      if (!aiResult.success) {
        throw new Error('AI analysis failed');
      }

      // Generate detailed analysis
      const detailedAnalysis = generateDetailedAnalysis(aiResult.analysis, options);

      // Calculate processing time
      const processingTime = Date.now() - startTime;

      console.log(`✅ Analysis ${analysisId} completed in ${processingTime}ms`);

      // Build response
      const response = {
        success: true,
        analysisId,
        data: {
          ...detailedAnalysis,
          metadata: {
            ...aiResult.metadata,
            processingTime,
            imageSize: req.file.size,
            imageFormat: validation.format,
            timestamp: new Date().toISOString()
          }
        }
      };

      res.json(response);

    } catch (error) {
      console.error(`❌ Analysis ${analysisId} failed:`, error.message);
      
      // Return structured error response
      res.status(error.statusCode || 500).json({
        success: false,
        analysisId,
        error: error.message || 'Analysis failed',
        code: error.code || 'ANALYSIS_ERROR',
        timestamp: new Date().toISOString(),
        processingTime: Date.now() - startTime
      });
    }
  })
);

/**
 * POST /api/analyze/base64
 * Alternative endpoint for base64 image data
 */
router.post('/analyze/base64',
  applyAnalysisLimits,
  asyncHandler(async (req, res) => {
    const startTime = Date.now();
    const analysisId = uuidv4();

    console.log(`🔍 Starting base64 analysis ${analysisId}`);

    try {
      const { imageData, options = {} } = req.body;

      if (!imageData) {
        return res.status(400).json({
          success: false,
          error: 'No image data provided',
          code: 'MISSING_IMAGE_DATA'
        });
      }

      // Perform AI analysis directly with base64 data
      const aiResult = await analyzeImage(imageData, options);
      
      if (!aiResult.success) {
        throw new Error('AI analysis failed');
      }

      // Generate detailed analysis
      const detailedAnalysis = generateDetailedAnalysis(aiResult.analysis, options);

      // Calculate processing time
      const processingTime = Date.now() - startTime;

      console.log(`✅ Base64 analysis ${analysisId} completed in ${processingTime}ms`);

      // Build response
      const response = {
        success: true,
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
      };

      res.json(response);

    } catch (error) {
      console.error(`❌ Base64 analysis ${analysisId} failed:`, error.message);
      
      res.status(error.statusCode || 500).json({
        success: false,
        analysisId,
        error: error.message || 'Analysis failed',
        code: error.code || 'ANALYSIS_ERROR',
        timestamp: new Date().toISOString(),
        processingTime: Date.now() - startTime
      });
    }
  })
);

/**
 * GET /api/test-ai
 * Test OpenAI connection
 */
router.get('/test-ai', asyncHandler(async (req, res) => {
  console.log('🧪 Testing OpenAI connection...');
  
  const testResult = await testConnection();
  
  res.json({
    success: testResult.connected,
    service: 'OpenAI',
    ...testResult
  });
}));

/**
 * GET /api/analyze/limits
 * Get current rate limit status
 */
router.get('/analyze/limits', (req, res) => {
  // This would typically check rate limit status from the middleware
  // For now, return general information
  res.json({
    success: true,
    limits: {
      analysisPerHour: 50,
      requestsPerHour: 100,
      maxFileSize: '10MB',
      allowedFormats: ['jpeg', 'jpg', 'png', 'webp']
    },
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /api/analyze/formats
 * Get supported image formats and limits
 */
router.get('/analyze/formats', (req, res) => {
  const { ALLOWED_FORMATS, MAX_FILE_SIZE } = require('../utils/imageProcessor');
  
  res.json({
    success: true,
    formats: {
      allowed: ALLOWED_FORMATS,
      maxFileSize: MAX_FILE_SIZE,
      maxFileSizeMB: Math.round(MAX_FILE_SIZE / 1024 / 1024),
      recommendations: [
        'Use high-quality images for best results',
        'Ensure good lighting and clear facial features',
        'Avoid heavily filtered or edited photos',
        'Front-facing photos work best for analysis'
      ]
    }
  });
});

/**
 * Error handling for multer
 */
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    console.error('Multer error:', error);
    
    let message = 'File upload error';
    let code = 'UPLOAD_ERROR';
    
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        message = 'File too large. Maximum size is 10MB.';
        code = 'FILE_TOO_LARGE';
        break;
      case 'LIMIT_FILE_COUNT':
        message = 'Too many files. Only one file is allowed.';
        code = 'TOO_MANY_FILES';
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        message = 'Unexpected file field name. Use "image" as the field name.';
        code = 'INVALID_FIELD_NAME';
        break;
    }
    
    return res.status(400).json({
      success: false,
      error: message,
      code,
      timestamp: new Date().toISOString()
    });
  }
  
  next(error);
});

module.exports = router;