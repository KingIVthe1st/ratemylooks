# Deployment Guide

## Quick Start Deployment

### 1. Prerequisites Check

Ensure you have:
- [x] Cloudflare account (free tier is fine)
- [x] Node.js 18+ installed
- [x] Grok AI API key from https://x.ai
- [x] Stripe account and API keys

### 2. Install Wrangler CLI

```bash
npm install -g wrangler
```

Verify installation:
```bash
wrangler --version
```

### 3. Authenticate with Cloudflare

```bash
wrangler login
```

This will open a browser window to authenticate.

### 4. Install Dependencies

```bash
cd /Users/ivanjackson/Desktop/Ratemylooks/worker
npm install
```

### 5. Configure Environment

#### For Local Development

Create a `.dev.vars` file:
```bash
cp .dev.vars.example .dev.vars
```

Edit `.dev.vars` and add your API keys:
```
GROK_API_KEY=your_actual_grok_api_key
STRIPE_SECRET_KEY=your_actual_stripe_key
```

#### For Production

Set secrets using Wrangler:
```bash
# Set Grok AI API Key
wrangler secret put GROK_API_KEY
# Paste your key when prompted

# Set Stripe Secret Key
wrangler secret put STRIPE_SECRET_KEY
# Paste your key when prompted
```

### 6. Update Configuration

Edit `wrangler.toml`:

1. Update the Worker name if needed:
```toml
name = "ratemylooks-api"  # Change to your preferred name
```

2. Update the frontend URL:
```toml
[vars]
FRONTEND_URL = "https://yourusername.github.io/ratemylooks"
```

3. (Optional) Configure custom domains in the Cloudflare dashboard

### 7. Test Locally

```bash
npm run dev
```

The Worker will be available at `http://localhost:8787`

Test the health endpoint:
```bash
curl http://localhost:8787/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "development",
  "worker": "ratemylooks-api"
}
```

### 8. Deploy to Production

```bash
npm run deploy:production
```

Or deploy to development environment first:
```bash
npm run deploy:dev
```

### 9. Verify Deployment

After deployment, you'll see output like:
```
Published ratemylooks-api (1.23 sec)
  https://ratemylooks-api.your-subdomain.workers.dev
```

Test the deployed Worker:
```bash
curl https://ratemylooks-api.your-subdomain.workers.dev/health
```

## Advanced Configuration

### Setting Up Custom Domains

1. Go to Cloudflare Dashboard → Workers & Pages
2. Select your Worker
3. Click "Triggers" tab
4. Add custom domain (e.g., `api.ratemylooks.ai`)

### Enabling KV for Rate Limiting

1. Create KV namespace:
```bash
wrangler kv:namespace create "RATE_LIMIT_KV"
```

2. Update `wrangler.toml`:
```toml
[[kv_namespaces]]
binding = "RATE_LIMIT_KV"
id = "your-namespace-id-here"
```

3. Redeploy:
```bash
npm run deploy
```

### Environment-Specific Deployments

#### Development Environment
```bash
npm run deploy:dev
```
Access at: `https://ratemylooks-api-dev.your-subdomain.workers.dev`

#### Production Environment
```bash
npm run deploy:production
```
Access at: `https://ratemylooks-api.your-subdomain.workers.dev`

## Monitoring and Debugging

### View Real-Time Logs

```bash
npm run tail
```

Or for specific environment:
```bash
wrangler tail --env production
```

### Check Worker Status

Visit Cloudflare Dashboard:
1. Workers & Pages
2. Select your Worker
3. View metrics, requests, errors

### Common Issues and Solutions

#### Issue: "API key not configured"
**Solution**: Ensure secrets are set:
```bash
wrangler secret list
```

If missing, set them:
```bash
wrangler secret put GROK_API_KEY
wrangler secret put STRIPE_SECRET_KEY
```

#### Issue: CORS errors in production
**Solution**: Update allowed origins in `src/utils/cors.js`:
```javascript
const ALLOWED_ORIGINS = [
  'https://your-frontend-domain.com',
  // ... other origins
];
```

#### Issue: Rate limiting too strict
**Solution**: Adjust limits in `src/utils/rateLimit.js` or set `NODE_ENV=development` for testing

#### Issue: Image upload fails
**Solution**: Check file size limits in `wrangler.toml`:
```toml
[vars]
MAX_FILE_SIZE = "10485760"  # 10MB
```

## Performance Optimization

### Enable Caching (Optional)

Add cache headers to responses for static data:
```javascript
headers: {
  'Cache-Control': 'public, max-age=3600'
}
```

### Use Durable Objects for Advanced Rate Limiting

For high-traffic applications, consider implementing Durable Objects for more sophisticated rate limiting.

## Security Checklist

- [x] API keys stored as secrets (not in code)
- [x] CORS properly configured
- [x] Rate limiting enabled
- [x] Input validation implemented
- [x] Error messages don't expose sensitive data
- [x] HTTPS enforced (automatic with Workers)

## Rollback Procedure

If you need to rollback a deployment:

1. List previous deployments:
```bash
wrangler deployments list
```

2. Rollback to specific version:
```bash
wrangler rollback [deployment-id]
```

## Cost Estimation

Cloudflare Workers Free Tier:
- 100,000 requests/day
- First 10ms of CPU time per request

This should be sufficient for development and small-scale production use.

For higher traffic, Workers Paid plan:
- $5/month base
- $0.50 per million requests

## Next Steps

1. Update your frontend to point to the new Worker URL
2. Test all API endpoints
3. Monitor logs for any errors
4. Set up alerts in Cloudflare dashboard
5. Configure custom domain if desired

## Support Resources

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Wrangler CLI Reference](https://developers.cloudflare.com/workers/wrangler/)
- [Workers Examples](https://developers.cloudflare.com/workers/examples/)
- [Community Forum](https://community.cloudflare.com/c/developers/workers/40)
