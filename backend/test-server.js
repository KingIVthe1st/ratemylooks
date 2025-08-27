/**
 * Simple server test script
 * Tests basic functionality without requiring OpenAI API key
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

// Create test server
const app = express();
const PORT = 3001; // Different port to avoid conflicts

// Basic middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Test endpoints
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    message: 'Test server is running'
  });
});

app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'API endpoints are working',
    endpoints: [
      'GET /health',
      'GET /api/test',
      'POST /api/analyze (requires OpenAI key)',
      'GET /api/analyze/formats'
    ]
  });
});

app.get('/api/analyze/formats', (req, res) => {
  res.json({
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
  });
});

// Mock analysis endpoint (for testing without OpenAI)
app.post('/api/analyze/mock', (req, res) => {
  res.json({
    success: true,
    analysisId: 'mock-' + Date.now(),
    data: {
      rating: {
        overall: 7.5,
        facialSymmetry: 8,
        skinClarity: 7,
        grooming: 8,
        expression: 7,
        eyeAppeal: 8,
        facialStructure: 7
      },
      analysis: {
        strengths: ["Good facial symmetry", "Clear skin", "Pleasant expression"],
        improvements: ["Consider different hairstyle", "Basic skincare routine"],
        overall: "This is a mock analysis for testing purposes. The person has balanced facial features with good overall presentation."
      },
      suggestions: {
        immediate: ["Daily skincare routine", "Ensure hair is well-styled"],
        longTerm: ["Professional styling consultation", "Maintain healthy lifestyle"],
        styling: ["Experiment with different colors", "Consider new hairstyle"]
      },
      confidence: 0.8,
      timestamp: new Date().toISOString()
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    availableRoutes: ['/health', '/api/test', '/api/analyze/formats', '/api/analyze/mock']
  });
});

// Start test server
app.listen(PORT, () => {
  console.log(`🧪 Test server running on port ${PORT}`);
  console.log(`📊 Test endpoints:`);
  console.log(`   http://localhost:${PORT}/health`);
  console.log(`   http://localhost:${PORT}/api/test`);
  console.log(`   http://localhost:${PORT}/api/analyze/formats`);
  console.log(`   http://localhost:${PORT}/api/analyze/mock`);
});