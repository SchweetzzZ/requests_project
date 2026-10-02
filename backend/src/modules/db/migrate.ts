import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import * as path from 'path';

export async function runMigrations() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not defined in environment variables');
  }

  const pool = new Pool({
    connectionString: databaseUrl,
  });

  const db = drizzle(pool);

  console.log('[Drizzle] Applying migrations...');
  const migrationsFolder =
    process.env.DRIZZLE_DIR || path.resolve(process.cwd(), 'drizzle');
  await migrate(db, { migrationsFolder });
  console.log('[Drizzle] Migrations applied successfully.');

  await pool.end();
}

if (require.main === module) {
  void runMigrations()
    .then(() => {
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Drizzle] Migration failed:', err);
      process.exit(1);
    });
}
