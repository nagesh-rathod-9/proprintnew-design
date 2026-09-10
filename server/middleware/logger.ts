import { Request, Response, NextFunction } from 'express';

/**
 * Production Request Performance Logger
 * Measures and logs API response duration, status codes, and request sizes.
 */
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  // Only log API and upload endpoints to avoid terminal noise from static assets
  if (!req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
    return next();
  }

  const startHrTime = process.hrtime();

  res.on('finish', () => {
    const elapsedHrTime = process.hrtime(startHrTime);
    const elapsedTimeInMs = (elapsedHrTime[0] * 1000 + elapsedHrTime[1] / 1e6).toFixed(2);
    const status = res.statusCode;
    
    // Format status with visual indicators
    const statusEmoji = status >= 500 ? '❌' : status >= 400 ? '⚠️' : '⚡';
    
    // In dev / prod logging
    console.log(
      `${statusEmoji} [${req.method}] ${req.originalUrl || req.url} -> ${status} (${elapsedTimeInMs}ms)`
    );
  });

  next();
}
