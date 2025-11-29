# RateMyLooks.ai Cloudflare Worker

This is the Cloudflare Worker backend for RateMyLooks.ai, migrated from Express.js to run on Cloudflare's edge network.

## Features

- **Image Analysis**: AI-powered attractiveness analysis using Grok AI Vision API
- **Payment Processing**: Stripe integration for premium features
- **Rate Limiting**: Built-in protection against abuse
- **CORS Support**: Properly configured for cross-origin requests
- **Edge Performance**: Deployed globally on Cloudflare's network

## Project Structure

```
worker/
├── src/
│   ├── index.js              # Main Worker entry point
│   ├── routes/
│   │   ├── analyze.js        # Image analysis endpoints
│   │   └── payment.js        # Payment processing endpoints
│   ├── services/
│   │   ├── grokService.js    # Grok AI integration
│   │   └── ratingService.js  # Analysis processing logic
│   └── utils/
│       ├── cors.js           # CORS handling
│       ├── responses.js      # Response formatting
│       ├── imageProcessor.js # Image validation and conversion
│       ├── rateLimit.js      # Rate limiting
│       └── helpers.js        # Utility functions
├── wrangler.toml             # Worker configuration
└── package.json              # Dependencies
```

## Setup

### Prerequisites

- Node.js 18+
- Cloudflare account
- Wrangler CLI installed globally: `npm install -g wrangler`

### Installation

1. Install dependencies:
```bash
cd worker
npm install
```

2. Authenticate with Cloudflare:
```bash
wrangler login
```

3. Set up secrets (API keys):
```bash
npm run secret:grok    # Enter your Grok AI API key
npm run secret:stripe  # Enter your Stripe secret key
```

4. Update `wrangler.toml`:
   - Set your `FRONTEND_URL` in the vars section
   - Configure KV namespaces if using rate limiting (optional)

## Development

Run the Worker locally:
```bash
npm run dev
```

The Worker will be available at `http://localhost:8787`

## Deployment

### Deploy to Development Environment
```bash
npm run deploy:dev
```

### Deploy to Production
```bash
npm run deploy:production
```

### Deploy to Default Environment
```bash
npm run deploy
```

## API Endpoints

### Health Check
- `GET /health` - Check Worker status

### Analysis
- `POST /api/analyze` - Analyze image via multipart/form-data
- `POST /api/analyze/base64` - Analyze image via base64 data
- `GET /api/test-ai` - Test Grok AI connection
- `GET /api/analyze/limits` - Get rate limit information
- `GET /api/analyze/formats` - Get supported image formats

### Payment
- `POST /api/payment/create-checkout` - Create Stripe checkout session
- `POST /api/payment/verify-payment` - Verify payment status
- `POST /api/payment/test-checkout` - Test checkout (test mode only)
- `GET /api/payment/pricing` - Get pricing tiers

## Environment Variables

Required secrets (set via `wrangler secret put`):
- `GROK_API_KEY` - Your Grok AI API key
- `STRIPE_SECRET_KEY` - Your Stripe secret key

Configuration variables (set in `wrangler.toml`):
- `NODE_ENV` - Environment (development/production)
- `TEST_MODE` - Enable test mode (true/false)
- `FRONTEND_URL` - Your frontend URL
- `MAX_FILE_SIZE` - Maximum upload size in bytes

## Rate Limiting

The Worker implements basic rate limiting:
- **General**: 100 requests per hour
- **Analysis**: 50 analyses per hour
- **Burst Protection**: 10 requests per minute

For production, consider using:
- **KV Namespaces**: For distributed rate limiting
- **Durable Objects**: For more sophisticated rate limiting

## CORS Configuration

The Worker is configured to accept requests from:
- GitHub Pages (`*.github.io`)
- Local development (`localhost`)
- Production domains (configure in `src/utils/cors.js`)

## Monitoring

View Worker logs:
```bash
npm run tail
```

Or use the Cloudflare dashboard for detailed analytics.

## Migration Notes

This Worker is a direct migration from the Express.js backend with the following changes:

1. **Removed Dependencies**:
   - `express` → Native `fetch` API
   - `multer` → Native `FormData` parsing
   - `express-rate-limit` → Custom rate limiting
   - `cors` → Manual CORS headers

2. **Key Differences**:
   - Use `env.VARIABLE_NAME` instead of `process.env.VARIABLE_NAME`
   - FormData is automatically parsed by Workers
   - Response objects use Web APIs (standard `Response`)
   - No middleware chain (manual routing)

3. **Preserved Functionality**:
   - All Grok AI integration logic
   - All Stripe payment processing
   - Image validation and processing
   - Error handling and response formatting

## Performance

Expected improvements over Express.js:
- **Latency**: 50-90% reduction due to edge deployment
- **Scalability**: Automatic scaling to handle traffic spikes
- **Reliability**: No cold starts, always-on Workers
- **Global**: Deployed to 300+ edge locations worldwide

## Troubleshooting

### Worker fails to deploy
- Check `wrangler.toml` syntax
- Ensure secrets are set: `wrangler secret list`
- Verify account permissions

### API key errors
- Confirm secrets are set: `wrangler secret put GROK_API_KEY`
- Check secret values don't have extra whitespace

### CORS errors
- Add your frontend domain to `src/utils/cors.js`
- Ensure preflight requests return correct headers

### Rate limiting issues
- For development, set `NODE_ENV=development` in wrangler.toml
- Consider implementing KV-based rate limiting for production

## Support

For issues or questions:
1. Check the Cloudflare Workers documentation: https://developers.cloudflare.com/workers/
2. Review Wrangler CLI docs: https://developers.cloudflare.com/workers/wrangler/
3. Check application logs: `npm run tail`

## License

MIT
