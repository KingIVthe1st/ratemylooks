/**
 * Rate Limiting Utilities
 * Controls request frequency to prevent abuse
 */

/**
 * Simple in-memory rate limiter
 * For production, consider using KV or Durable Objects for distributed rate limiting
 */
export class RateLimiter {
  constructor(env) {
    this.env = env;
    this.limits = {
      general: { window: 60 * 60 * 1000, max: 100 }, // 100 requests per hour
      analysis: { window: 60 * 60 * 1000, max: 50 }, // 50 analyses per hour
      burst: { window: 60 * 1000, max: 10 } // 10 requests per minute
    };
  }

  /**
   * Get client identifier from request
   */
  getClientId(request) {
    // Use CF-Connecting-IP header for client IP
    const ip = request.headers.get('CF-Connecting-IP') ||
               request.headers.get('X-Forwarded-For') ||
               request.headers.get('X-Real-IP') ||
               'unknown';

    return ip;
  }

  /**
   * Check if request is within rate limit
   * Note: This is a simplified version. For production, use KV or Durable Objects
   */
  async checkLimit(request, limitType = 'general') {
    try {
      // In development mode, allow all requests
      if (this.env.NODE_ENV === 'development') {
        return { allowed: true };
      }

      const clientId = this.getClientId(request);
      const limit = this.limits[limitType] || this.limits.general;

      // If KV namespace is available, use it for rate limiting
      if (this.env.RATE_LIMIT_KV) {
        return await this.checkLimitWithKV(clientId, limit, limitType);
      }

      // Otherwise, allow request (implement proper rate limiting in production)
      return { allowed: true };

    } catch (error) {
      console.error('Rate limit check error:', error);
      // Allow request on error to avoid blocking legitimate users
      return { allowed: true };
    }
  }

  /**
   * Check rate limit using KV storage
   */
  async checkLimitWithKV(clientId, limit, limitType) {
    const key = `ratelimit:${limitType}:${clientId}`;
    const now = Date.now();

    try {
      // Get current count from KV
      const data = await this.env.RATE_LIMIT_KV.get(key, { type: 'json' });

      if (!data) {
        // First request in window
        await this.env.RATE_LIMIT_KV.put(
          key,
          JSON.stringify({ count: 1, resetAt: now + limit.window }),
          { expirationTtl: Math.ceil(limit.window / 1000) }
        );
        return { allowed: true };
      }

      // Check if window has expired
      if (now > data.resetAt) {
        // Reset counter
        await this.env.RATE_LIMIT_KV.put(
          key,
          JSON.stringify({ count: 1, resetAt: now + limit.window }),
          { expirationTtl: Math.ceil(limit.window / 1000) }
        );
        return { allowed: true };
      }

      // Check if limit exceeded
      if (data.count >= limit.max) {
        return {
          allowed: false,
          retryAfter: Math.ceil((data.resetAt - now) / 1000 / 60) // minutes
        };
      }

      // Increment counter
      await this.env.RATE_LIMIT_KV.put(
        key,
        JSON.stringify({ count: data.count + 1, resetAt: data.resetAt }),
        { expirationTtl: Math.ceil((data.resetAt - now) / 1000) }
      );

      return { allowed: true };

    } catch (error) {
      console.error('KV rate limit error:', error);
      return { allowed: true }; // Allow on error
    }
  }
}
