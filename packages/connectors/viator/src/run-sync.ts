import './check-node.js';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
config({ path: resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..', '.env'), override: true });
import { client } from '@funex/graph';
import { syncCatalog } from './sync.js';

async function main() {
  const source = process.env.MOCK_VIATOR === '1' || !process.env.VIATOR_API_KEY ? 'fixture' : 'viator';
  console.log(`Starting Viator sync (source: ${source})...`);
  const result = await syncCatalog();
  console.log(`Synced ${result.synced} experiences from ${result.source} (session: ${result.sessionId})`);
  await client.end();
}

main().catch((err) => {
  console.error('Sync failed:', err);
  process.exit(1);
});
