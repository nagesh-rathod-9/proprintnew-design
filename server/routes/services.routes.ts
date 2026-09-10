import { Router, Request, Response } from 'express';
import { getDb, saveDb, queryAll, queryOne, runSql } from '../db.js';

export const servicesRouter = Router();

// GET /api/services - Get all services
servicesRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const db = await getDb();
    const rows = queryAll(db, `SELECT * FROM services ORDER BY created_at ASC`);
    const services = rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      category: row.category,
      tagline: row.tagline,
      description: row.description,
      turnaround: row.turnaround,
      minOrder: row.min_order,
      iconName: row.icon_name,
      badge: row.badge,
      createdAt: row.created_at
    }));

    res.json({ success: true, services });
  } catch (err: any) {
    console.error('Error fetching services:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/services - Create service
servicesRouter.post('/', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const s = req.body;
    const id = s.id || `srv-${Date.now()}`;

    runSql(
      db,
      `INSERT INTO services (id, name, category, tagline, description, turnaround, min_order, icon_name, badge)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        s.name,
        s.category || 'Printing',
        s.tagline || '',
        s.description || '',
        s.turnaround || '24-48 Hours',
        s.minOrder || '100 pcs',
        s.iconName || 'Printer',
        s.badge || ''
      ]
    );
    saveDb();

    res.status(201).json({
      success: true,
      service: { ...s, id },
      message: 'Service created successfully'
    });
  } catch (err: any) {
    console.error('Error creating service:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/services/:id - Update service
servicesRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = await getDb();
    const s = req.body;

    runSql(
      db,
      `UPDATE services 
       SET name = COALESCE(?, name),
           category = COALESCE(?, category),
           tagline = COALESCE(?, tagline),
           description = COALESCE(?, description),
           turnaround = COALESCE(?, turnaround),
           min_order = COALESCE(?, min_order),
           icon_name = COALESCE(?, icon_name),
           badge = COALESCE(?, badge)
       WHERE id = ?`,
      [
        s.name ?? null,
        s.category ?? null,
        s.tagline ?? null,
        s.description ?? null,
        s.turnaround ?? null,
        s.minOrder ?? null,
        s.iconName ?? null,
        s.badge ?? null,
        id
      ]
    );
    saveDb();

    res.json({ success: true, message: 'Service updated successfully' });
  } catch (err: any) {
    console.error('Error updating service:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/services/:id - Delete service
servicesRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = await getDb();
    runSql(db, `DELETE FROM services WHERE id = ?`, [id]);
    saveDb();

    res.json({ success: true, message: 'Service deleted successfully' });
  } catch (err: any) {
    console.error('Error deleting service:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});
