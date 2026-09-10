import { Router, Request, Response } from 'express';
import { getDb, saveDb, queryAll, queryOne, runSql } from '../db.js';

export const quotesRouter = Router();

// GET /api/quotes - Get all quotes
quotesRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const db = await getDb();
    const rows = queryAll(db, `SELECT * FROM quotes ORDER BY created_at DESC`);
    const quotes = rows.map((row: any) => ({
      id: row.id,
      customerName: row.customer_name,
      clientName: row.customer_name,
      name: row.customer_name,
      customerEmail: row.customer_email,
      email: row.customer_email,
      customerPhone: row.customer_phone,
      phone: row.customer_phone,
      companyName: row.company_name || '',
      productCategory: row.product_category || 'Commercial Printing',
      serviceRequired: row.product_category || 'Commercial Printing',
      category: row.product_category || 'Commercial Printing',
      quantity: row.quantity || 500,
      estimatedQuantity: String(row.quantity || 500),
      paperGsm: row.paper_gsm || '',
      finishType: row.finish_type || '',
      finish: row.finish_type || '',
      size: row.size || '',
      specialInstructions: row.special_instructions || '',
      projectDescription: row.special_instructions || '',
      specifications: row.special_instructions || '',
      status: row.status || 'New',
      createdAt: row.created_at
    }));

    res.json({ success: true, quotes });
  } catch (err: any) {
    console.error('Error fetching quotes:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/quotes - Create quote request
quotesRouter.post('/', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const q = req.body;
    const id = q.id || `quote-${Date.now()}`;

    runSql(
      db,
      `INSERT INTO quotes (id, customer_name, customer_email, customer_phone, company_name, product_category, quantity, paper_gsm, finish_type, size, special_instructions, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        q.customerName || q.clientName || q.name || 'Client',
        q.customerEmail || q.email || '',
        q.customerPhone || q.phone || '9322126863',
        q.companyName || '',
        q.productCategory || q.serviceRequired || q.category || 'Commercial Printing',
        Number(q.quantity || q.estimatedQuantity) || 500,
        q.paperGsm || '',
        q.finishType || q.finish || '',
        q.size || '',
        q.specialInstructions || q.projectDescription || q.customSpecs || q.specifications || q.notes || '',
        q.status || 'New'
      ]
    );
    saveDb();

    res.status(201).json({
      success: true,
      quote: { ...q, id },
      message: 'Quote request submitted successfully'
    });
  } catch (err: any) {
    console.error('Error creating quote:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/quotes/:id/status - Update quote status
quotesRouter.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const db = await getDb();

    runSql(db, `UPDATE quotes SET status = ? WHERE id = ?`, [status, id]);
    saveDb();

    res.json({ success: true, message: `Quote status updated to ${status}` });
  } catch (err: any) {
    console.error('Error updating quote status:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/quotes/:id - Delete quote
quotesRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = await getDb();
    runSql(db, `DELETE FROM quotes WHERE id = ?`, [id]);
    saveDb();

    res.json({ success: true, message: 'Quote request removed' });
  } catch (err: any) {
    console.error('Error deleting quote:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});
