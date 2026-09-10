import { Router, Request, Response } from 'express';
import { getDb, saveDb, queryAll, queryOne, runSql } from '../db.js';
import { removeUploadIfUnused } from '../utils/uploadCleanup.js';

export const categoriesRouter = Router();

// GET /api/categories - Get all categories with real-time product counts
categoriesRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const db = await getDb();

    // Query categories
    const categoriesRows = queryAll(db, `SELECT * FROM categories ORDER BY featured DESC, name ASC`);

    // Fetch product counts grouped by category for high performance O(1) lookups
    const countRows = queryAll<{ category_id: string; cnt: number }>(
      db,
      `SELECT category_id, COUNT(*) as cnt FROM products GROUP BY category_id`
    );

    const countMap = new Map<string, number>();
    for (const r of countRows) {
      if (r.category_id) {
        countMap.set(r.category_id.toLowerCase(), Number(r.cnt) || 0);
      }
    }

    const categories = categoriesRows.map(row => {
      const catId = (row.id || '').toLowerCase();
      const productCount = countMap.get(catId) ?? Number(row.item_count) ?? 0;

      return {
        id: row.id,
        name: row.name,
        nameMr: row.name_mr || row.name,
        shortName: row.short_name || row.name,
        subtitle: row.subtitle || '',
        iconName: row.icon_name || 'Tag',
        image: row.image,
        itemCount: productCount,
        featured: row.featured === 1,
        description: row.description || '',
        createdAt: row.created_at
      };
    });

    res.json({ success: true, categories });
  } catch (err: any) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/categories - Create category
categoriesRouter.post('/', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const c = req.body;
    if (!c.name) {
      return res.status(400).json({ success: false, error: 'Category name is required' });
    }

    const id = c.id || c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    runSql(
      db,
      `INSERT INTO categories (id, name, name_mr, short_name, subtitle, icon_name, image, item_count, featured, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        c.name,
        c.nameMr || c.name,
        c.shortName || c.name,
        c.subtitle || '',
        c.iconName || 'Tag',
        c.image || '',
        Number(c.itemCount) || 0,
        c.featured !== false ? 1 : 0,
        c.description || ''
      ]
    );
    saveDb();

    res.status(201).json({
      success: true,
      category: { ...c, id },
      message: 'Category created successfully'
    });
  } catch (err: any) {
    console.error('Error creating category:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/categories/:id - Update category
categoriesRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = await getDb();
    const c = req.body;
    const existing = queryOne<{ image: string }>(db, `SELECT image FROM categories WHERE id = ?`, [id]);

    runSql(
      db,
      `UPDATE categories 
       SET name = COALESCE(?, name),
           name_mr = COALESCE(?, name_mr),
           short_name = COALESCE(?, short_name),
           subtitle = COALESCE(?, subtitle),
           icon_name = COALESCE(?, icon_name),
           image = COALESCE(?, image),
           featured = COALESCE(?, featured),
           description = COALESCE(?, description)
       WHERE id = ?`,
      [
        c.name ?? null,
        c.nameMr ?? null,
        c.shortName ?? null,
        c.subtitle ?? null,
        c.iconName ?? null,
        c.image ?? null,
        c.featured !== undefined ? (c.featured ? 1 : 0) : null,
        c.description ?? null,
        id
      ]
    );
    saveDb();

    if (existing && c.image && c.image !== existing.image) {
      removeUploadIfUnused(db, existing.image);
    }

    res.json({ success: true, message: 'Category updated successfully' });
  } catch (err: any) {
    console.error('Error updating category:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/categories/:id - Delete category
categoriesRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = await getDb();
    const existing = queryOne<{ image: string }>(db, `SELECT image FROM categories WHERE id = ?`, [id]);
    runSql(db, `DELETE FROM categories WHERE id = ?`, [id]);
    saveDb();
    if (existing) removeUploadIfUnused(db, existing.image);
    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (err: any) {
    console.error('Error deleting category:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});
