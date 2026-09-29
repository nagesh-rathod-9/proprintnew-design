import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import sqlite3 from 'sqlite3';

const args = new Set(process.argv.slice(2));
const dryRun = args.has('--dry-run');
const sourceFile = process.env.SQLITE_SOURCE || path.join(process.cwd(), 'proprint_database.sqlite');
const targetTable = 'users';

function openSqliteDb(filePath: string): Promise<sqlite3.Database> {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(filePath, sqlite3.OPEN_READONLY, (error) => {
      if (error) reject(error);
      else resolve(db);
    });
  });
}

async function readUserRows(filePath: string) {
  const db = await openSqliteDb(filePath);
  return new Promise<any[]>((resolve, reject) => {
    db.all(`SELECT * FROM ${targetTable} ORDER BY created_at`, (error, rows) => {
      db.close();
      if (error) reject(error);
      else resolve(rows || []);
    });
  });
}

async function ensureMysqlConnection() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'proprint',
    charset: 'utf8mb4',
    decimalNumbers: true,
    dateStrings: true,
    connectionLimit: 5,
    multipleStatements: false
  });

  await pool.query('SELECT 1');
  return pool;
}

async function main() {
  if (!fs.existsSync(sourceFile)) {
    throw new Error(`Source SQLite database not found: ${sourceFile}`);
  }

  const rows = await readUserRows(sourceFile);

  if (dryRun) {
    console.log(`DRY RUN: ${rows.length} rows would be copied from ${sourceFile} into ${targetTable}.`);
    return;
  }

  const pool = await ensureMysqlConnection();

  for (const row of rows) {
    await pool.execute(
      `INSERT INTO users (id, name, email, phone, role, company_name, gst_number, shipping_address, city, pincode, addresses_json, password_hash, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         name = VALUES(name),
         email = VALUES(email),
         phone = VALUES(phone),
         role = VALUES(role),
         company_name = VALUES(company_name),
         gst_number = VALUES(gst_number),
         shipping_address = VALUES(shipping_address),
         city = VALUES(city),
         pincode = VALUES(pincode),
         addresses_json = VALUES(addresses_json),
         password_hash = VALUES(password_hash),
         updated_at = CURRENT_TIMESTAMP`,
      [
        row.id || `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        row.name || 'Customer',
        row.email || `${Date.now()}@example.com`,
        row.phone || '',
        row.role || 'customer',
        row.company_name || '',
        row.gst_number || '',
        row.shipping_address || '',
        row.city || '',
        row.pincode || '',
        row.addresses_json || '[]',
        row.password_hash || '',
        row.created_at || new Date().toISOString().slice(0, 19).replace('T', ' '),
        row.updated_at || new Date().toISOString().slice(0, 19).replace('T', ' ')
      ]
    );
  }

  const [countRows] = await pool.query('SELECT COUNT(*) AS total FROM users');
  const total = Number((countRows as any[])[0]?.total || 0);

  if (total !== rows.length) {
    throw new Error(`Row-count mismatch after migration: expected ${rows.length}, found ${total}.`);
  }

  console.log(`Migrated ${rows.length} rows into ${targetTable}.`);
  await pool.end();
}

main().catch((error) => {
  console.error('SQLite to MySQL migration failed:', error);
  process.exit(1);
});
