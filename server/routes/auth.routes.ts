import { Router, Request, Response } from 'express';
import { getDb, saveDb, queryAll, queryOne, runSql } from '../db.js';
import { rateLimiter } from '../middleware/rateLimiter.js';
import { createAuthToken } from '../middleware/auth.js';

export const authRouter = Router();

// Rate limiter for auth endpoints: 40 requests per minute per IP
const authLimiter = rateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 40,
  message: 'Too many authentication attempts. Please slow down.'
});

const mapUserRow = (row: any) => {
  let addresses = [];
  try {
    addresses = JSON.parse(row.addresses_json || '[]');
  } catch (_e) {
    addresses = [];
  }

  if (addresses.length === 0 && (row.shipping_address || row.city)) {
    addresses.push({
      id: 'addr-default',
      name: row.name,
      phone: row.phone,
      address: row.shipping_address || 'Chhatrapati Sambhajinagar',
      city: row.city || 'Chhatrapati Sambhajinagar',
      pincode: row.pincode || '431001',
      isDefault: true
    });
  }

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    role: row.role || 'customer',
    companyName: row.company_name,
    gstNumber: row.gst_number,
    shippingAddress: row.shipping_address,
    city: row.city,
    pincode: row.pincode,
    addresses,
    createdAt: row.created_at
  };
};

const ADMIN_PHONE = '7666969836';

// POST /api/auth/login - Phone-based login. The verified phone determines the role.
authRouter.post('/login', authLimiter, async (req: Request, res: Response) => {
  try {
    const cleanPhone = String(req.body.phone || req.body.username || '').replace(/\D/g, '').slice(-10);
    const name = String(req.body.name || '').trim();

    if (cleanPhone.length !== 10) {
      return res.status(400).json({ success: false, error: 'A valid 10-digit mobile number is required' });
    }

    const db = await getDb();
    const existing = queryOne<any>(db, `SELECT * FROM users WHERE phone = ? LIMIT 1`, [cleanPhone]);
    const role = cleanPhone === ADMIN_PHONE ? 'admin' : 'customer';
    const userId = existing?.id || `user-${cleanPhone}`;
    const userName = name || existing?.name || (role === 'admin' ? 'Admin Manager' : 'Customer');
    const email = existing?.email || `${cleanPhone}@proprint.in`;

    if (existing) {
      runSql(db, `UPDATE users SET name = ?, role = ?, email = ? WHERE id = ?`, [userName, role, email, userId]);
    } else {
      runSql(db, `INSERT INTO users (id, name, email, phone, role, company_name, shipping_address, city, pincode)
        VALUES (?, ?, ?, ?, ?, '', '', '', '')`, [userId, userName, email, cleanPhone, role]);
    }
    saveDb();

    const created = queryOne(db, `SELECT * FROM users WHERE id = ?`, [userId]);
    const mapped = mapUserRow(created);
    return res.json({
      success: true,
      role,
      user: mapped,
      token: createAuthToken(userId, role, cleanPhone)
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/auth/register - Register new user
authRouter.post('/register', authLimiter, async (req: Request, res: Response) => {
  try {
    const { name, email, phone, password, companyName, gstNumber, shippingAddress, city, pincode } = req.body;

    if (!email || !password || !name || !phone) {
      return res.status(400).json({ success: false, error: 'Name, email, phone, and password are required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const db = await getDb();

    const existing = queryOne(db, `SELECT id FROM users WHERE LOWER(email) = ? LIMIT 1`, [cleanEmail]);
    if (existing) {
      return res.status(409).json({ success: false, error: 'An account with this email already exists. Please log in.' });
    }

    const newId = `user-${Date.now()}`;
    const cleanPhone = String(phone || '').replace(/\D/g, '').slice(-10);
    if (cleanPhone.length !== 10) {
      return res.status(400).json({ success: false, error: 'A valid 10-digit mobile number is required' });
    }
    const role = cleanPhone === ADMIN_PHONE ? 'admin' : 'customer';

    const defaultAddresses = [
      {
        id: `addr-${Date.now()}`,
        name: name.trim(),
        phone: cleanPhone,
        address: shippingAddress || 'Chhatrapati Sambhajinagar',
        city: city || 'Chhatrapati Sambhajinagar',
        pincode: pincode || '431001',
        isDefault: true
      }
    ];

    runSql(
      db,
      `INSERT INTO users (id, name, email, phone, role, company_name, gst_number, shipping_address, city, pincode, addresses_json, password_hash)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newId,
        name.trim(),
        cleanEmail,
        cleanPhone,
        role,
        companyName || '',
        gstNumber || '',
        shippingAddress || 'Chhatrapati Sambhajinagar',
        city || 'Chhatrapati Sambhajinagar',
        pincode || '431001',
        JSON.stringify(defaultAddresses),
        password
      ]
    );
    saveDb();

    const createdUser = queryOne(db, `SELECT * FROM users WHERE id = ?`, [newId]);
    return res.status(201).json({
      success: true,
      role,
      user: mapUserRow(createdUser),
      token: createAuthToken(newId, role, cleanPhone),
      message: 'Account registered successfully'
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});
