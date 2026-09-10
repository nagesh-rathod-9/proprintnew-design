import { Router, Request, Response } from 'express';
import { getDb, saveDb, queryAll, queryOne, runSql } from '../db.js';
import { requireRole } from '../middleware/auth.js';

export const usersRouter = Router();

const mapUserRowWithStats = (row: any, db: any) => {
  let addresses = [];
  try {
    addresses = JSON.parse(row.addresses_json || '[]');
  } catch (_e) {
    addresses = [];
  }

  if (addresses.length === 0 && (row.shipping_address || row.city)) {
    addresses.push({
      id: 'addr-default',
      label: 'Default',
      name: row.name,
      phone: row.phone,
      address: row.shipping_address || 'Chhatrapati Sambhajinagar',
      addressLine: row.shipping_address || 'Chhatrapati Sambhajinagar',
      city: row.city || 'Chhatrapati Sambhajinagar',
      pincode: row.pincode || '431001',
      isDefault: true
    });
  } else {
    addresses = addresses.map((a: any) => ({
      ...a,
      addressLine: a.addressLine || a.address || ''
    }));
  }

  // Pre-calculate user order counts and total spent
  const stats = queryOne<{ orderCount: number; totalSpent: number }>(
    db,
    `SELECT COUNT(*) as orderCount, COALESCE(SUM(total), 0) as totalSpent 
     FROM orders 
     WHERE user_id = ? OR customer_email = ?`,
    [row.id, row.email]
  );

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
    ordersCount: stats?.orderCount || 0,
    totalSpent: stats?.totalSpent || 0,
    createdAt: row.created_at
  };
};

// GET /api/users - Get all users
usersRouter.get('/', requireRole('admin'), async (_req: Request, res: Response) => {
  try {
    const db = await getDb();
    const rows = queryAll(db, `SELECT * FROM users ORDER BY created_at DESC`);
    const users = rows.map(r => mapUserRowWithStats(r, db));
    res.json({ success: true, users });
  } catch (err: any) {
    console.error('Error fetching users:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/users/:id - Get user by ID
usersRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (req.auth?.role !== 'admin' && req.auth?.userId !== id) {
      return res.status(403).json({ success: false, error: 'You can only access your own profile' });
    }
    const db = await getDb();
    const row = queryOne(db, `SELECT * FROM users WHERE id = ? OR email = ? LIMIT 1`, [id, id]);
    if (!row) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.json({ success: true, user: mapUserRowWithStats(row, db) });
  } catch (err: any) {
    console.error('Error fetching user:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/users/:id - Update user details
usersRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = await getDb();
    const {
      name,
      phone,
      companyName,
      gstNumber,
      shippingAddress,
      city,
      pincode,
      addresses,
      password,
      role
    } = req.body;

    const existing = queryOne(db, `SELECT * FROM users WHERE id = ?`, [id]);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const updatedAddresses = addresses ? JSON.stringify(addresses) : existing.addresses_json;
    const passwordHash = password ? password : existing.password_hash;

    runSql(
      db,
      `UPDATE users 
       SET name = COALESCE(?, name),
           phone = COALESCE(?, phone),
           company_name = COALESCE(?, company_name),
           gst_number = COALESCE(?, gst_number),
           shipping_address = COALESCE(?, shipping_address),
           city = COALESCE(?, city),
           pincode = COALESCE(?, pincode),
           addresses_json = ?,
           password_hash = ?,
           role = COALESCE(?, role)
       WHERE id = ?`,
      [
        name ?? null,
        phone ?? null,
        companyName ?? null,
        gstNumber ?? null,
        shippingAddress ?? null,
        city ?? null,
        pincode ?? null,
        updatedAddresses,
        passwordHash,
        role ?? null,
        id
      ]
    );
    saveDb();

    const updated = queryOne(db, `SELECT * FROM users WHERE id = ?`, [id]);
    res.json({
      success: true,
      user: mapUserRowWithStats(updated, db),
      message: 'Profile updated successfully'
    });
  } catch (err: any) {
    console.error('Error updating user:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/users/:id - Delete user
usersRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = await getDb();
    runSql(db, `DELETE FROM users WHERE id = ?`, [id]);
    saveDb();
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err: any) {
    console.error('Error deleting user:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});
