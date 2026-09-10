import { Request, Response, NextFunction } from 'express';

/**
 * Ensures dynamic API endpoints are never cached by proxies or browsers.
 */
export function noCacheHeaders(_req: Request, res: Response, next: NextFunction) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
}
