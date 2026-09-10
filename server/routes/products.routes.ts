import { Router, Request, Response } from 'express';
import { getDb, saveDb, queryAll, queryOne, runSql } from '../db.js';
import { removeUploadsIfUnused } from '../utils/uploadCleanup.js';

export const productsRouter = Router();

export const mapProductRow = (row: any) => {
  let galleryImages: string[] = [];
  let sizes: any[] = [];
  let finishes: any[] = [];
  let features: string[] = [];
  let tags: string[] = [];
  let quantityOptions: number[] = [];
  let specifications: Record<string, string> = {};

  try { galleryImages = JSON.parse(row.gallery_json || '[]'); } catch (_e) { galleryImages = []; }
  try { sizes = JSON.parse(row.sizes_json || '[]'); } catch (_e) { sizes = []; }
  try { finishes = JSON.parse(row.finishes_json || '[]'); } catch (_e) { finishes = []; }
  try { features = JSON.parse(row.features_json || '[]'); } catch (_e) { features = []; }
  try { tags = JSON.parse(row.tags_json || '[]'); } catch (_e) { tags = []; }
  try { quantityOptions = JSON.parse(row.quantity_options_json || '[]'); } catch (_e) { quantityOptions = []; }
  try { specifications = JSON.parse(row.specifications_json || '{}'); } catch (_e) { specifications = {}; }

  // Filter out any legacy invalid abstract wallpaper and ensure primary image is first
  const validGallery = galleryImages.filter((img) => img && !img.includes('1618005182384-a83a8bd57fbe'));
  if (row.image) {
    const withoutCover = validGallery.filter((img) => img !== row.image);
    galleryImages = [row.image, ...withoutCover];
  } else if (validGallery.length > 0) {
    galleryImages = validGallery;
  }

  return {
    id: row.id,
    name: row.name,
    nameMr: row.name_mr || row.name,
    tagline: row.tagline || '',
    badge: row.badge || '',
    unit: row.unit || 'pcs',
    categoryId: row.category_id,
    categoryName: row.category_name,
    category: row.category_name || row.category_id,
    basePrice: Number(row.base_price) || 0,
    originalPrice: row.original_price ? Number(row.original_price) : undefined,
    description: row.description || '',
    descriptionMr: row.description_mr || '',
    image: row.image,
    galleryImages,
    rating: Number(row.rating) || 4.9,
    reviewsCount: Number(row.reviews_count) || 1,
    minQuantity: Number(row.min_quantity) || 10,
    defaultQuantity: Number(row.default_quantity) || 100,
    quantityOptions: quantityOptions.length > 0 ? quantityOptions : [100, 250, 500, 1000, 2000],
    sizes,
    finishes,
    features,
    specifications,
    tags,
    turnaroundDays: Number(row.turnaround_days) || 1,
    singlePrice: row.single_price ? Number(row.single_price) : undefined,
    bulkPrice100: row.bulk_price_100 ? Number(row.bulk_price_100) : undefined,
    bulkPrice500: row.bulk_price_500 ? Number(row.bulk_price_500) : undefined,
    bulkPrice1000: row.bulk_price_1000 ? Number(row.bulk_price_1000) : undefined,
    isPopular: row.is_popular === 1 || row.is_popular === true,
    isBestSeller: row.is_best_seller === 1 || row.is_best_seller === true,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
};

// GET /api/products - Get products with optional search, category, and pagination
productsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const { category, search, popular, bestSeller, limit, page } = req.query;

    let sql = `SELECT * FROM products WHERE 1=1`;
    const params: any[] = [];

    if (category && typeof category === 'string' && category.trim() !== '' && category !== 'all') {
      sql += ` AND (category_id = ? OR LOWER(category_name) = LOWER(?))`;
      params.push(category.trim(), category.trim());
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      sql += ` AND (LOWER(name) LIKE ? OR LOWER(description) LIKE ? OR LOWER(tags_json) LIKE ?)`;
      const searchPattern = `%${search.trim().toLowerCase()}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    if (popular === 'true' || popular === '1') {
      sql += ` AND is_popular = 1`;
    }

    if (bestSeller === 'true' || bestSeller === '1') {
      sql += ` AND is_best_seller = 1`;
    }

    sql += ` ORDER BY is_best_seller DESC, is_popular DESC, created_at DESC`;

    // Optional pagination
    if (limit) {
      const take = Math.max(1, parseInt(limit as string, 10) || 50);
      const skip = Math.max(0, ((parseInt(page as string, 10) || 1) - 1) * take);
      sql += ` LIMIT ? OFFSET ?`;
      params.push(take, skip);
    }

    const rows = queryAll(db, sql, params);
    const products = rows.map(mapProductRow);

    res.json({ success: true, products, count: products.length });
  } catch (err: any) {
    console.error('Error fetching products:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/products/:id - Get single product
productsRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = await getDb();
    const row = queryOne(db, `SELECT * FROM products WHERE id = ? LIMIT 1`, [id]);

    if (!row) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    res.json({ success: true, product: mapProductRow(row) });
  } catch (err: any) {
    console.error('Error fetching product:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/products - Create new product
productsRouter.post('/', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const p = req.body;

    if (!p.name || !p.categoryId) {
      return res.status(400).json({ success: false, error: 'Product name and category are required' });
    }

    const id = p.id || `prod-${Date.now()}`;
    const galleryJson = JSON.stringify(p.galleryImages || (p.image ? [p.image] : []));
    const sizesJson = JSON.stringify(p.sizes || []);
    const finishesJson = JSON.stringify(p.finishes || []);
    const featuresJson = JSON.stringify(p.features || []);
    const tagsJson = JSON.stringify(p.tags || []);
    const quantityOptionsJson = JSON.stringify(p.quantityOptions || []);
    const specificationsJson = JSON.stringify(p.specifications || {});

    runSql(
      db,
      `INSERT INTO products (
        id, name, name_mr, category_id, category_name, base_price, original_price,
        description, description_mr, image, gallery_json, rating, reviews_count,
        min_quantity, default_quantity, sizes_json, finishes_json, features_json,
        tags_json, turnaround_days, single_price, bulk_price_100, bulk_price_500,
        bulk_price_1000, is_popular, is_best_seller, quantity_options_json, unit,
        badge, tagline, specifications_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        p.name,
        p.nameMr || p.name,
        p.categoryId,
        p.categoryName || p.category || '',
        Number(p.basePrice) || 0,
        p.originalPrice ? Number(p.originalPrice) : null,
        p.description || '',
        p.descriptionMr || '',
        p.image || '',
        galleryJson,
        Number(p.rating) || 4.9,
        Number(p.reviewsCount) || 1,
        Number(p.minQuantity) || 10,
        Number(p.defaultQuantity) || 100,
        sizesJson,
        finishesJson,
        featuresJson,
        tagsJson,
        Number(p.turnaroundDays) || 1,
        p.singlePrice ? Number(p.singlePrice) : null,
        p.bulkPrice100 ? Number(p.bulkPrice100) : null,
        p.bulkPrice500 ? Number(p.bulkPrice500) : null,
        p.bulkPrice1000 ? Number(p.bulkPrice1000) : null,
        p.isPopular !== false ? 1 : 0,
        p.isBestSeller !== false ? 1 : 0,
        quantityOptionsJson,
        p.unit || 'pcs',
        p.badge || null,
        p.tagline || null,
        specificationsJson
      ]
    );
    saveDb();

    const created = queryOne(db, `SELECT * FROM products WHERE id = ?`, [id]);
    res.status(201).json({
      success: true,
      product: mapProductRow(created),
      message: 'Product created successfully'
    });
  } catch (err: any) {
    console.error('Error creating product:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/products/:id - Update product
productsRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = await getDb();
    const p = req.body;

    const existing = queryOne<{ id: string; image: string; gallery_json: string }>(db, `SELECT id, image, gallery_json FROM products WHERE id = ?`, [id]);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    runSql(
      db,
      `UPDATE products 
       SET name = COALESCE(?, name),
           name_mr = COALESCE(?, name_mr),
           category_id = COALESCE(?, category_id),
           category_name = COALESCE(?, category_name),
           base_price = COALESCE(?, base_price),
           original_price = COALESCE(?, original_price),
           description = COALESCE(?, description),
           description_mr = COALESCE(?, description_mr),
           image = COALESCE(?, image),
           gallery_json = COALESCE(?, gallery_json),
           rating = COALESCE(?, rating),
           reviews_count = COALESCE(?, reviews_count),
           min_quantity = COALESCE(?, min_quantity),
           default_quantity = COALESCE(?, default_quantity),
           sizes_json = COALESCE(?, sizes_json),
           finishes_json = COALESCE(?, finishes_json),
           features_json = COALESCE(?, features_json),
           tags_json = COALESCE(?, tags_json),
           turnaround_days = COALESCE(?, turnaround_days),
           single_price = COALESCE(?, single_price),
           bulk_price_100 = COALESCE(?, bulk_price_100),
           bulk_price_500 = COALESCE(?, bulk_price_500),
           bulk_price_1000 = COALESCE(?, bulk_price_1000),
           is_popular = COALESCE(?, is_popular),
           is_best_seller = COALESCE(?, is_best_seller),
           quantity_options_json = COALESCE(?, quantity_options_json),
           unit = COALESCE(?, unit),
           badge = COALESCE(?, badge),
           tagline = COALESCE(?, tagline),
           specifications_json = COALESCE(?, specifications_json),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        p.name ?? null,
        p.nameMr ?? null,
        p.categoryId ?? null,
        (p.categoryName || p.category) ?? null,
        p.basePrice !== undefined ? Number(p.basePrice) : null,
        p.originalPrice !== undefined ? Number(p.originalPrice) : null,
        p.description ?? null,
        p.descriptionMr ?? null,
        p.image ?? null,
        p.galleryImages ? JSON.stringify(p.galleryImages) : null,
        p.rating !== undefined ? Number(p.rating) : null,
        p.reviewsCount !== undefined ? Number(p.reviewsCount) : null,
        p.minQuantity !== undefined ? Number(p.minQuantity) : null,
        p.defaultQuantity !== undefined ? Number(p.defaultQuantity) : null,
        p.sizes ? JSON.stringify(p.sizes) : null,
        p.finishes ? JSON.stringify(p.finishes) : null,
        p.features ? JSON.stringify(p.features) : null,
        p.tags ? JSON.stringify(p.tags) : null,
        p.turnaroundDays !== undefined ? Number(p.turnaroundDays) : null,
        p.singlePrice !== undefined ? Number(p.singlePrice) : null,
        p.bulkPrice100 !== undefined ? Number(p.bulkPrice100) : null,
        p.bulkPrice500 !== undefined ? Number(p.bulkPrice500) : null,
        p.bulkPrice1000 !== undefined ? Number(p.bulkPrice1000) : null,
        p.isPopular !== undefined ? (p.isPopular ? 1 : 0) : null,
        p.isBestSeller !== undefined ? (p.isBestSeller ? 1 : 0) : null,
        p.quantityOptions ? JSON.stringify(p.quantityOptions) : null,
        p.unit ?? null,
        p.badge ?? null,
        p.tagline ?? null,
        p.specifications ? JSON.stringify(p.specifications) : null,
        id
      ]
    );
    saveDb();

    const oldImages: string[] = [existing.image];
    try {
      const gallery = JSON.parse(existing.gallery_json || '[]');
      if (Array.isArray(gallery)) oldImages.push(...gallery);
    } catch (_error) {}
    removeUploadsIfUnused(db, oldImages);

    const updated = queryOne(db, `SELECT * FROM products WHERE id = ?`, [id]);
    res.json({
      success: true,
      product: mapProductRow(updated),
      message: 'Product updated successfully'
    });
  } catch (err: any) {
    console.error('Error updating product:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/products/:id - Delete product
productsRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = await getDb();
    const existing = queryOne<{ image: string; gallery_json: string }>(db, `SELECT image, gallery_json FROM products WHERE id = ?`, [id]);
    runSql(db, `DELETE FROM products WHERE id = ?`, [id]);
    saveDb();
    if (existing) {
      const oldImages: string[] = [existing.image];
      try {
        const gallery = JSON.parse(existing.gallery_json || '[]');
        if (Array.isArray(gallery)) oldImages.push(...gallery);
      } catch (_error) {}
      removeUploadsIfUnused(db, oldImages);
    }
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (err: any) {
    console.error('Error deleting product:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});
