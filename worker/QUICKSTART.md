# Quick Start Guide

Get your Cloudflare Worker up and running in 5 minutes!

## Prerequisites

- Cloudflare account (sign up at https://dash.cloudflare.com/sign-up)
- Node.js 18+ installed
- Grok AI API key from https://x.ai
- Stripe account (optional, for payments)

## Step-by-Step Setup

### 1. Install Wrangler CLI

```bash
npm install -g wrangler
```

### 2. Login to Cloudflare

```bash
wrangler login
```

### 3. Install Dependencies

```bash
cd /Users/ivanjackson/Desktop/Ratemylooks/worker
npm install
```

### 4. Set Up Local Development

Create `.dev.vars` file:

```bash
cp .dev.vars.example .dev.vars
```

Edit `.dev.vars` and add your keys:

```env
GROK_API_KEY=your_grok_api_key_here
STRIPE_SECRET_KEY=your_stripe_key_here
```

### 5. Test Locally

```bash
npm run dev
```

Visit http://localhost:8787/health

### 6. Run Tests

```bash
./test-endpoints.sh
```

All tests should pass!

### 7. Deploy to Production

#### Set Production Secrets

```bash
npm run secret:grok
# Paste your Grok API key when prompted

npm run secret:stripe
# Paste your Stripe key when prompted
```

#### Update Configuration

Edit `wrangler.toml`:
- Update `FRONTEND_URL` to your frontend domain

#### Deploy

```bash
npm run deploy
```

Your Worker is now live! 🎉

## What's Next?

1. **Update Frontend**: Point your frontend API calls to the Worker URL
2. **Custom Domain**: Add a custom domain in Cloudflare dashboard
3. **Monitor**: Use `npm run tail` to view logs
4. **Analytics**: Check Cloudflare dashboard for metrics

## Testing Your Deployed Worker

```bash
# Replace with your Worker URL
WORKER_URL="https://ratemylooks-api.your-subdomain.workers.dev"

# Test health
curl $WORKER_URL/health

# Get pricing
curl $WORKER_URL/api/payment/pricing

# Run full test suite
./test-endpoints.sh $WORKER_URL
```

## Common Issues

### "GROK_API_KEY not configured"
Run: `npm run secret:grok`

### "CORS error"
Update `src/utils/cors.js` with your frontend domain

### "Worker not found"
Check deployment status: `wrangler deployments list`

## Support

- Documentation: See README.md
- Deployment Guide: See DEPLOYMENT.md
- Migration Info: See MIGRATION.md
- Logs: `npm run tail`

## Quick Reference

| Command | Description |
|---------|-------------|
| `npm run dev` | Start local development |
| `npm run deploy` | Deploy to production |
| `npm run tail` | View live logs |
| `npm run secret:grok` | Set Grok API key |
| `npm run secret:stripe` | Set Stripe key |
| `./test-endpoints.sh` | Test all endpoints |

## File Structure

```
worker/
├── src/
│   ├── index.js           # Main entry point
│   ├── routes/            # Route handlers
│   ├── services/          # Business logic
│   └── utils/             # Helper functions
├── wrangler.toml          # Worker configuration
├── package.json           # Dependencies
└── .dev.vars              # Local secrets (create this)
```

## Environment Variables

Set in `wrangler.toml` [vars] section:
- `NODE_ENV`: Environment (development/production)
- `TEST_MODE`: Enable test mode (true/false)
- `FRONTEND_URL`: Your frontend URL
- `MAX_FILE_SIZE`: Max upload size

Set as secrets (via `wrangler secret put`):
- `GROK_API_KEY`: Your Grok AI API key
- `STRIPE_SECRET_KEY`: Your Stripe secret key

## Need Help?

Check these resources in order:
1. README.md - Full documentation
2. DEPLOYMENT.md - Detailed deployment guide
3. MIGRATION.md - Migration from Express.js
4. Cloudflare Docs - https://developers.cloudflare.com/workers/

Happy coding! 🚀
