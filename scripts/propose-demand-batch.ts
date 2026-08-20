/**
 * Weekly demand-batch proposal.
 *
 * Reads demand.unenriched events from the past 7 days, ranks unenriched
 * experience IDs by frequency, and proposes an enrichment batch through
 * the spend gate. Does NOT submit — prints the command for Dan to approve.
 *
 * Usage: pnpm ops:propose-demand
 */
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
config({ path: resolve(dirname(fileURLToPath(import.meta.url)), '..', '.env'), override: true });

import { readFileSync, existsSync } from 'fs';
import { sql } from 'drizzle-orm';
import { db, client, attributes, FIXTURE_ID_PREFIX } from '@funex/graph';

const __dirname = dirname(fileURLToPath(import.meta.url));
const calibrationPath = resolve(__dirname, '..', 'packages', 'enrich', 'diffs', 'calibration-cost.json');

async function main() {
  // 1. Read demand events from the past 7 days (both served and suppressed)
  const demandRows = await db.execute(sql`
    SELECT type, payload->'experienceIds' AS exp_ids
    FROM event
    WHERE type IN ('demand.unenriched', 'demand.suppressed')
      AND created_at >= now() - interval '7 days'
  `);

  // 2. Count frequency per experience ID
  // Suppressed demand gets 3× weight — the user got NO result for these
  const freq = new Map<string, number>();
  let servedEvents = 0;
  let suppressedEvents = 0;
  for (const row of demandRows) {
    const ids = row.exp_ids as string[];
    const weight = row.type === 'demand.suppressed' ? 3 : 1;
    if (row.type === 'demand.suppressed') suppressedEvents++;
    else servedEvents++;
    if (!Array.isArray(ids)) continue;
    for (const id of ids) {
      if (id.startsWith(FIXTURE_ID_PREFIX)) continue;
      freq.set(id, (freq.get(id) ?? 0) + weight);
    }
  }

  if (freq.size === 0) {
    console.log('No demand events in the past 7 days. Nothing to propose.');
    await client.end();
    return;
  }

  // 3. Filter out already-enriched
  const enrichedRows = await db.execute(sql`
    SELECT DISTINCT experience_id FROM attribute
    WHERE experience_id NOT LIKE ${FIXTURE_ID_PREFIX + '%'}
  `);
  const enrichedSet = new Set(enrichedRows.map((r) => r.experience_id as string));

  const unenriched = [...freq.entries()]
    .filter(([id]) => !enrichedSet.has(id))
    .sort((a, b) => b[1] - a[1]);

  if (unenriched.length === 0) {
    console.log('All demanded products are already enriched.');
    await client.end();
    return;
  }

  // 4. Load calibration cost
  let costPerItem = 0.0425;
  if (existsSync(calibrationPath)) {
    try {
      const cal = JSON.parse(readFileSync(calibrationPath, 'utf-8'));
      costPerItem = cal.costPerItem;
    } catch { /* use default */ }
  }

  // 5. Propose batch
  const estimatedCost = unenriched.length * costPerItem;

  console.log(`=== Demand-Triggered Enrichment Proposal ===\n`);
  console.log(`  Period:    past 7 days`);
  console.log(`  Demand events: ${demandRows.length} (${servedEvents} served, ${suppressedEvents} suppressed×3)`);
  console.log(`  Unique unenriched products demanded: ${unenriched.length}`);
  console.log(`  Already enriched (filtered out): ${freq.size - unenriched.length}`);
  console.log(`  Estimated cost: $${estimatedCost.toFixed(2)} (${unenriched.length} × $${costPerItem.toFixed(4)})`);
  console.log('');

  // Top 20 by demand frequency
  console.log('  Top 20 by demand frequency:');
  for (const [id, count] of unenriched.slice(0, 20)) {
    console.log(`    ${id}: ${count} hits`);
  }
  if (unenriched.length > 20) {
    console.log(`    ... and ${unenriched.length - 20} more`);
  }

  console.log('');
  if (estimatedCost > 5) {
    console.log(`  ⚠ Estimated cost $${estimatedCost.toFixed(2)} exceeds $5 gate.`);
    console.log(`  Dan must approve. Run with --force-spend:`);
  }

  // Write IDs file for submission
  const idsPath = `/tmp/demand-batch-ids.txt`;
  const { writeFileSync } = await import('fs');
  writeFileSync(idsPath, unenriched.map(([id]) => id).join('\n') + '\n');
  console.log(`  IDs written to: ${idsPath}`);
  console.log(`\n  Submit command:`);
  console.log(`    pnpm enrich:submit -- --batch-id=demand-$(date +%Y%m%d) --ids-file=${idsPath}${estimatedCost > 5 ? ' --force-spend' : ''}`);

  await client.end();
}

main().catch((err) => {
  console.error('Demand proposal failed:', err);
  process.exit(1);
});
