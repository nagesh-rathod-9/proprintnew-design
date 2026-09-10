import { Database } from 'sql.js';
import { CATEGORIES, PRODUCTS } from '../src/data/products.js';
import { PROPRINT_SERVICES } from '../src/data/services.js';
import { GRAPHIC_DESIGN_WORKS } from '../src/data/portfolio.js';

export function seedDatabaseIfEmpty(db: Database) {
  // 1. Seed default categories only for a new database. Existing categories are
  // managed through the API and must survive server restarts unchanged.
  const categoryStmt = db.prepare(`SELECT count(*) as count FROM categories`);
  let categoryCount = 0;
  if (categoryStmt.step()) {
    categoryCount = Number((categoryStmt.getAsObject() as any).count) || 0;
  }
  categoryStmt.free();

  if (categoryCount === 0) {
    for (const cat of CATEGORIES) {
      db.run(
        `INSERT INTO categories (id, name, name_mr, short_name, subtitle, icon_name, image, item_count, featured, description)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          cat.id,
          cat.name,
          cat.nameMr || cat.name,
          cat.shortName || cat.name,
          (cat as any).subtitle || '',
          cat.iconName || 'Tag',
          cat.image,
          cat.itemCount || 10,
          cat.featured ? 1 : 0,
          cat.description || ''
        ]
      );
    }
    console.log(`✅ Seeded ${CATEGORIES.length} default categories into database`);
  } else {
    console.log(`✅ Preserved ${categoryCount} existing categories`);
  }

  // Keep legacy product category IDs mapped without changing category records.
  try {
    db.run(`UPDATE products SET category_id = 'catalogs', category_name = 'Catalog' WHERE category_id IN ('brochures', 'catalog')`);
    db.run(`UPDATE products SET category_id = 'full-sheet', category_name = 'Full Sheet' WHERE category_id IN ('flyers', 'banners')`);
    db.run(`UPDATE products SET category_id = 'pp-files', category_name = 'PP Files' WHERE category_id IN ('project-files', 'id-cards')`);
    db.run(`UPDATE products SET category_id = 'paper-shopping-bags', category_name = 'Paper Shopping' WHERE category_id IN ('paper-bags', 'custom-merch', 'apparel')`);
    db.run(`UPDATE products SET category_id = 'letterheads', category_name = 'Letter Heads' WHERE category_id IN ('stationery')`);
  } catch (err) {
    console.warn('Category cleanup warning:', err);
  }

  // 2. Seed Products if empty
  const prodStmt = db.prepare(`SELECT count(*) as count FROM products`);
  let prodCount = 0;
  if (prodStmt.step()) {
    prodCount = (prodStmt.getAsObject() as any).count || 0;
  }
  prodStmt.free();

  if (prodCount === 0) {
    for (const p of PRODUCTS) {
      const galleryJson = JSON.stringify(p.galleryImages || [p.image]);
      const sizesJson = JSON.stringify(p.sizes || []);
      const finishesJson = JSON.stringify(p.finishes || []);
      const featuresJson = JSON.stringify(p.features || []);
      const tagsJson = JSON.stringify(p.tags || []);

      db.run(
        `INSERT OR REPLACE INTO products (
          id, name, name_mr, category_id, category_name, base_price, original_price, 
          description, description_mr, image, gallery_json, rating, reviews_count, 
          min_quantity, default_quantity, sizes_json, finishes_json, features_json, 
          tags_json, turnaround_days, is_popular, is_best_seller
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          p.id,
          p.name,
          p.nameMr || p.name,
          p.categoryId,
          p.category || p.categoryId,
          p.basePrice || 299,
          p.originalPrice || Math.round((p.basePrice || 299) * 1.3),
          p.description || '',
          p.descriptionMr || '',
          p.image,
          galleryJson,
          p.rating || 4.9,
          p.reviewsCount || 15,
          p.minQuantity || 100,
          p.defaultQuantity || 500,
          sizesJson,
          finishesJson,
          featuresJson,
          tagsJson,
          p.turnaroundDays || 1,
          p.isPopular ? 1 : 0,
          p.isBestSeller ? 1 : 0
        ]
      );
    }
    console.log(`✅ Seeded ${PRODUCTS.length} real products into database`);
  } else {
    // Keep existing products enriched with real gallery images, units, quantityOptions, and specs
    for (const p of PRODUCTS) {
      const galleryList = [
        p.image,
        ...(p.galleryImages || [])
      ].filter((img) => img && !img.includes('1618005182384-a83a8bd57fbe'));
      const uniqueGallery = Array.from(new Set(galleryList));
      const galleryJson = JSON.stringify(uniqueGallery);
      const qtyJson = JSON.stringify(p.quantityOptions || [100, 250, 500, 1000]);
      const specsJson = JSON.stringify(p.specifications || {});

      db.run(
        `UPDATE products SET
          gallery_json = ?,
          image = COALESCE(image, ?),
          unit = ?,
          badge = COALESCE(?, badge),
          tagline = COALESCE(?, tagline),
          quantity_options_json = ?,
          specifications_json = ?
        WHERE id = ?`,
        [galleryJson, p.image, p.unit || 'pcs', p.badge || null, p.tagline || null, qtyJson, specsJson, p.id]
      );
    }
  }

  // 3. Seed Services if empty
  const srvStmt = db.prepare(`SELECT count(*) as count FROM services`);
  let srvCount = 0;
  if (srvStmt.step()) {
    srvCount = (srvStmt.getAsObject() as any).count || 0;
  }
  srvStmt.free();

  if (srvCount === 0) {
    for (const s of PROPRINT_SERVICES) {
      db.run(
        `INSERT OR REPLACE INTO services (id, name, category, tagline, description, turnaround, min_order, icon_name, badge)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          s.id,
          s.name,
          s.category,
          s.tagline || '',
          s.description || '',
          s.turnaround || '24-48 Hours',
          s.minOrder || '1 Concept',
          s.iconName || 'Palette',
          s.badge || ''
        ]
      );
    }
    console.log(`✅ Seeded ${PROPRINT_SERVICES.length} real services into database`);
  }

  // 4. Seed Portfolio if empty
  const portStmt = db.prepare(`SELECT count(*) as count FROM portfolio`);
  let portCount = 0;
  if (portStmt.step()) {
    portCount = (portStmt.getAsObject() as any).count || 0;
  }
  portStmt.free();

  if (portCount === 0) {
    for (const item of (GRAPHIC_DESIGN_WORKS as any[])) {
      db.run(
        `INSERT OR REPLACE INTO portfolio (
          id, title, title_mr, category, category_label, category_label_mr,
          client, city, city_mr, image, aspect_ratio, description, description_mr,
          tags_json, deliverables_json, deliverables_mr_json, badge, badge_mr
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          item.id,
          item.title,
          item.titleMr || item.title,
          item.category,
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
    }
    console.log(`✅ Seeded portfolio items into database`);
  }
}
