import { Request, Response, NextFunction } from 'express';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message?: string;
}

interface ClientTracker {
  count: number;
  resetTime: number;
}

const clients = new Map<string, ClientTracker>();

// Clean up expired records every 5 minutes to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of clients.entries()) {
    if (now > value.resetTime) {
      clients.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Creates an in-memory sliding window rate limiter middleware.
 */
export function rateLimiter(config: RateLimitConfig) {
  const { windowMs, maxRequests, message = 'Too many requests. Please try again later.' } = config;

  return (req: Request, res: Response, next: NextFunction) => {
    // Extract client IP address or forwarded-for
    const clientIp = 
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || 
      req.socket.remoteAddress || 
      '127.0.0.1';

    const routeKey = `${clientIp}:${req.baseUrl || req.path}`;
    const now = Date.now();

    const record = clients.get(routeKey);

    if (!record || now > record.resetTime) {
      clients.set(routeKey, {
        count: 1,
        resetTime: now + windowMs
      });
      return next();
    }

    record.count++;

    if (record.count > maxRequests) {
      const retryAfterSec = Math.ceil((record.resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfterSec);
      return res.status(429).json({
        success: false,
        error: message,
        retryAfterSeconds: retryAfterSec
      });
    }

    next();
  };
}
