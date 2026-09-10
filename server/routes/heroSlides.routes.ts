import { Router, Request, Response } from 'express';
import { getDb, saveDb, queryAll, queryOne, runSql } from '../db.js';
import { getStoredUploadPath, removeUploadIfUnused, removeUploadsIfUnused } from '../utils/uploadCleanup.js';

export const heroSlidesRouter = Router();

const mapHeroSlideRow = (row: any) => ({
  id: row.id,
  title1: row.title1 || '',
  title2: row.title2 || '',
  highlight: row.highlight || '',
  subtitle: row.subtitle || '',
  image: row.image,
  buttonText: row.button_text || 'Order Now',
  quoteButtonText: row.quote_button_text || 'Get Quote',
  typeLabel: row.type_label || '',
  productId: row.product_id || '',
  categoryLink: row.category_link || '',
  theme: row.theme || 'crimson',
  tag: row.tag || '',
  badge: row.badge || '',
  displayOrder: row.display_order ?? 0,
  isActive: row.is_active === 1 || row.is_active === true,
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

// GET /api/hero-slides - Get all hero slides
heroSlidesRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const db = await getDb();
    const rows = queryAll(db, `SELECT * FROM hero_slides ORDER BY display_order ASC, created_at ASC`);
    const slides = rows.map(mapHeroSlideRow);
    res.json({ success: true, slides });
  } catch (err: any) {
    console.error('Error fetching hero slides:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/hero-slides/active - Get active hero slides only
heroSlidesRouter.get('/active', async (_req: Request, res: Response) => {
  try {
    const db = await getDb();
    const rows = queryAll(db, `SELECT * FROM hero_slides WHERE is_active = 1 ORDER BY display_order ASC, created_at ASC`);
    const slides = rows.map(mapHeroSlideRow);
    res.json({ success: true, slides });
  } catch (err: any) {
    console.error('Error fetching active hero slides:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/hero-slides - Create new hero slide
heroSlidesRouter.post('/', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const {
      title1,
      title2,
      highlight,
      subtitle,
      image,
      buttonText,
      quoteButtonText,
      typeLabel,
      productId,
      categoryLink,
      theme,
      tag,
      badge,
      displayOrder,
      isActive
    } = req.body;

    if (!image || !image.trim()) {
      return res.status(400).json({ success: false, error: 'Hero banner image URL or upload is required' });
    }

    const id = `slide-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    let order = typeof displayOrder === 'number' ? displayOrder : 0;
    if (typeof displayOrder !== 'number') {
      const maxRow = queryOne<{ max_order: number }>(db, `SELECT MAX(display_order) as max_order FROM hero_slides`);
      order = (maxRow?.max_order || 0) + 1;
    }

    const activeVal = isActive === false ? 0 : 1;

    runSql(
      db,
      `INSERT INTO hero_slides (id, title1, title2, highlight, subtitle, image, button_text, quote_button_text, type_label, product_id, category_link, theme, tag, badge, display_order, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        title1 || 'Exclusive Commercial Print Services',
        title2 || '',
        highlight || '',
        subtitle || '',
        image.trim(),
        buttonText || 'Order Now',
        quoteButtonText || 'Quick Quote',
        typeLabel || 'Printing',
        productId || '',
        categoryLink || '/products',
        theme || 'crimson',
        tag || '',
        badge || '',
        order,
        activeVal
      ]
    );
    saveDb();

    const createdSlide = {
      id,
      title1: title1 || 'Exclusive Commercial Print Services',
      title2: title2 || '',
      highlight: highlight || '',
      subtitle: subtitle || '',
      image: image.trim(),
      buttonText: buttonText || 'Order Now',
      quoteButtonText: quoteButtonText || 'Quick Quote',
      typeLabel: typeLabel || 'Printing',
      productId: productId || '',
      categoryLink: categoryLink || '/products',
      theme: theme || 'crimson',
      tag: tag || '',
      badge: badge || '',
      displayOrder: order,
      isActive: activeVal === 1,
      createdAt: new Date().toISOString()
    };

    res.status(201).json({ success: true, slide: createdSlide, message: 'Hero slide created successfully' });
  } catch (err: any) {
    console.error('Error creating hero slide:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/hero-slides/:id - Update hero slide
heroSlidesRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = await getDb();
    const {
      title1,
      title2,
      highlight,
      subtitle,
      image,
      buttonText,
      quoteButtonText,
      typeLabel,
      productId,
      categoryLink,
      theme,
      tag,
      badge,
      displayOrder,
      isActive
    } = req.body;

    const existingSlide = queryOne<{ image: string }>(db, `SELECT image FROM hero_slides WHERE id = ?`, [id]);
    if (!existingSlide) {
      return res.status(404).json({ success: false, error: 'Hero slide not found' });
    }

    const nextImage = typeof image === 'string' && image.trim() ? image.trim() : existingSlide.image;
    const oldImagePath = getStoredUploadPath(existingSlide.image);
    const nextImagePath = getStoredUploadPath(nextImage);

    const activeVal = isActive === false ? 0 : 1;

    runSql(
      db,
      `UPDATE hero_slides 
       SET title1 = ?, title2 = ?, highlight = ?, subtitle = ?, image = ?, button_text = ?, quote_button_text = ?,
           type_label = ?, product_id = ?, category_link = ?, theme = ?, tag = ?, badge = ?, display_order = ?,
           is_active = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        title1 || '',
        title2 || '',
        highlight || '',
        subtitle || '',
        nextImage,
        buttonText || 'Order Now',
        quoteButtonText || 'Quick Quote',
        typeLabel || '',
        productId || '',
        categoryLink || '',
        theme || 'crimson',
        tag || '',
        badge || '',
        typeof displayOrder === 'number' ? displayOrder : 0,
        activeVal,
        id
      ]
    );
    saveDb();

    if (oldImagePath && oldImagePath !== nextImagePath) {
      removeUploadIfUnused(db, existingSlide.image);
    }

    res.json({ success: true, message: 'Hero slide updated successfully' });
  } catch (err: any) {
    console.error('Error updating hero slide:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/hero-slides/reorder - Reorder hero slides in a batch
heroSlidesRouter.post('/reorder', async (req: Request, res: Response) => {
  try {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ success: false, error: 'orderedIds array is required' });
    }

    const db = await getDb();
    orderedIds.forEach((id: string, index: number) => {
      runSql(db, `UPDATE hero_slides SET display_order = ? WHERE id = ?`, [index + 1, id]);
    });
    saveDb();

    res.json({ success: true, message: 'Hero slides reordered successfully' });
  } catch (err: any) {
    console.error('Error reordering hero slides:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/hero-slides/:id - Delete hero slide
heroSlidesRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = await getDb();
    const existingSlide = queryOne<{ image: string }>(db, `SELECT image FROM hero_slides WHERE id = ?`, [id]);
    runSql(db, `DELETE FROM hero_slides WHERE id = ?`, [id]);
    saveDb();

    if (existingSlide) {
      removeUploadIfUnused(db, existingSlide.image);
    }

    res.json({ success: true, message: 'Hero slide deleted successfully' });
  } catch (err: any) {
    console.error('Error deleting hero slide:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/hero-slides/reset - Reset hero slides to default
heroSlidesRouter.post('/reset', async (_req: Request, res: Response) => {
  try {
    const db = await getDb();
    const existingImages = queryAll<{ image: string }>(db, `SELECT image FROM hero_slides`).map((row) => row.image);
    runSql(db, `DELETE FROM hero_slides`);
    runSql(
      db,
      `INSERT INTO hero_slides (id, title1, title2, highlight, subtitle, image, button_text, quote_button_text, type_label, product_id, category_link, theme, tag, badge, display_order, is_active)
       VALUES 
       ('slide-1', 'Brochure & Catalog Printing', 'Brochures', 'Printing', 'High-definition full color offset press print', 'https://i.pinimg.com/736x/c6/e3/bb/c6e3bbbd242f377f64021fe55c33b17d.jpg', 'Order Brochures', 'Quick Quote', 'Brochures', 'prod-premium-brochure', '/products?category=brochures', 'crimson', 'Brochures', 'Premium', 1, 1),
       ('slide-2', 'Custom Die Cut Stickers', 'Stickers', 'Stickers', 'Waterproof vinyl stickers & labels in roll/sheet', 'https://i.pinimg.com/1200x/d3/0d/ca/d30dcabb85e6a44689838e953c3d78c3.jpg', 'Order Stickers', 'Enquiry', 'Stickers', 'prod-die-cut-sticker-sheet', '/products?category=stickers', 'crimson', 'Stickers', 'Hot', 2, 1),
       ('slide-3', 'Custom Packaging Boxes', 'Packaging', 'Packaging', 'Luxury rigid boxes & mono-cartons with gold foil', 'https://i.pinimg.com/736x/bb/c1/3d/bbc13d8711ec67195aae22fe376e4d40.jpg', 'Packaging', 'Enquiry', 'Packaging', 'prod-custom-packaging-box', '/products?category=packaging', 'dark', 'Packaging', 'Popular', 3, 1)`
    );
    saveDb();
    removeUploadsIfUnused(db, existingImages);

    res.json({ success: true, message: 'Hero slides reset to factory defaults' });
  } catch (err: any) {
    console.error('Error resetting hero slides:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});
