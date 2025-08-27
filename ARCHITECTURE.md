# RateMyLooks.ai - System Architecture

## Overview
Decoupled architecture with static frontend on GitHub Pages and Node.js API on Render.

## Component Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Users (Web/Mobile)                   │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│              Frontend (GitHub Pages)                     │
│  - Static HTML/CSS/JS                                    │
│  - Progressive Web App                                   │
│  - CDN Distributed                                       │
└────────────────────────┬────────────────────────────────┘
                         │ HTTPS/CORS
                         ▼
┌─────────────────────────────────────────────────────────┐
│              Backend API (Render)                        │
│  - Node.js/Express                                       │
│  - REST API Endpoints                                    │
│  - Rate Limiting                                         │
│  - Authentication                                        │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│             External Services                            │
│  - OpenAI Vision API (Image Analysis)                    │
│  - Stripe (Payments)                                     │
│  - Cloudinary (Image Processing)                         │
│  - SendGrid (Email)                                      │
└─────────────────────────────────────────────────────────┘
```

## Directory Structure

```
ratemylooks/
├── frontend/               # GitHub Pages static site
│   ├── index.html         # Landing page
│   ├── app.html           # Main application
│   ├── css/
│   │   ├── style.css      # Main styles
│   │   └── animations.css # Animations
│   ├── js/
│   │   ├── main.js        # Core logic
│   │   ├── upload.js      # Upload handling
│   │   ├── api.js         # API communication
│   │   └── share.js       # Social sharing
│   └── assets/
│       ├── images/        # Static images
│       └── icons/         # App icons
│
├── backend/               # Render Node.js API
│   ├── server.js          # Express server
│   ├── routes/
│   │   ├── analyze.js     # Image analysis
│   │   ├── rating.js      # Rating logic
│   │   └── payment.js     # Payment processing
│   ├── services/
│   │   ├── openai.js      # OpenAI integration
│   │   ├── stripe.js      # Stripe integration
│   │   └── cache.js       # Redis caching
│   ├── middleware/
│   │   ├── auth.js        # Authentication
│   │   ├── rateLimit.js   # Rate limiting
│   │   └── cors.js        # CORS config
│   └── utils/
│       ├── logger.js      # Logging
│       └── validator.js   # Input validation
│
├── .github/
│   └── workflows/
│       └── deploy.yml     # GitHub Actions
├── package.json
├── .env.example
└── README.md
```

## API Endpoints

### Public Endpoints
- `POST /api/analyze` - Submit photo for analysis
- `GET /api/rating/:id` - Get rating results
- `GET /api/health` - Health check

### Protected Endpoints
- `POST /api/premium/analyze` - Premium analysis
- `GET /api/premium/report/:id` - Full report
- `POST /api/payment/checkout` - Process payment

## Data Flow

1. **Image Upload Flow**
   ```
   User → Frontend → Compress Image → Backend API → OpenAI Vision → Store Result → Return Rating
   ```

2. **Premium Upgrade Flow**
   ```
   User → Select Plan → Stripe Checkout → Webhook → Unlock Features → Enhanced Analysis
   ```

3. **Social Share Flow**
   ```
   User → Generate Share Card → Create OG Tags → Social Platform API → Track Engagement
   ```

## Security Measures

- **Frontend**
  - Content Security Policy
  - XSS Protection
  - HTTPS only

- **Backend**
  - JWT Authentication
  - Rate limiting (100 req/hour free tier)
  - Input sanitization
  - SQL injection prevention

- **Data**
  - Images deleted after processing
  - PII encryption
  - GDPR compliance

## Performance Optimization

- **Frontend**
  - Lazy loading
  - Image compression
  - CDN caching
  - Service Worker

- **Backend**
  - Redis caching
  - Database indexing
  - Connection pooling
  - Horizontal scaling

## Deployment Strategy

- **Frontend (GitHub Pages)**
  - Automatic deployment on main branch push
  - Custom domain with SSL
  - CloudFlare CDN

- **Backend (Render)**
  - Auto-deploy from GitHub
  - Environment variables
  - Health checks
  - Auto-scaling

## Monitoring & Analytics

- **Application Monitoring**
  - Sentry for error tracking
  - LogRocket for session replay
  - New Relic for performance

- **Business Analytics**
  - Google Analytics 4
  - Mixpanel for events
  - Hotjar for heatmaps