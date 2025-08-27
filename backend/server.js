/**
 * RateMyLooks.ai Backend Server
 * Main Express server configuration and startup
 */

const express = require('express');
const helmet = require('helmet');
require('dotenv').config();

// Import middleware
const corsConfig = require('./middleware/cors');
const rateLimitMiddleware = require('./middleware/rateLimit');
const { errorHandler } = require('./middleware/errorHandler');

// Import routes
const analyzeRoutes = require('./routes/analyze');
const paymentRoutes = require('./routes/payment');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
app.use(corsConfig);

// Rate limiting - use general rate limiter for all routes
app.use(process.env.NODE_ENV === 'development' 
  ? rateLimitMiddleware.development 
  : rateLimitMiddleware.general
);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api', analyzeRoutes);
app.use('/api/payment', paymentRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'RateMyLooks.ai API Server',
    version: '1.0.0',
    status: 'running'
  });
});

// 404 handler for unknown routes
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Global error handling middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 RateMyLooks.ai API Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  process.exit(0);
});

module.exports = app;