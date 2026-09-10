import initSqlJs, { Database, Statement } from 'sql.js';
import fs from 'fs';
import path from 'path';
import { seedDatabaseIfEmpty } from './seedData.js';

let dbInstance: Database | null = null;
const DB_FILE_PATH = path.join(process.cwd(), 'proprint_database.sqlite');
const DB_TEMP_PATH = path.join(process.cwd(), 'proprint_database.sqlite.tmp');

// Save debounce state
let saveTimeout: NodeJS.Timeout | null = null;
let isDirty = false;
let isSaving = false;

/**
 * Initializes and retrieves the singleton in-memory SQLite database instance.
 */
export async function getDb(): Promise<Database> {
  if (dbInstance) {
    return dbInstance;
  }

  const SQL = await initSqlJs();

  if (fs.existsSync(DB_FILE_PATH)) {
    try {
      const filebuffer = fs.readFileSync(DB_FILE_PATH);
      dbInstance = new SQL.Database(filebuffer);
    } catch (readErr) {
      console.error('Failed to read existing database file, initializing fresh DB:', readErr);
      dbInstance = new SQL.Database();
    }
  } else {
    dbInstance = new SQL.Database();
  }

  // Optimize SQLite PRAGMAs for in-memory operations
  try {
    dbInstance.run(`
      PRAGMA journal_mode = MEMORY;
      PRAGMA synchronous = NORMAL;
      PRAGMA cache_size = -64000;
      PRAGMA temp_store = MEMORY;
    `);
  } catch (_e) {
    // Ignore if not supported in in-memory mode
  }

  initSchema(dbInstance);
  createIndexes(dbInstance);
  seedDatabaseIfEmpty(dbInstance);
  saveDbImmediate();

  return dbInstance;
}

/**
 * Marks the database as modified and schedules an atomic, debounced disk write.
 * This prevents locking the Node event loop during rapid sequential queries.
 */
export function saveDb(debounceMs = 300) {
  isDirty = true;
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }
  saveTimeout = setTimeout(() => {
    saveDbImmediate();
  }, debounceMs);
}

/**
 * Immediately flushes database state to disk using an atomic write pattern
 * (writes to a .tmp file then renames, preventing corrupt 0-byte files on crash).
 */
export function saveDbImmediate(): boolean {
  if (!dbInstance) return false;
  if (isSaving) return false;

  try {
    isSaving = true;
    if (saveTimeout) {
      clearTimeout(saveTimeout);
      saveTimeout = null;
    }

    const data = dbInstance.export();
    const buffer = Buffer.from(data);

    // Atomic write pattern: write to tmp file first, then rename
    fs.writeFileSync(DB_TEMP_PATH, buffer);
    fs.renameSync(DB_TEMP_PATH, DB_FILE_PATH);

    isDirty = false;
    return true;
  } catch (err) {
    console.error('CRITICAL: Failed to persist database to disk:', err);
    return false;
  } finally {
    isSaving = false;
  }
}

/**
 * Ensures any pending changes are flushed before process exit.
 */
export function flushDbBeforeExit() {
  if (isDirty && dbInstance) {
    console.log('🔄 Flushing SQLite database to disk before exit...');
    saveDbImmediate();
  }
}

// Register process exit listeners for clean data persistence
process.on('beforeExit', flushDbBeforeExit);
process.on('SIGINT', () => {
  flushDbBeforeExit();
  process.exit(0);
});
process.on('SIGTERM', () => {
  flushDbBeforeExit();
  process.exit(0);
});

/**
 * Safe Helper: Executes a SELECT query returning all matching rows as typed objects.
 * Automatically frees the prepared statement to prevent memory leaks.
 */
export function queryAll<T = any>(db: Database, sql: string, params: any[] = []): T[] {
  let stmt: Statement | null = null;
  try {
    stmt = db.prepare(sql);
    if (params.length > 0) {
      stmt.bind(params);
    }
    const results: T[] = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject() as unknown as T);
    }
    return results;
  } finally {
    if (stmt) {
      stmt.free();
    }
  }
}

/**
 * Safe Helper: Executes a SELECT query returning the first matching row or null.
 * Automatically frees the prepared statement to prevent memory leaks.
 */
export function queryOne<T = any>(db: Database, sql: string, params: any[] = []): T | null {
  let stmt: Statement | null = null;
  try {
    stmt = db.prepare(sql);
    if (params.length > 0) {
      stmt.bind(params);
    }
    if (stmt.step()) {
      return stmt.getAsObject() as unknown as T;
    }
    return null;
  } finally {
    if (stmt) {
      stmt.free();
    }
  }
}

/**
 * Safe Helper: Executes an action query (INSERT, UPDATE, DELETE) with parameters.
 */
export function runSql(db: Database, sql: string, params: any[] = []): void {
  if (params.length > 0) {
    db.run(sql, params);
  } else {
    db.run(sql);
  }
}

/**
 * Database Schema Definitions
 */
function initSchema(db: Database) {
  // 1. Users Table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      role TEXT NOT NULL DEFAULT 'customer',
      company_name TEXT,
      gst_number TEXT,
      shipping_address TEXT,
      city TEXT,
      pincode TEXT,
      addresses_json TEXT,
      password_hash TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 2. Orders Table
  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      order_number TEXT UNIQUE NOT NULL,
      tracking_number TEXT,
      customer_name TEXT NOT NULL,
      customer_email TEXT,
      customer_phone TEXT NOT NULL,
      shipping_address TEXT NOT NULL,
      city TEXT,
      pincode TEXT,
      subtotal REAL NOT NULL,
      tax REAL NOT NULL,
      shipping_fee REAL DEFAULT 0,
      discount REAL DEFAULT 0,
      total REAL NOT NULL,
      payment_method TEXT NOT NULL,
      payment_status TEXT NOT NULL DEFAULT 'Pending',
      status TEXT NOT NULL DEFAULT 'Order Placed',
      items_json TEXT NOT NULL,
      timeline_json TEXT,
      notes TEXT,
      uploaded_file_url TEXT,
      uploaded_file_name TEXT,
      user_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 3. Products Table
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      name_mr TEXT,
      category_id TEXT NOT NULL,
      category_name TEXT,
      base_price REAL NOT NULL,
      original_price REAL,
      description TEXT,
      description_mr TEXT,
      image TEXT,
      gallery_json TEXT,
      rating REAL DEFAULT 4.9,
      reviews_count INTEGER DEFAULT 1,
      min_quantity INTEGER DEFAULT 100,
      default_quantity INTEGER DEFAULT 500,
      sizes_json TEXT,
      finishes_json TEXT,
      features_json TEXT,
      tags_json TEXT,
      turnaround_days INTEGER DEFAULT 1,
      single_price REAL,
      bulk_price_100 REAL,
      bulk_price_500 REAL,
      bulk_price_1000 REAL,
      is_popular INTEGER DEFAULT 1,
      is_best_seller INTEGER DEFAULT 1,
      quantity_options_json TEXT,
      unit TEXT DEFAULT 'pcs',
      badge TEXT,
      tagline TEXT,
      specifications_json TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Safe migrations for newly added product columns if upgrading existing database
  try { db.run(`ALTER TABLE products ADD COLUMN quantity_options_json TEXT`); } catch (_e) {}
  try { db.run(`ALTER TABLE products ADD COLUMN unit TEXT DEFAULT 'pcs'`); } catch (_e) {}
  try { db.run(`ALTER TABLE products ADD COLUMN badge TEXT`); } catch (_e) {}
  try { db.run(`ALTER TABLE products ADD COLUMN tagline TEXT`); } catch (_e) {}
  try { db.run(`ALTER TABLE products ADD COLUMN specifications_json TEXT`); } catch (_e) {}

  // 4. Categories Table
  db.run(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      name_mr TEXT,
      short_name TEXT,
      subtitle TEXT,
      icon_name TEXT DEFAULT 'Package',
      image TEXT,
      item_count INTEGER DEFAULT 0,
      featured INTEGER DEFAULT 1,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 5. Hero Banner Slides Table
  db.run(`
    CREATE TABLE IF NOT EXISTS hero_slides (
      id TEXT PRIMARY KEY,
      title1 TEXT NOT NULL,
      title2 TEXT,
      highlight TEXT,
      subtitle TEXT,
      image TEXT NOT NULL,
      button_text TEXT,
      quote_button_text TEXT,
      type_label TEXT,
      product_id TEXT,
      category_link TEXT,
      theme TEXT DEFAULT 'crimson',
      tag TEXT,
      badge TEXT,
      display_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 6. Services Table
  db.run(`
    CREATE TABLE IF NOT EXISTS services (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      tagline TEXT,
      description TEXT,
      turnaround TEXT,
      min_order TEXT,
      icon_name TEXT DEFAULT 'Printer',
      badge TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 7. Reviews Table
  db.run(`
    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      customer_name TEXT NOT NULL,
      customer_role TEXT,
      product_name TEXT,
      rating REAL DEFAULT 5,
      comment TEXT NOT NULL,
      date TEXT,
      status TEXT DEFAULT 'Approved',
      verified_buyer INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 8. Quotes Table
  db.run(`
    CREATE TABLE IF NOT EXISTS quotes (
      id TEXT PRIMARY KEY,
      customer_name TEXT NOT NULL,
      customer_email TEXT,
      customer_phone TEXT NOT NULL,
      company_name TEXT,
      product_category TEXT,
      quantity INTEGER,
      paper_gsm TEXT,
      finish_type TEXT,
      size TEXT,
      special_instructions TEXT,
      status TEXT DEFAULT 'New',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 9. Payments Table
  db.run(`
    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      order_id TEXT,
      order_number TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      amount REAL NOT NULL,
      method TEXT NOT NULL,
      status TEXT DEFAULT 'Completed',
      transaction_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 10. Portfolio Table
  db.run(`
    CREATE TABLE IF NOT EXISTS portfolio (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      title_mr TEXT,
      category TEXT NOT NULL,
      category_label TEXT,
      category_label_mr TEXT,
      client TEXT,
      city TEXT,
      city_mr TEXT,
      image TEXT NOT NULL,
      aspect_ratio TEXT DEFAULT 'square',
      description TEXT,
      description_mr TEXT,
      tags_json TEXT,
      deliverables_json TEXT,
      deliverables_mr_json TEXT,
      badge TEXT,
      badge_mr TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Safe schema migrations for existing SQLite databases
  const safeAlter = (sql: string) => {
    try {
      db.run(sql);
    } catch (_e) {
      // Column already exists or table ready
    }
  };

  safeAlter(`ALTER TABLE users ADD COLUMN addresses_json TEXT;`);
  safeAlter(`ALTER TABLE categories ADD COLUMN subtitle TEXT;`);
  safeAlter(`ALTER TABLE orders ADD COLUMN uploaded_file_url TEXT;`);
  safeAlter(`ALTER TABLE orders ADD COLUMN uploaded_file_name TEXT;`);
  safeAlter(`ALTER TABLE orders ADD COLUMN user_id TEXT;`);
  safeAlter(`ALTER TABLE orders ADD COLUMN shipping_fee REAL DEFAULT 0;`);
  safeAlter(`ALTER TABLE orders ADD COLUMN discount REAL DEFAULT 0;`);
  safeAlter(`ALTER TABLE products ADD COLUMN single_price REAL;`);
  safeAlter(`ALTER TABLE products ADD COLUMN bulk_price_100 REAL;`);
  safeAlter(`ALTER TABLE products ADD COLUMN bulk_price_500 REAL;`);
  safeAlter(`ALTER TABLE products ADD COLUMN bulk_price_1000 REAL;`);

  // Remove records created by the former demo seed. Real records are preserved.
  db.run(`DELETE FROM users WHERE id IN ('user-admin-1', 'user-customer-1', 'user-customer-2')`);
  db.run(`DELETE FROM orders WHERE id IN ('ord-today-1', 'ord-today-2', 'ord-today-3', 'ord-yesterday-1')`);
  db.run(`DELETE FROM quotes WHERE id IN ('quote-101', 'quote-102')`);
  db.run(`DELETE FROM payments WHERE id IN ('PAY-8921', 'PAY-8920', 'PAY-8919', 'PAY-8918')`);
  db.run(`DELETE FROM reviews WHERE id IN ('REV-1', 'REV-2', 'REV-3', 'REV-4')`);

  // Seed default hero banner slides
  db.run(`
    INSERT OR IGNORE INTO hero_slides (id, title1, title2, highlight, subtitle, image, button_text, quote_button_text, type_label, product_id, category_link, theme, tag, badge, display_order, is_active)
    VALUES 
    ('slide-1', 'Brochure & Catalog Printing', 'Brochures', 'Printing', 'High-definition full color offset press print', 'https://i.pinimg.com/736x/c6/e3/bb/c6e3bbbd242f377f64021fe55c33b17d.jpg', 'Order Brochures', 'Quick Quote', 'Brochures', 'prod-premium-brochure', '/products?category=brochures', 'crimson', 'Brochures', 'Premium', 1, 1),
    ('slide-2', 'Custom Die Cut Stickers', 'Stickers', 'Stickers', 'Waterproof vinyl stickers & labels in roll/sheet', 'https://i.pinimg.com/1200x/d3/0d/ca/d30dcabb85e6a44689838e953c3d78c3.jpg', 'Order Stickers', 'Enquiry', 'Stickers', 'prod-die-cut-sticker-sheet', '/products?category=stickers', 'crimson', 'Stickers', 'Hot', 2, 1),
    ('slide-3', 'Custom Packaging Boxes', 'Packaging', 'Packaging', 'Luxury rigid boxes & mono-cartons with gold foil', 'https://i.pinimg.com/736x/bb/c1/3d/bbc13d8711ec67195aae22fe376e4d40.jpg', 'Packaging', 'Enquiry', 'Packaging', 'prod-custom-packaging-box', '/products?category=packaging', 'dark', 'Packaging', 'Popular', 3, 1);
  `);
}

/**
 * Creates high-performance database indexes on foreign keys, lookups, and sort fields.
 */
function createIndexes(db: Database) {
  const indexes = [
    // Orders
    `CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);`,
    `CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);`,
    `CREATE INDEX IF NOT EXISTS idx_orders_tracking_number ON orders(tracking_number);`,
    `CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);`,
    `CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);`,
    `CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);`,
    
    // Products
    `CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);`,
    `CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);`,
    `CREATE INDEX IF NOT EXISTS idx_products_popular ON products(is_popular);`,
    `CREATE INDEX IF NOT EXISTS idx_products_best_seller ON products(is_best_seller);`,

    // Categories
    `CREATE INDEX IF NOT EXISTS idx_categories_featured ON categories(featured DESC);`,
    `CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name ASC);`,

    // Hero Slides
    `CREATE INDEX IF NOT EXISTS idx_hero_slides_active_order ON hero_slides(is_active, display_order ASC);`,

    // Users
    `CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`,
    `CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);`,
    `CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);`,

    // Reviews, Quotes, Payments, Portfolio
    `CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);`,
    `CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);`,
    `CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);`,
    `CREATE INDEX IF NOT EXISTS idx_portfolio_category ON portfolio(category);`
  ];

  for (const indexSql of indexes) {
    try {
      db.run(indexSql);
    } catch (_e) {
      // Index already exists or table ready
    }
  }
}
