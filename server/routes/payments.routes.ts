import { Router, Request, Response } from 'express';
import { execute, queryAll } from '../db.js';

export const paymentsRouter = Router();

// GET /api/payments - Get all payments
paymentsRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const rows = await queryAll(`SELECT * FROM payments ORDER BY created_at DESC`);
    const payments = rows.map((row: any) => ({
      id: row.id,
      orderId: row.order_id,
      orderNumber: row.order_number,
      customerName: row.customer_name,
      amount: row.amount,
      method: row.method,
      status: row.status,
      transactionId: row.transaction_id,
      createdAt: row.created_at
    }));

    res.json({ success: true, payments });
  } catch (err: any) {
    console.error('Error fetching payments:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/payments - Record new payment
paymentsRouter.post('/', async (req: Request, res: Response) => {
  try {
    const p = req.body;
    const id = p.id || `PAY-${Date.now()}`;

    await execute(
      `INSERT INTO payments (id, order_id, order_number, customer_name, amount, method, status, transaction_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        p.orderId || '',
        p.orderNumber || '',
        p.customerName || 'Customer',
        Number(p.amount) || 0,
        p.method || 'UPI',
        p.status || 'Completed',
        p.transactionId || `TXN_${Date.now()}`
      ]
    );

    res.status(201).json({ success: true, payment: { ...p, id } });
  } catch (err: any) {
    console.error('Error recording payment:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/payments/:id/status - Update payment status
paymentsRouter.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await execute(`UPDATE payments SET status = ? WHERE id = ?`, [status, id]);

    res.json({ success: true, message: `Payment #${id} marked as ${status}` });
  } catch (err: any) {
    console.error('Error updating payment status:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});
