# RateMyLooks.ai Backend API

Express.js backend API for AI-powered attractiveness analysis using OpenAI Vision API.

## Features

- **Image Analysis**: Upload photos for AI-powered attractiveness rating
- **Security**: Helmet, CORS, and rate limiting protection
- **Rate Limiting**: 100 requests/hour free tier, 50 analyses/hour
- **Error Handling**: Comprehensive error handling and validation
- **Multiple Upload Methods**: File upload or base64 data
- **Structured Responses**: Consistent JSON responses with detailed feedback

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   PORT=3000
   NODE_ENV=development
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```

4. **Run Production Server**
   ```bash
   npm start
   ```

## API Endpoints

### Analysis Endpoints

#### `POST /api/analyze`
Upload and analyze image file.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: 
  - `image` (file): Image file (JPEG, PNG, WebP)
  - `focusAreas` (optional): Comma-separated areas to focus on
  - `analysisType` (optional): Type of analysis ('comprehensive' default)

**Response:**
```json
{
  "success": true,
  "analysisId": "uuid",
  "data": {
    "rating": {
      "overall": 7.5,
      "facialSymmetry": 8,
      "skinClarity": 7,
      "grooming": 8,
      "expression": 7,
      "eyeAppeal": 8,
      "facialStructure": 7
    },
    "analysis": {
      "strengths": ["Good facial symmetry", "Clear skin"],
      "improvements": ["Consider different hairstyle"],
      "overall": "Detailed analysis..."
    },
    "suggestions": {
      "immediate": ["Daily skincare routine"],
      "longTerm": ["Professional styling consultation"],
      "styling": ["Experiment with colors"]
    }
  }
}
```

#### `POST /api/analyze/base64`
Analyze base64 image data.

**Request:**
```json
{
  "imageData": "data:image/jpeg;base64,/9j/4AAQ...",
  "options": {
    "focusAreas": ["skinClarity", "grooming"],
    "analysisType": "comprehensive"
  }
}
```

### Utility Endpoints

#### `GET /api/test-ai`
Test OpenAI connection.

#### `GET /api/analyze/limits`
Get rate limiting information.

#### `GET /api/analyze/formats`
Get supported image formats and requirements.

#### `GET /health`
Health check endpoint.

## Project Structure

```
backend/
├── middleware/
│   ├── cors.js          # CORS configuration
│   ├── rateLimit.js     # Rate limiting
│   └── errorHandler.js  # Error handling
├── routes/
│   └── analyze.js       # Analysis routes
├── services/
│   ├── openai.js        # OpenAI integration
│   └── ratingService.js # Rating logic
├── utils/
│   └── imageProcessor.js # Image utilities
├── server.js            # Main server
├── package.json
└── .env.example
```

## Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing protection
- **Rate Limiting**: Prevents abuse with configurable limits
- **Input Validation**: File type, size, and format validation
- **Error Handling**: Secure error responses without sensitive data

## Rate Limiting

- **Free Tier**: 100 requests/hour, 50 analyses/hour
- **Burst Protection**: 10 requests/minute
- **IP-based**: Tracking by client IP address

## Supported Image Formats

- JPEG/JPG
- PNG
- WebP
- Maximum size: 10MB
- Minimum dimensions: 100x100px
- Maximum dimensions: 4096x4096px

## Error Codes

- `MISSING_IMAGE`: No image provided
- `FILE_TOO_LARGE`: File exceeds 10MB limit
- `INVALID_FORMAT`: Unsupported image format
- `ANALYSIS_ERROR`: AI analysis failed
- `RATE_LIMIT_EXCEEDED`: Too many requests

## Development

```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start

# Test OpenAI connection
curl http://localhost:3000/api/test-ai
```

## Environment Variables

- `OPENAI_API_KEY`: Required - Your OpenAI API key
- `PORT`: Optional - Server port (default: 3000)
- `NODE_ENV`: Optional - Environment (development/production)
- `CORS_ORIGINS`: Optional - Allowed CORS origins