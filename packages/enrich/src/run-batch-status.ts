import './check-node.js';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
config({ path: resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '.env'), override: true });

import { readFileSync } from 'fs';
import Anthropic from '@anthropic-ai/sdk';

const __dirname = dirname(fileURLToPath(import.meta.url));
const diffDir = resolve(__dirname, '..', 'diffs');

async function main() {
  const args = process.argv.slice(2).filter((a) => a !== '--');
  const batchId = args[0];

  if (!batchId) {
    console.error('Usage: pnpm enrich:status -- <batch-id>');
    console.error('  e.g. pnpm enrich:status -- cal-20260819');
    process.exit(1);
  }

  const trackingPath = resolve(diffDir, `${batchId}.batch.json`);
  let tracking: { apiBatchId: string; productIds: string[]; submittedAt: string };
  try {
    tracking = JSON.parse(readFileSync(trackingPath, 'utf-8'));
  } catch {
    console.error(`Tracking file not found: ${trackingPath}`);
    process.exit(1);
  }

  const anthropic = new Anthropic();
  const batch = await anthropic.messages.batches.retrieve(tracking.apiBatchId);

  console.log(`Batch: ${batchId} (${batch.id})`);
  console.log(`Status: ${batch.processing_status}`);
  console.log(`Submitted: ${tracking.submittedAt}`);
  console.log(`Expires: ${batch.expires_at}`);
  if (batch.ended_at) console.log(`Ended: ${batch.ended_at}`);
  console.log(`\nRequest counts:`);
  console.log(`  Processing: ${batch.request_counts.processing}`);
  console.log(`  Succeeded:  ${batch.request_counts.succeeded}`);
  console.log(`  Errored:    ${batch.request_counts.errored}`);
  console.log(`  Canceled:   ${batch.request_counts.canceled}`);
  console.log(`  Expired:    ${batch.request_counts.expired}`);

  if (batch.processing_status === 'ended') {
    const total = tracking.productIds.length;
    const succeeded = batch.request_counts.succeeded;
    if (succeeded === total) {
      console.log(`\nAll ${total} requests succeeded. Run: pnpm enrich:collect -- ${batchId}`);
    } else {
      console.log(`\n${succeeded}/${total} succeeded. Run collect to retrieve partial results.`);
    }
  } else {
    console.log(`\nStill processing. Check again later.`);
  }
}

main().catch((err) => {
  console.error('Status check failed:', err);
  process.exit(1);
});
