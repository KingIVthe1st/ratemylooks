/**
 * Setup Script for RateMyLooks.ai Backend
 * Validates environment and provides setup instructions
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 RateMyLooks.ai Backend Setup\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, '.env.example');

if (!fs.existsSync(envPath)) {
  console.log('⚠️  .env file not found');
  
  if (fs.existsSync(envExamplePath)) {
    console.log('📋 Creating .env from .env.example...');
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ .env file created');
    console.log('❗ Please edit .env and add your OpenAI API key\n');
  } else {
    console.log('❌ .env.example file not found\n');
  }
}

// Load environment variables
require('dotenv').config();

console.log('🔧 Environment Configuration:');
console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'not set (will default to development)'}`);
console.log(`   PORT: ${process.env.PORT || 'not set (will default to 3000)'}`);
console.log(`   OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? '✅ Set' : '❌ Not set'}`);

if (!process.env.OPENAI_API_KEY) {
  console.log('\n❗ OpenAI API Key Required:');
  console.log('   1. Get your API key from: https://platform.openai.com/api-keys');
  console.log('   2. Edit .env file and set: OPENAI_API_KEY=your_key_here');
  console.log('   3. Run: npm run dev');
  console.log('\n🧪 For testing without OpenAI: npm run test');
} else {
  console.log('\n✅ Configuration looks good!');
  console.log('🚀 Ready to start server: npm run dev');
}

console.log('\n📚 Available Commands:');
console.log('   npm run dev     - Start development server with auto-reload');
console.log('   npm start       - Start production server');
console.log('   npm run test    - Start test server without OpenAI requirement');
console.log('   node setup.js   - Run this setup check');

console.log('\n📖 API Endpoints (when running):');
console.log('   GET  /health                 - Health check');
console.log('   POST /api/analyze           - Analyze uploaded image');
console.log('   POST /api/analyze/base64    - Analyze base64 image');
console.log('   GET  /api/test-ai           - Test OpenAI connection');
console.log('   GET  /api/analyze/formats   - Get supported formats');

console.log('\n🔍 Next Steps:');
if (!process.env.OPENAI_API_KEY) {
  console.log('   1. Add OpenAI API key to .env file');
  console.log('   2. Run: npm run dev');
  console.log('   3. Test with: curl http://localhost:3000/health');
} else {
  console.log('   1. Run: npm run dev');
  console.log('   2. Test with: curl http://localhost:3000/health');
  console.log('   3. Test AI with: curl http://localhost:3000/api/test-ai');
}

console.log('\nFor detailed documentation, see README.md\n');

// Test module loading
try {
  require('./server');
  console.log('✅ All backend modules are valid\n');
} catch (error) {
  console.log('❌ Module loading error:', error.message);
  console.log('   Please check that all dependencies are installed: npm install\n');
}