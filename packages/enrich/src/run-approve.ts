import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
config({ path: resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '.env'), override: true });
import { client } from '@funex/graph';
import { approveBatch } from './approve.js';

async function main() {
  const batchId = process.argv[2];
  if (!batchId) {
    console.error('Usage: pnpm enrich:approve <batch-id>');
    console.error('Example: pnpm enrich:approve cal-20260816');
    process.exit(1);
  }

  console.log(`Approving batch: ${batchId}`);
  const { applied, skipped } = await approveBatch(batchId);
  console.log(`Done. ${applied} attributes applied, ${skipped} skipped (null values).`);
  await client.end();
}

main().catch((err) => {
  console.error('Approval failed:', err);
  process.exit(1);
});
