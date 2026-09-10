import { Router, Request, Response } from 'express';
import { getDb, saveDb, saveDbImmediate, queryAll, queryOne, runSql } from '../db.js';

export const ordersRouter = Router();

export const generateOrderTimeline = (status: string, createdAt?: string) => {
  const normStatus = (status || 'Order Placed').trim().toLowerCase();

  const stepOrder = [
    { key: 'placed', title: 'Order Placed', titleMr: 'ऑर्डर नोंदवली', description: 'Order details and print specifications confirmed in system.' },
    { key: 'proof', title: 'Design Proof Approved', titleMr: 'प्री-प्रेस आर्टवर्क तपासणी', description: 'Pre-press inspection: 300 DPI CMYK color separation & cut-lines verified.' },
    { key: 'printing', title: 'In Printing', titleMr: 'प्रिंटिंग सुरू (In Printing)', description: 'Heidelberg Speedmaster 4-Color press actively printing sheets.' },
    { key: 'quality', title: 'Quality Check', titleMr: 'गुणवत्ता तपासणी (Quality Check)', description: 'Velvet matte lamination, precision die-cutting & QA inspection passed.' },
    { key: 'dispatched', title: 'Dispatched', titleMr: 'डिलिव्हरी रवाना (Dispatched)', description: 'Package dispatched via express courier with live docket tracking.' },
    { key: 'delivered', title: 'Delivered', titleMr: 'डिलिव्हरी पूर्ण (Delivered)', description: 'Order delivered to recipient destination and signed off.' }
  ];

  let currentIdx = 0;
  if (normStatus.includes('cancel')) {
    currentIdx = -1;
  } else if (normStatus.includes('deliver') || normStatus === 'completed') {
    currentIdx = 5;
  } else if (normStatus.includes('dispatch') || normStatus.includes('ship')) {
    currentIdx = 4;
  } else if (normStatus.includes('quality') || normStatus.includes('pick') || normStatus.includes('pack')) {
    currentIdx = 3;
  } else if (normStatus.includes('print') || normStatus.includes('process') || normStatus.includes('product')) {
    currentIdx = 2;
  } else if (normStatus.includes('proof') || normStatus.includes('confirm')) {
    currentIdx = 1;
  } else {
    currentIdx = 0;
  }

  const baseDate = createdAt ? new Date(createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Today';

  return stepOrder.map((st, idx) => {
    const isCompleted = currentIdx >= idx;
    const isCurrent = currentIdx === idx;

    return {
      title: st.title,
      titleMr: st.titleMr,
      description: st.description,
      date: isCompleted ? (idx === 0 ? baseDate : 'Completed') : (isCurrent ? 'In Progress' : 'Upcoming'),
      completed: isCompleted,
      current: isCurrent
    };
  });
};

export const mapOrderRow = (row: any) => {
  let items = [];
  let timeline: any[] = [];
  try { items = JSON.parse(row.items_json || '[]'); } catch (_e) { items = []; }
  try { timeline = JSON.parse(row.timeline_json || '[]'); } catch (_e) { timeline = []; }

  if (!timeline || timeline.length === 0) {
    timeline = generateOrderTimeline(row.status || 'Order Placed', row.created_at);
  }

  return {
    id: row.id,
    orderNumber: row.order_number,
    trackingNumber: row.tracking_number,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    customerPhone: row.customer_phone,
    shippingAddress: row.shipping_address,
    city: row.city,
    pincode: row.pincode,
    subtotal: Number(row.subtotal) || 0,
    tax: Number(row.tax) || 0,
    shippingFee: Number(row.shipping_fee) || 0,
    discount: Number(row.discount) || 0,
    total: Number(row.total) || 0,
    totalAmount: Number(row.total) || 0,
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status || 'Pending',
    status: row.status || 'Order Placed',
    items,
    timeline,
    notes: row.notes || '',
    uploadedFileUrl: row.uploaded_file_url || '',
    uploadedFileName: row.uploaded_file_name || '',
    userId: row.user_id || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
};

// GET /api/orders - Get all orders (with optional filtering by userId, status, search, pagination)
ordersRouter.get('/', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const { userId, status, search, limit, page } = req.query;

    let sql = `SELECT * FROM orders WHERE 1=1`;
    const params: any[] = [];

    if (userId && typeof userId === 'string' && userId.trim() !== '') {
      sql += ` AND (user_id = ? OR customer_email = ?)`;
      params.push(userId.trim(), userId.trim());
    }

    if (status && typeof status === 'string' && status.trim() !== '' && status !== 'all') {
      sql += ` AND LOWER(status) = LOWER(?)`;
      params.push(status.trim());
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      sql += ` AND (LOWER(order_number) LIKE ? OR LOWER(tracking_number) LIKE ? OR LOWER(customer_name) LIKE ? OR LOWER(customer_phone) LIKE ?)`;
      const searchPattern = `%${search.trim().toLowerCase()}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    sql += ` ORDER BY created_at DESC`;

    if (limit) {
      const take = Math.max(1, parseInt(limit as string, 10) || 50);
      const skip = Math.max(0, ((parseInt(page as string, 10) || 1) - 1) * take);
      sql += ` LIMIT ? OFFSET ?`;
      params.push(take, skip);
    }

    const rows = queryAll(db, sql, params);
    const orders = rows.map(mapOrderRow);

    res.json({ success: true, orders, count: orders.length });
  } catch (err: any) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/orders/stats/summary - Summary statistics for dashboard
ordersRouter.get('/stats/summary', async (_req: Request, res: Response) => {
  try {
    const db = await getDb();
    const totalOrders = queryOne<{ count: number }>(db, `SELECT COUNT(*) as count FROM orders`)?.count || 0;
    const totalRevenue = queryOne<{ sum: number }>(db, `SELECT COALESCE(SUM(total), 0) as sum FROM orders WHERE payment_status = 'Paid'`)?.sum || 0;
    const pendingOrders = queryOne<{ count: number }>(db, `SELECT COUNT(*) as count FROM orders WHERE status != 'Delivered'`)?.count || 0;
    const deliveredOrders = queryOne<{ count: number }>(db, `SELECT COUNT(*) as count FROM orders WHERE status = 'Delivered'`)?.count || 0;

    res.json({
      success: true,
      stats: {
        totalOrders,
        totalRevenue,
        pendingOrders,
        deliveredOrders
      }
    });
  } catch (err: any) {
    console.error('Error fetching order stats:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/orders/:id - Get single order by id, order_number, or tracking_number
ordersRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = await getDb();
    const row = queryOne(
      db,
      `SELECT * FROM orders WHERE id = ? OR order_number = ? OR tracking_number = ? LIMIT 1`,
      [id, id, id]
    );

    if (!row) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    res.json({ success: true, order: mapOrderRow(row) });
  } catch (err: any) {
    console.error('Error fetching order:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/orders - Create new order
ordersRouter.post('/', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const {
      fullName,
      name,
      email,
      phone,
      address,
      city,
      pincode,
      subtotal,
      tax,
      shippingFee,
      discount,
      total,
      paymentMethod,
      paymentStatus,
      status,
      items,
      timeline: customTimeline,
      notes,
      uploadedFileUrl,
      uploadedFileName,
      userId
    } = req.body;

    const orderId = req.body.id || req.body.orderId || `ord-${Date.now()}`;
    const orderNumber = req.body.orderNumber || `PRP-${Math.floor(10000 + Math.random() * 90000)}`;
    const trackingNumber = req.body.trackingNumber || `EXP-IN-${Math.floor(100000 + Math.random() * 900000)}`;
    const custName = req.body.customerName || fullName || name || 'Customer';
    const custPhone = req.body.customerPhone || phone || '9322126863';
    const custAddr = req.body.shippingAddress || address || 'Chhatrapati Sambhajinagar';
    const custCity = city || 'Chhatrapati Sambhajinagar';
    const custPincode = pincode || '431001';
    const sub = Number(subtotal) || 0;
    const tx = Number(tax) || 0;
    const ship = Number(shippingFee) || 0;
    const disc = Number(discount) || 0;
    const tot = Number(total) || (sub + tx + ship - disc);

    const timeline = Array.isArray(customTimeline) && customTimeline.length > 0 ? customTimeline : [
      { title: 'Order Placed & Confirmed', titleMr: 'ऑर्डर नोंदवली व पुष्टी केली', description: 'Specs and artwork received', date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), completed: true, current: true },
      { title: 'Pre-flight Proof Approval', titleMr: 'प्री-प्रेस आर्टवर्क तपासणी', description: 'CMYK color profile and cut-lines verified', date: 'Upcoming', completed: false },
      { title: 'Press Printing', titleMr: 'ऑफसेट / डिजिटल प्रिंटिंग', description: 'Heidelberg 4-Color Speedmaster press', date: 'Upcoming', completed: false },
      { title: 'Quality Check & Finishing', titleMr: 'फिनिशिंग व लॅमिनेशन', description: 'Lamination, Die-Cutting & Packing', date: 'Upcoming', completed: false },
      { title: 'Dispatched via Courier', titleMr: 'डिलिव्हरी रवाना', description: 'Handed to express logistics', date: 'Upcoming', completed: false }
    ];

    runSql(
      db,
      `INSERT INTO orders (id, order_number, tracking_number, customer_name, customer_email, customer_phone, shipping_address, city, pincode, subtotal, tax, shipping_fee, discount, total, payment_method, payment_status, status, items_json, timeline_json, notes, uploaded_file_url, uploaded_file_name, user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderId,
        orderNumber,
        trackingNumber,
        custName,
        email || '',
        custPhone,
        custAddr,
        custCity,
        custPincode,
        sub,
        tx,
        ship,
        disc,
        tot,
        paymentMethod || 'UPI',
        paymentStatus || 'Pending',
        status || 'Order Placed',
        JSON.stringify(items || []),
        JSON.stringify(timeline),
        notes || '',
        uploadedFileUrl || '',
        uploadedFileName || '',
        userId || ''
      ]
    );

    // Immediate flush on critical order creation
    saveDbImmediate();

    const createdOrder = {
      id: orderId,
      orderNumber,
      trackingNumber,
      customerName: custName,
      customerEmail: email || '',
      customerPhone: custPhone,
      shippingAddress: custAddr,
      city: custCity,
      pincode: custPincode,
      subtotal: sub,
      tax: tx,
      shippingFee: ship,
      discount: disc,
      total: tot,
      totalAmount: tot,
      paymentMethod: paymentMethod || 'UPI',
      paymentStatus: paymentStatus || 'Pending',
      status: status || 'Order Placed',
      items: items || [],
      timeline,
      notes: notes || '',
      uploadedFileUrl: uploadedFileUrl || '',
      uploadedFileName: uploadedFileName || '',
      userId: userId || '',
      createdAt: new Date().toISOString()
    };

    res.status(201).json({ success: true, order: createdOrder });
  } catch (err: any) {
    console.error('Order creation error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/orders/:id - Update order
ordersRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = await getDb();
    const o = req.body;

    runSql(
      db,
      `UPDATE orders 
       SET customer_name = COALESCE(?, customer_name),
           customer_phone = COALESCE(?, customer_phone),
           customer_email = COALESCE(?, customer_email),
           shipping_address = COALESCE(?, shipping_address),
           city = COALESCE(?, city),
           pincode = COALESCE(?, pincode),
           status = COALESCE(?, status),
           payment_status = COALESCE(?, payment_status),
           payment_method = COALESCE(?, payment_method),
           tracking_number = COALESCE(?, tracking_number),
           notes = COALESCE(?, notes),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ? OR order_number = ?`,
      [
        o.customerName ?? null,
        o.customerPhone ?? null,
        o.customerEmail ?? null,
        o.shippingAddress ?? null,
        o.city ?? null,
        o.pincode ?? null,
        o.status ?? null,
        o.paymentStatus ?? null,
        o.paymentMethod ?? null,
        o.trackingNumber ?? null,
        o.notes ?? null,
        id,
        id
      ]
    );
    saveDb();

    res.json({ success: true, message: 'Order updated successfully' });
  } catch (err: any) {
    console.error('Error updating order:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/orders/track/:query - Real-time tracking lookup by Order #, Docket #, or Phone
ordersRouter.get('/track/:query', async (req: Request, res: Response) => {
  try {
    const rawQuery = (req.params.query || '').trim();
    if (!rawQuery) {
      return res.status(400).json({ success: false, error: 'Tracking query is required' });
    }

    const clean = rawQuery.toLowerCase().replace('#', '');
    const cleanPhone = rawQuery.replace(/\D/g, '').slice(-10);
    const db = await getDb();

    const row = queryOne(
      db,
      `SELECT * FROM orders 
       WHERE LOWER(id) = ? 
          OR LOWER(order_number) = ? 
          OR LOWER(order_number) LIKE ?
          OR LOWER(tracking_number) = ? 
          OR LOWER(tracking_number) LIKE ?
          OR (customer_phone IS NOT NULL AND customer_phone LIKE ?)
       ORDER BY created_at DESC LIMIT 1`,
      [
        clean,
        clean,
        `%${clean}%`,
        clean,
        `%${clean}%`,
        `%${cleanPhone || clean}%`
      ]
    );

    if (!row) {
      return res.status(404).json({ success: false, error: 'No matching print order found for tracking' });
    }

    const order = mapOrderRow(row);
    res.json({
      success: true,
      order,
      timeline: order.timeline,
      currentStage: order.status,
      lastUpdated: row.updated_at || row.created_at
    });
  } catch (err: any) {
    console.error('Error tracking order:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/orders/:id/status - Update order status, payment status, or tracking
ordersRouter.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus, trackingNumber, notes } = req.body;
    const db = await getDb();

    // Fetch existing order to update timeline accurately
    const existing = queryOne(db, `SELECT * FROM orders WHERE id = ? OR order_number = ? LIMIT 1`, [id, id]);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    let updatedTimelineJson = existing.timeline_json;
    if (status) {
      const newTimeline = generateOrderTimeline(status, existing.created_at);
      updatedTimelineJson = JSON.stringify(newTimeline);
    }

    if (status && paymentStatus) {
      runSql(
        db,
        `UPDATE orders 
         SET status = ?, payment_status = ?, timeline_json = ?, updated_at = CURRENT_TIMESTAMP 
         WHERE id = ? OR order_number = ?`,
        [status, paymentStatus, updatedTimelineJson, id, id]
      );
    } else if (status) {
      runSql(
        db,
        `UPDATE orders 
         SET status = ?, timeline_json = ?, updated_at = CURRENT_TIMESTAMP 
         WHERE id = ? OR order_number = ?`,
        [status, updatedTimelineJson, id, id]
      );
    } else if (paymentStatus) {
      runSql(
        db,
        `UPDATE orders 
         SET payment_status = ?, updated_at = CURRENT_TIMESTAMP 
         WHERE id = ? OR order_number = ?`,
        [paymentStatus, id, id]
      );
    }

    if (trackingNumber) {
      runSql(db, `UPDATE orders SET tracking_number = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? OR order_number = ?`, [trackingNumber, id, id]);
    }

    if (notes) {
      runSql(db, `UPDATE orders SET notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? OR order_number = ?`, [notes, id, id]);
    }

    saveDbImmediate();

    const updatedRow = queryOne(db, `SELECT * FROM orders WHERE id = ? OR order_number = ? LIMIT 1`, [id, id]);
    const updatedOrder = updatedRow ? mapOrderRow(updatedRow) : null;

    res.json({
      success: true,
      message: `Order status updated to ${status || paymentStatus}`,
      order: updatedOrder
    });
  } catch (err: any) {
    console.error('Error updating order status:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/orders/:id - Delete order
ordersRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = await getDb();
    runSql(db, `DELETE FROM orders WHERE id = ? OR order_number = ?`, [id, id]);
    saveDb();
    res.json({ success: true, message: 'Order deleted successfully' });
  } catch (err: any) {
    console.error('Error deleting order:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});
