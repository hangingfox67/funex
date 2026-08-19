import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
config({ path: resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..', '.env'), override: true });
import { client } from '@funex/graph';
import { syncCatalog } from './sync.js';

async function main() {
  console.log('Starting Viator mock sync...');
  const result = await syncCatalog();
  console.log(`Synced ${result.synced} experiences (session: ${result.sessionId})`);
  await client.end();
}

main().catch((err) => {
  console.error('Sync failed:', err);
  process.exit(1);
});
