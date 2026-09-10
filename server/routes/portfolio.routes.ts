import { Router, Request, Response } from 'express';
import { getDb, saveDb, queryAll, queryOne, runSql } from '../db.js';
import { removeUploadIfUnused } from '../utils/uploadCleanup.js';

export const portfolioRouter = Router();

const mapPortfolioRow = (row: any) => {
  let tags: string[] = [];
  let deliverables: string[] = [];
  let deliverablesMr: string[] = [];
  try { tags = JSON.parse(row.tags_json || '[]'); } catch (_e) {}
  try { deliverables = JSON.parse(row.deliverables_json || '[]'); } catch (_e) {}
  try { deliverablesMr = JSON.parse(row.deliverables_mr_json || '[]'); } catch (_e) {}

  return {
    id: row.id,
    title: row.title,
    titleMr: row.title_mr || row.title,
    category: row.category,
    categoryLabel: row.category_label || row.category,
    categoryLabelMr: row.category_label_mr || row.category_label || row.category,
    client: row.client,
    city: row.city,
    cityMr: row.city_mr || row.city,
    image: row.image,
    aspectRatio: row.aspect_ratio || 'square',
    description: row.description || '',
    descriptionMr: row.description_mr || '',
    tags,
    deliverables,
    deliverablesMr,
    badge: row.badge || '',
    badgeMr: row.badge_mr || ''
  };
};

// GET /api/portfolio - Get all portfolio items
portfolioRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const db = await getDb();
    const rows = queryAll(db, `SELECT * FROM portfolio ORDER BY created_at ASC`);
    const portfolio = rows.map(mapPortfolioRow);
    res.json({ success: true, portfolio });
  } catch (err: any) {
    console.error('Error fetching portfolio:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/portfolio - Create portfolio item
portfolioRouter.post('/', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const item = req.body;
    const id = item.id || `work-${Date.now()}`;

    runSql(
      db,
      `INSERT INTO portfolio (
        id, title, title_mr, category, category_label, category_label_mr,
        client, city, city_mr, image, aspect_ratio, description, description_mr,
        tags_json, deliverables_json, deliverables_mr_json, badge, badge_mr
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        item.title,
        item.titleMr || item.title,
        item.category || 'branding',
        item.categoryLabel || item.category,
        item.categoryLabelMr || item.categoryLabel || item.category,
        item.client || '',
        item.city || 'Chh. Sambhajinagar',
        item.cityMr || 'छत्रपती संभाजीनगर',
        item.image,
        item.aspectRatio || 'square',
        item.description || '',
        item.descriptionMr || '',
        JSON.stringify(item.tags || []),
        JSON.stringify(item.deliverables || []),
        JSON.stringify(item.deliverablesMr || []),
        item.badge || '',
        item.badgeMr || ''
      ]
    );
    saveDb();

    res.status(201).json({
      success: true,
      item: { ...item, id },
      message: 'Portfolio item added successfully'
    });
  } catch (err: any) {
    console.error('Error creating portfolio item:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/portfolio/:id - Update portfolio item
portfolioRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = await getDb();
    const item = req.body;
    const existing = queryOne<{ image: string }>(db, `SELECT image FROM portfolio WHERE id = ?`, [id]);

    runSql(
      db,
      `UPDATE portfolio
       SET title = COALESCE(?, title),
           title_mr = COALESCE(?, title_mr),
           category = COALESCE(?, category),
           category_label = COALESCE(?, category_label),
           category_label_mr = COALESCE(?, category_label_mr),
           client = COALESCE(?, client),
           city = COALESCE(?, city),
           city_mr = COALESCE(?, city_mr),
           image = COALESCE(?, image),
           aspect_ratio = COALESCE(?, aspect_ratio),
           description = COALESCE(?, description),
           description_mr = COALESCE(?, description_mr),
           tags_json = COALESCE(?, tags_json),
           deliverables_json = COALESCE(?, deliverables_json),
           deliverables_mr_json = COALESCE(?, deliverables_mr_json),
           badge = COALESCE(?, badge),
           badge_mr = COALESCE(?, badge_mr)
       WHERE id = ?`,
      [
        item.title ?? null,
        item.titleMr ?? null,
        item.category ?? null,
        item.categoryLabel ?? null,
        item.categoryLabelMr ?? null,
        item.client ?? null,
        item.city ?? null,
        item.cityMr ?? null,
        item.image ?? null,
        item.aspectRatio ?? null,
        item.description ?? null,
        item.descriptionMr ?? null,
        item.tags ? JSON.stringify(item.tags) : null,
        item.deliverables ? JSON.stringify(item.deliverables) : null,
        item.deliverablesMr ? JSON.stringify(item.deliverablesMr) : null,
        item.badge ?? null,
        item.badgeMr ?? null,
        id
      ]
    );
    saveDb();

    if (existing && item.image && item.image !== existing.image) {
      removeUploadIfUnused(db, existing.image);
    }

    res.json({ success: true, message: 'Portfolio item updated successfully' });
  } catch (err: any) {
    console.error('Error updating portfolio item:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/portfolio/:id - Delete portfolio item
portfolioRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = await getDb();
    const existing = queryOne<{ image: string }>(db, `SELECT image FROM portfolio WHERE id = ?`, [id]);
    runSql(db, `DELETE FROM portfolio WHERE id = ?`, [id]);
    saveDb();
    if (existing) removeUploadIfUnused(db, existing.image);

    res.json({ success: true, message: 'Portfolio item deleted successfully' });
  } catch (err: any) {
    console.error('Error deleting portfolio item:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});
