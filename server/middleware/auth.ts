import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { getDb, queryOne } from '../db.js';

export type AuthRole = 'admin' | 'customer';

declare global {
  namespace Express {
    interface Request {
      auth?: { userId: string; role: AuthRole; phone: string };
    }
  }
}

const getAuthSecret = () => {
  const secret = process.env.AUTH_SECRET;
  if (!secret && process.env.NODE_ENV === 'production') {
    throw new Error('AUTH_SECRET must be configured in production');
  }
  return secret || 'local-development-auth-secret';
};

export const createAuthToken = (userId: string, role: AuthRole, phone: string) => {
  const payload = Buffer.from(JSON.stringify({ userId, role, phone, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 })).toString('base64url');
  const signature = crypto.createHmac('sha256', getAuthSecret()).update(payload).digest('base64url');
  return `${payload}.${signature}`;
};

const readAuth = (token: string) => {
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return null;

  const expected = crypto.createHmac('sha256', getAuthSecret()).update(payload).digest('base64url');
  if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;

  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!parsed.userId || !parsed.role || !parsed.phone || parsed.exp < Date.now()) return null;
    return parsed as { userId: string; role: AuthRole; phone: string };
  } catch {
    return null;
  }
};

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const header = req.header('authorization') || '';
    const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
    const auth = token ? readAuth(token) : null;
    if (!auth) return res.status(401).json({ success: false, error: 'Authentication required' });

    const db = await getDb();
    const user = queryOne<{ id: string; role: AuthRole; phone: string }>(db, `SELECT id, role, phone FROM users WHERE id = ?`, [auth.userId]);
    if (!user || user.role !== auth.role || (user.phone || '').replace(/\D/g, '').slice(-10) !== auth.phone) {
      return res.status(401).json({ success: false, error: 'Session is no longer valid' });
    }

    req.auth = auth;
    next();
  } catch (error) {
    next(error);
  }
};

export const requireRole = (role: AuthRole) => (req: Request, res: Response, next: NextFunction) => {
  if (req.auth?.role !== role) return res.status(403).json({ success: false, error: 'Insufficient permissions' });
  next();
};

export const requireAuthenticatedWrite = async (req: Request, res: Response, next: NextFunction) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  return requireAuth(req, res, next);
};

export const requireAdminWrite = async (req: Request, res: Response, next: NextFunction) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  return requireAuth(req, res, (error?: any) => {
    if (error) return next(error);
    return requireRole('admin')(req, res, next);
  });
};