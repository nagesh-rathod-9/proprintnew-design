# Migration Audit

## 1) Database call sites

The app currently couples most of the backend to SQLite through `server/db.ts` and the helper functions `getDb`, `queryAll`, `queryOne`, `runSql`, `saveDb`, and `saveDbImmediate`.

Primary DB usage sites:

- `server/db.ts`
  - SQLite bootstrap, schema creation, migrations, seed inserts, demo deletes, index creation
- `server/routes/auth.routes.ts`
  - User login and registration flows
- `server/routes/categories.routes.ts`
  - category list fetch and counts
- `server/routes/health.routes.ts`
  - DB health metrics and table counts
- `server/routes/heroSlides.routes.ts`
  - hero slide listing/creation/update/delete
- `server/routes/orders.routes.ts`
  - list, summary, by-id, create/update, status handling
- `server/routes/payments.routes.ts`
  - payment list and insert
- `server/routes/portfolio.routes.ts`
  - portfolio listing and insert/update/delete
- `server/routes/products.routes.ts`
  - product listing, by-id, create/update/delete
- `server/routes/quotes.routes.ts`
  - quote listing and create
- `server/routes/reviews.routes.ts`
  - review list and create
- `server/routes/services.routes.ts`
  - service list and create/update/delete
- `server/routes/users.routes.ts`
  - user list, profile update, admin user management
- `server/routes/cashfree.routes.ts`
  - payment session and verify flow
- `server/middleware/auth.ts`
  - user session read against the `users` table

## 2) SQLite-specific SQL and behavior

The current implementation is tightly bound to `sql.js` and SQLite patterns:

- `server/db.ts` imports `initSqlJs` and `Database` from `sql.js`
- In-memory database with atomic save to a local `.sqlite` file
- Process-level save handlers: `beforeExit`, `SIGINT`, `SIGTERM`
- SQLite-only statements and clauses:
  - `PRAGMA journal_mode = MEMORY`
  - `PRAGMA synchronous = NORMAL`
  - `PRAGMA cache_size = -64000`
  - `PRAGMA temp_store = MEMORY`
  - `CURRENT_TIMESTAMP` in `CREATE TABLE` defaults
  - `INSERT OR IGNORE` for hero slide seeding
  - `INSERT OR REPLACE` in product seed logic
  - `ALTER TABLE ... ADD COLUMN` migration blocks in `server/db.ts`
  - file-backed persistence logic using `writeFileSync` and `renameSync`
- `saveDb` and `saveDbImmediate` are used across the routes and must be removed for MySQL

## 3) Seed/demo data and placeholder content

### Backend seed data

- `server/seedData.ts`
  - Inserts sample categories, products, and product normalization values
  - Uses `sql.js` and seed functions on startup
- `server/db.ts`
  - `seedDatabaseIfEmpty(dbInstance)` is invoked during initialization
  - `INSERT OR IGNORE INTO hero_slides (...) VALUES (...)` inserts hardcoded demo slides
  - `DELETE FROM users WHERE id IN (...)`
  - `DELETE FROM orders WHERE id IN (...)`
  - `DELETE FROM quotes WHERE id IN (...)`
  - `DELETE FROM payments WHERE id IN (...)`
  - `DELETE FROM reviews WHERE id IN (...)`

These are the legacy demo fixtures that must be removed for a clean empty-DB migration.

### Frontend dummy content and placeholder media

The frontend includes mock/fallback values and external placeholder imagery that should be removed or neutralized:

- `src/data/mockOrders.ts`
  - mock order objects and legacy order fixtures
- `src/context/AppContext.tsx`
  - fallback product/category/user objects, placeholder names like `Customer (6863)` and `user-customer-*` heuristics
  - lots of synthetic fallback values rather than pure API-based rendering
- `src/components/HeroBanner.tsx`
  - `fallback` slide data and placeholder image handling
- `src/components/OffsetRateCalculator.tsx`
  - paper catalog values used as local synthetic data
- `src/components/VisitingCardStudio.tsx`
  - default generated content for custom product mockups with fallback file names
- `src/components/WhatsAppModal.tsx`
  - default text and fallback user data

External placeholder photos appear in both backend seed slides and frontend display logic, including `images.unsplash.com` and `i.pinimg.com` references.

## 4) Unused / risky code to review before deletion

The repo contains a few areas that may be required by runtime features or native app integrations and should only be removed after explicit verification:

- `src/firebase.ts`
  - Firestore config may be used elsewhere or for future admin analytics; leave until proven unused
- `android/`
  - Capacitor Android build artifacts are likely intentional; do not delete without confirming they are not active in the native app flow
- `src/store/*`
  - Redux slices may still be used by the frontend; review before removing if the app is refactored later
- `src/data/**`
  - includes mock data and fallback data; likely safe to remove only after verifying no import chain remains
- `server/utils/uploadCleanup.ts`
  - indirectly used in upload cleanup logic; not automatically safe to delete

## 5) API contract-sensitive patterns to preserve

The migration must avoid changing response structure or route base paths:

- Route paths are mostly preserved under `/api/...`
- List endpoints currently return `{ success: true, ... , count: ... }` or arrays with `success: true`
- User objects are mapped back to `name`, `email`, `phone`, `role`, `addresses`, etc.
- `orders` and `products` response mapping places JSON arrays under fields such as `items`, `galleryImages`, `tags`, `timeline`, and `specifications`

Any migration should keep these field names stable even when the DB engine changes.

## 6) Immediate migration risks

- The existing backend relies on `saveDb()` after writes. This is an SQLite-only lifecycle pattern and must be removed.
- The app depends on `CURRENT_TIMESTAMP` defaults, `INSERT OR IGNORE`, and SQLite-specific `ALTER TABLE` safety blocks.
- Several deep routes rely on JSON-serialized columns such as `*_json`, `addresses_json`, `items_json`, and `timeline_json`.
- The frontend includes fallback values that can flash before API data arrives, which is a UX and data integrity risk.

## 7) Recommended migration path

1. Replace `server/db.ts` with a MySQL pool wrapper and versioned schema migrations.
2. Move all schema creation into `server/migrations/*.sql` and ensure all columns are created in initial table definitions with no legacy `ALTER TABLE` blocks.
3. Remove seed/demo inserts and make tables empty after migration.
4. Replace `saveDb` usage with explicit async transaction-based writes.
5. Rework frontend to render only API-backed data, with explicit loading/error/empty states.
6. Run the repo verification commands (`tsc --noEmit`, build, and smoke testing against an empty MySQL DB) before declaring completion.
