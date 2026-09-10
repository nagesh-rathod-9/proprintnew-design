import { Request, Response, NextFunction } from 'express';

/**
 * Global Production Error Handler
 * Sanitizes errors and ensures standard JSON responses without leaking internal stack traces.
 */
export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction) {
  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'An unexpected server error occurred';

  console.error(`🚨 [Server Error] ${req.method} ${req.originalUrl || req.url}:`, err);

  res.status(statusCode).json({
    success: false,
    error: message,
    statusCode,
    timestamp: new Date().toISOString()
  });
}

/**
 * 404 Not Found Middleware for unhandled API routes
 */
export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    success: false,
    error: `API route not found: ${req.method} ${req.originalUrl || req.url}`
  });
}
