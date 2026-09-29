import { closeDb, runMigrations } from './db.js';

runMigrations()
  .then(closeDb)
  .catch(async (error) => {
    console.error('Database migration failed:', error);
    await closeDb();
    process.exit(1);
  });
