# RateMyLooks API Deployment Guide

## Render.com Deployment Steps

### 1. Create New Web Service
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select the `Ratemylooks` repository

### 2. Configure Service Settings
- **Name**: `ratemylooks-api`
- **Region**: Choose closest to your users
- **Branch**: `main`
- **Root Directory**: `api`
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

### 3. Environment Variables
In the Render dashboard, add these environment variables:

**Required:**
- `OPENAI_API_KEY` = `[Your OpenAI API Key]`

**Optional:**
- `NODE_ENV` = `production`

### 4. Deploy
1. Click "Create Web Service"
2. Wait for deployment to complete
3. Note your service URL (e.g., `https://ratemylooks-api.onrender.com`)

### 5. Update Frontend Configuration
Update the API base URL in your frontend code to point to your deployed service.

## Local Development
1. `cd api`
2. `npm install`
3. Create `.env` file with your OpenAI API key
4. `npm run dev`

## API Endpoints

### GET /
Health check endpoint

### POST /analyze-image
Analyzes uploaded image using OpenAI Vision
- Accepts: multipart/form-data or JSON with base64 image
- Returns: JSON with rating, analysis, and confidence score

## Troubleshooting

**Service won't start:**
- Check build logs for dependency issues
- Verify Node.js version compatibility

**API calls failing:**
- Verify OPENAI_API_KEY environment variable is set
- Check service logs for detailed error messages

**CORS issues:**
- Service includes CORS headers for all origins
- Verify frontend is using correct API URL