import mysql, { Pool, PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

let pool: Pool | null = null;

export function getDbConfig() {
  return {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'proprint',
    charset: 'utf8mb4',
    decimalNumbers: true,
    dateStrings: true,
    connectionLimit: 10,
    multipleStatements: false
  };
}

async function ensureDatabaseExists() {
  const config = getDbConfig();
  const connection = await mysql.createConnection({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    charset: config.charset,
    multipleStatements: false
  });

  try {
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${config.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  } finally {
    await connection.end();
  }
}

async function createPoolIfNeeded(): Promise<Pool> {
  if (!pool) {
    const config = getDbConfig();
    await ensureDatabaseExists();
    pool = mysql.createPool({
      ...config,
      database: config.database,
      waitForConnections: true,
      namedPlaceholders: false
    });
  }

  return pool;
}

export async function getDb(): Promise<Pool> {
  return createPoolIfNeeded();
}

export async function queryAll<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const db = await getDb();
  const [rows] = await db.execute<RowDataPacket[]>(sql, params);
  return rows as T[];
}

export async function queryOne<T = any>(sql: string, params: any[] = []): Promise<T | null> {
  const rows = await queryAll<T>(sql, params);
  return rows[0] ?? null;
}

export async function execute(sql: string, params: any[] = []): Promise<ResultSetHeader> {
  const db = await getDb();
  const [result] = await db.execute<ResultSetHeader>(sql, params);
  return result;
}

export async function withTransaction<T>(handler: (connection: PoolConnection) => Promise<T>): Promise<T> {
  const db = await getDb();
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();
    const result = await handler(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function closeDb(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

export async function runMigrations(): Promise<void> {
  const db = await getDb();
  const migrationsDir = path.join(process.cwd(), 'server', 'migrations');
  await db.execute(`CREATE TABLE IF NOT EXISTS schema_migrations (
    version VARCHAR(255) NOT NULL PRIMARY KEY,
    applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

  const [appliedRows] = await db.query<RowDataPacket[]>(`SELECT version FROM schema_migrations`);
  const appliedVersions = new Set(appliedRows.map((row) => row.version as string));
  const files = (await fs.readdir(migrationsDir)).filter((file) => file.endsWith('.sql')).sort();

  for (const file of files) {
    if (appliedVersions.has(file)) continue;

    const sql = await fs.readFile(path.join(migrationsDir, file), 'utf8');
    const statements = sql
      .split(/;\s*(?:\r?\n|$)/)
      .map((statement) => statement.trim())
      .filter(Boolean);

    for (const statement of statements) {
      try {
        await db.execute(statement);
      } catch (error) {
        if ((error as any).code !== 'ER_DUP_KEYNAME') throw error;
      }
    }

    await db.execute(`INSERT INTO schema_migrations (version) VALUES (?)`, [file]);
  }
}

export async function initializeDatabase(): Promise<Pool> {
  const db = await getDb();
  await runMigrations();
  return db;
}
