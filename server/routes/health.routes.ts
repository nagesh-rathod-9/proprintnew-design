import { Router, Request, Response } from 'express';
import { getDb, queryOne } from '../db.js';

export const healthRouter = Router();

healthRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const db = await getDb();
    const memory = process.memoryUsage();

    // Query record counts from primary tables for monitoring
    const productsCount = queryOne<{ count: number }>(db, 'SELECT COUNT(*) as count FROM products')?.count || 0;
    const ordersCount = queryOne<{ count: number }>(db, 'SELECT COUNT(*) as count FROM orders')?.count || 0;
    const usersCount = queryOne<{ count: number }>(db, 'SELECT COUNT(*) as count FROM users')?.count || 0;

    res.json({
      status: 'ok',
      service: 'Proprint Printing Production Backend Engine',
      environment: process.env.NODE_ENV || 'development',
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      memoryUsage: {
        rssMb: (memory.rss / (1024 * 1024)).toFixed(2),
        heapUsedMb: (memory.heapUsed / (1024 * 1024)).toFixed(2),
        heapTotalMb: (memory.heapTotal / (1024 * 1024)).toFixed(2)
      },
      database: {
        engine: 'SQLite (sql.js in-memory with atomic debounced persistence)',
        metrics: {
          products: productsCount,
          orders: ordersCount,
          users: usersCount
        }
      }
    });
  } catch (err: any) {
    res.status(500).json({
      status: 'degraded',
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }
});
