# MySQL Migration Report

## Current State

- The backend uses a MySQL connection pool and parameterized queries through `server/db.ts`.
- Schema migrations are tracked in `schema_migrations`; completed migrations are skipped on later starts.
- Database startup does not seed catalog/demo records or truncate existing tables. A new database starts with an empty catalog and requires an admin to be created separately.
- The frontend has local data caches for offline/fast startup; a browser with previous cached catalog data may display it until the API refresh completes. This cache is not written back to MySQL.
- Route paths and the existing JSON response contracts were kept while replacing SQLite database access.
- The old sql.js seed module was unreferenced and has been removed. `sqlite3` remains only for the explicit legacy import utility.

## Safe Operating Assumptions

- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME` point to the intended MySQL instance. The configured database user must be allowed to create the database and schema tables/indexes.
- Back up any existing database before first startup. For a previously initialized schema without `schema_migrations`, the runner creates missing tables, skips already-existing indexes, and records the SQL files as applied; it does not inspect or reconcile differences in existing table columns.
- `scripts/migrate-sqlite-to-mysql.ts` currently imports **users only**. It does not transfer orders, products, categories, or other business data. Do not treat it as a full-database migration.
- `scripts/create-admin.ts` requires `ADMIN_EMAIL` and `ADMIN_PASSWORD`; `ADMIN_NAME` and `ADMIN_PHONE` are optional. It should be run after applying migrations.

## Verification

- `npx tsc --noEmit` passes.
- `npm run build` passes. Vite reports the existing large JavaScript chunk warning.
- A live MySQL migration and API smoke test was not run because no database connection was available in this environment.

## Remaining Risks

- Verify login, products, orders, uploads, and payments against the target MySQL instance before deployment.
- Review and test any legacy database import separately, starting with a backup and the import utility's `--dry-run` option.
- `npm install` reported 10 dependency audit findings (6 moderate, 3 high, 1 critical); they were not auto-fixed because forced dependency changes could introduce unrelated breakage.