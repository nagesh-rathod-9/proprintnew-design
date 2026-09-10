import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import compression from 'compression';
import { createServer as createViteServer } from 'vite';

// Database & Core
import { getDb, flushDbBeforeExit } from './server/db.js';

// Middlewares
import { securityHeaders } from './server/middleware/security.js';
import { requestLogger } from './server/middleware/logger.js';
import { noCacheHeaders } from './server/middleware/cacheControl.js';
import { errorHandler } from './server/middleware/errorHandler.js';

// Routers
import { healthRouter } from './server/routes/health.routes.js';
import { authRouter } from './server/routes/auth.routes.js';
import { usersRouter } from './server/routes/users.routes.js';
import { productsRouter } from './server/routes/products.routes.js';
import { categoriesRouter } from './server/routes/categories.routes.js';
import { ordersRouter } from './server/routes/orders.routes.js';
import { heroSlidesRouter } from './server/routes/heroSlides.routes.js';
import { quotesRouter } from './server/routes/quotes.routes.js';
import { servicesRouter } from './server/routes/services.routes.js';
import { reviewsRouter } from './server/routes/reviews.routes.js';
import { paymentsRouter } from './server/routes/payments.routes.js';
import { portfolioRouter } from './server/routes/portfolio.routes.js';
import { cashfreeRouter } from './server/routes/cashfree.routes.js';
import { uploadRouter } from './server/routes/upload.routes.js';
import { requireAdminWrite, requireAuthenticatedWrite, requireAuth, requireRole } from './server/middleware/auth.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize SQLite database instance and schema on boot
  console.log('📦 Initializing Proprint Database Engine...');
  await getDb();
  console.log('✅ SQLite Database initialized with schema, indexes, and seed records');

  // Gzip compression for all outgoing JSON and static responses
  app.use(compression());

  // Security & logging middleware
  app.use(securityHeaders);
  app.use(requestLogger);

  // Cross-Origin Resource Sharing
  app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
  }));

  // Body parsers with generous limits for print design payloads
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Static directory for uploaded files with 1-day caching and ETags
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  app.use('/uploads', express.static(uploadsDir, {
    maxAge: '1d',
    etag: true
  }));

  // Apply cache-busting / no-store headers exclusively to dynamic /api routes
  app.use('/api', noCacheHeaders);

  // Mount API Routers
  app.use('/api/health', healthRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/users', requireAuth, usersRouter);
  app.use('/api/products', requireAdminWrite, productsRouter);
  app.use('/api/categories', requireAdminWrite, categoriesRouter);
  app.use('/api/orders', requireAuthenticatedWrite, ordersRouter);
  app.use('/api/hero-slides', requireAdminWrite, heroSlidesRouter);
  app.use('/api/quotes', requireAuthenticatedWrite, quotesRouter);
  app.use('/api/services', requireAdminWrite, servicesRouter);
  app.use('/api/reviews', requireAuthenticatedWrite, reviewsRouter);
  app.use('/api/payments', requireAdminWrite, paymentsRouter);
  app.use('/api/portfolio', requireAdminWrite, portfolioRouter);
  app.use('/api/cashfree', cashfreeRouter);
  app.use('/api/upload', requireAuthenticatedWrite, uploadRouter);

  // Global Error Handler for API routes
  app.use('/api', errorHandler);

  // SPA Serving: Vite middleware in development / static dist in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response, next) => {
      if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
        return next();
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Proprint Production Server running on http://0.0.0.0:${PORT}`);
    console.log(`📊 Health Endpoint: http://0.0.0.0:${PORT}/api/health`);
  });

  // Graceful shutdown handling
  const shutdown = () => {
    console.log('🛑 Received shutdown signal. Closing server gracefully...');
    server.close(() => {
      flushDbBeforeExit();
      console.log('✅ Server closed and database saved cleanly.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

startServer().catch(err => {
  console.error('Fatal: Failed to start server:', err);
  process.exit(1);
});
