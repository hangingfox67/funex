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

  console.log(`Approving batch: ${batchId}\n`);
  const r = await approveBatch(batchId);

  console.log(`\nDone. ${r.applied} attributes applied, ${r.skipped} skipped (null).`);
  console.log(`  Sources: ${r.viatorStructuredApplied} viator_structured, ${r.danRulesApplied} dan-rules, ${r.operatorTermsApplied} operator_terms, ${r.derivedApplied} derived`);
  console.log(`  ${r.corrected} human-corrected, ${r.unconfirmed} unconfirmed.`);

  if (r.textualConflicts.length > 0) {
    console.log(`\n  ⚠ ${r.textualConflicts.length} TEXTUAL CONFLICT(S) — extraction value kept:`);
    for (const c of r.textualConflicts) {
      console.log(`    ${c.experienceId}.${c.attribute}: extracted=${JSON.stringify(c.extractedValue)} vs ${c.ruleSource}=${JSON.stringify(c.ruleValue)}`);
    }
    console.log(`\n  Resolve in corrections-${batchId}.yaml`);
  }

  if (r.declaredVsRuleConflicts.length > 0) {
    console.log(`\n  ⚠ ${r.declaredVsRuleConflicts.length} DECLARED-VS-RULE CONFLICT(S) — declared value wins:`);
    for (const c of r.declaredVsRuleConflicts) {
      console.log(`    ${c.experienceId}.${c.attribute}: ${c.declaredSource}=${JSON.stringify(c.declared)} vs ${c.ruleSource}=${JSON.stringify(c.rule)}`);
    }
  }

  await client.end();
}

main().catch((err) => {
  console.error('Approval failed:', err);
  process.exit(1);
});
