import { Router, Request, Response } from 'express';
import { getDb, saveDb, queryAll, queryOne, runSql } from '../db.js';

export const reviewsRouter = Router();

// GET /api/reviews - Get all reviews
reviewsRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const db = await getDb();
    const rows = queryAll(db, `SELECT * FROM reviews ORDER BY created_at DESC`);
    const reviews = rows.map((row: any) => ({
      id: row.id,
      customerName: row.customer_name,
      customerRole: row.customer_role,
      productName: row.product_name,
      rating: Number(row.rating) || 5,
      comment: row.comment,
      date: row.date || 'Recently',
      status: row.status || 'Approved',
      verifiedBuyer: row.verified_buyer === 1,
      createdAt: row.created_at
    }));

    res.json({ success: true, reviews });
  } catch (err: any) {
    console.error('Error fetching reviews:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/reviews - Create review
reviewsRouter.post('/', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const r = req.body;
    const id = r.id || `REV-${Date.now()}`;

    runSql(
      db,
      `INSERT INTO reviews (id, customer_name, customer_role, product_name, rating, comment, date, status, verified_buyer)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        r.customerName || 'Verified Buyer',
        r.customerRole || 'Client',
        r.productName || 'Print Product',
        Number(r.rating) || 5,
        r.comment || '',
        r.date || 'Just now',
        r.status || 'Approved',
        r.verifiedBuyer !== false ? 1 : 0
      ]
    );
    saveDb();

    res.status(201).json({
      success: true,
      review: { ...r, id },
      message: 'Review saved successfully'
    });
  } catch (err: any) {
    console.error('Error creating review:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/reviews/:id/status - Update review status
reviewsRouter.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const db = await getDb();

    runSql(db, `UPDATE reviews SET status = ? WHERE id = ?`, [status, id]);
    saveDb();

    res.json({ success: true, message: `Review status updated to ${status}` });
  } catch (err: any) {
    console.error('Error updating review status:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/reviews/:id - Delete review
reviewsRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = await getDb();
    runSql(db, `DELETE FROM reviews WHERE id = ?`, [id]);
    saveDb();

    res.json({ success: true, message: 'Review deleted' });
  } catch (err: any) {
    console.error('Error deleting review:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});
