import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { sql } from 'drizzle-orm';
import { db, client } from './connection.js';

async function main() {
  console.log('Enabling PostGIS...');
  await db.execute(sql`CREATE EXTENSION IF NOT EXISTS postgis`);

  console.log('Running migrations...');
  await migrate(db, { migrationsFolder: new URL('../drizzle', import.meta.url).pathname });

  console.log('Migrations complete.');
  await client.end();
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
