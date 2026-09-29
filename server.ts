import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import compression from 'compression';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

// Database & Core
import { initializeDatabase, closeDb } from './server/db.js';

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
import { requireAdminWrite, requireAuthenticatedWrite, requireAuth } from './server/middleware/auth.js';

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT || 3000);

  app.set('trust proxy', 1);

  console.log('📦 Initializing Proprint MySQL database engine...');
  await initializeDatabase();
  console.log('✅ MySQL database initialized and migrations applied.');

  app.use(compression());
  app.use(securityHeaders);
  app.use(requestLogger);

  const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173').split(',').map((value) => value.trim()).filter(Boolean);
  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error(`Origin ${origin} is not allowed by CORS.`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
  }));

  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  app.use('/uploads', (req, res, next) => {
    const rawPath = typeof req.path === 'string' ? req.path : '/';
    const fileName = decodeURIComponent(path.basename(rawPath));
    const ext = path.extname(fileName).toLowerCase();
    const mimeMap: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
      '.gif': 'image/gif',
      '.pdf': 'application/pdf',
      '.zip': 'application/zip',
      '.rar': 'application/x-rar-compressed',
      '.7z': 'application/x-7z-compressed',
      '.ai': 'application/postscript',
      '.cdr': 'application/octet-stream',
      '.psd': 'image/vnd.adobe.photoshop',
      '.eps': 'application/postscript',
      '.tif': 'image/tiff',
      '.tiff': 'image/tiff'
    };

    const contentType = mimeMap[ext] || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400, must-revalidate');
    const isImage = ['.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif', '.tif', '.tiff'].includes(ext);
    const disposition = isImage ? 'inline' : `attachment; filename="${fileName.replace(/"/g, '')}"`;
    res.setHeader('Content-Disposition', disposition);
    next();
  });

  app.use('/uploads', express.static(uploadsDir, {
    maxAge: '1d',
    etag: true
  }));

  app.use('/api', noCacheHeaders);

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
  app.use('/api', errorHandler);

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
    console.log(`🚀 Proprint server running on http://0.0.0.0:${PORT}`);
    console.log(`📊 Health Endpoint: http://0.0.0.0:${PORT}/api/health`);
  });

  const shutdown = async () => {
    console.log('🛑 Closing server gracefully...');
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
    await closeDb();
    console.log('✅ Server closed cleanly.');
    process.exit(0);
  };

  process.on('SIGTERM', () => { void shutdown(); });
  process.on('SIGINT', () => { void shutdown(); });
}

startServer().catch((error) => {
  console.error('Fatal: Failed to start server:', error);
  process.exit(1);
});
