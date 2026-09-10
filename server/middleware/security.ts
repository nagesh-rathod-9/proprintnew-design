import { Request, Response, NextFunction } from 'express';

/**
 * Production Security Headers Middleware
 * Sets standard HTTP security headers without breaking the iframe preview.
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Control referrer information sent with requests
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Disable download of malicious files by IE
  res.setHeader('X-Download-Options', 'noopen');

  // XSS protection for older browsers
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Remove powered-by header to prevent fingerprinting
  res.removeHeader('X-Powered-By');

  next();
}
