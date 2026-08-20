import './check-node.js';
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
  const { applied, skipped, unconfirmed, corrected, danRulesApplied, textualConflicts } = await approveBatch(batchId);
  console.log(`Done. ${applied} attributes applied, ${skipped} skipped (null).`);
  console.log(`  ${corrected} human-corrected, ${danRulesApplied} dan-rules applied, ${unconfirmed} unconfirmed.`);

  if (textualConflicts.length > 0) {
    console.log(`\n  ⚠ ${textualConflicts.length} TEXTUAL CONFLICT(S) — extraction value kept, rule NOT applied:`);
    for (const c of textualConflicts) {
      console.log(`    ${c.experienceId}.${c.attribute}: extracted=${JSON.stringify(c.extractedValue)} vs rule=${JSON.stringify(c.ruleValue)}`);
      console.log(`      evidence: ${c.extractedEvidence.substring(0, 120)}`);
      console.log(`      rule: ${c.ruleNote}`);
    }
    console.log(`\n  Resolve these manually in corrections-${batchId}.yaml`);
  }

  await client.end();
}

main().catch((err) => {
  console.error('Approval failed:', err);
  process.exit(1);
});
