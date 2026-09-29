import crypto from 'crypto';
import mysql from 'mysql2/promise';

const adminEmail = process.env.ADMIN_EMAIL;
const adminName = process.env.ADMIN_NAME || 'System Administrator';
const adminPassword = process.env.ADMIN_PASSWORD;

if (!adminEmail || !adminPassword) {
  throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in the environment.');
}

const hashPassword = (value: string) => crypto.createHash('sha256').update(value).digest('hex');

async function main() {
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

  const id = `user-admin-${Date.now()}`;
  const phone = process.env.ADMIN_PHONE || '0000000000';
  const passwordHash = hashPassword(adminPassword);

  await pool.execute(
    `INSERT INTO users (id, name, email, phone, role, company_name, gst_number, shipping_address, city, pincode, addresses_json, password_hash)
     VALUES (?, ?, ?, ?, 'admin', '', '', '', '', '', '[]', ?)
     ON DUPLICATE KEY UPDATE
       name = VALUES(name),
       phone = VALUES(phone),
       role = 'admin',
       password_hash = VALUES(password_hash)`,
    [id, adminName, adminEmail, phone, passwordHash]
  );

  console.log(`Admin account ready: ${adminEmail}`);
  await pool.end();
}

main().catch((error) => {
  console.error('Failed to create admin account:', error);
  process.exit(1);
});
