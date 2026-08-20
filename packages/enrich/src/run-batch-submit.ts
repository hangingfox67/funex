import './check-node.js';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
config({ path: resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '.env'), override: true });

import { writeFileSync, readFileSync, mkdirSync, existsSync } from 'fs';
import Anthropic from '@anthropic-ai/sdk';
import { client as pgClient } from '@funex/graph';
import { loadOntology, preparePrompt } from './extract.js';
import { buildSystemPrompt, buildProductMessage, EXTRACT_MODEL, EXTRACT_PROMPT_VERSION } from './prompt.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const diffDir = resolve(__dirname, '..', 'diffs');

// Default calibration set: 20 real Viator products from the pre-crash batch
const CALIBRATION_REAL = [
  'exp_170728P24', 'exp_5567066P179', 'exp_44720P2', 'exp_44720P1', 'exp_160694P25',
  'exp_9592P286', 'exp_393669P3', 'exp_90546P39', 'exp_110534P762', 'exp_5594474P3',
  'exp_110534P491', 'exp_110534P1285', 'exp_150859P18', 'exp_33893P186', 'exp_27613P9',
  'exp_5657208P1', 'exp_399004P1', 'exp_110534P361', 'exp_15484P1', 'exp_5629990P1',
];

async function main() {
  const args = process.argv.slice(2).filter((a) => a !== '--');

  // Support --ids-file=<path> for large batches
  const idsFileArg = args.find((a) => a.startsWith('--ids-file='));
  let ids: string[];
  if (idsFileArg) {
    const idsPath = idsFileArg.split('=')[1];
    ids = readFileSync(idsPath, 'utf-8').trim().split('\n').filter((l) => l.startsWith('exp_'));
  } else {
    ids = args.length > 0 ? args.filter((a) => a.startsWith('exp_')) : CALIBRATION_REAL;
  }

  const batchId = args.find((a) => a.startsWith('--batch-id='))?.split('=')[1]
    ?? `cal-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`;

  console.log(`Preparing batch "${batchId}" — ${ids.length} products\n`);

  const anthropic = new Anthropic();
  const ontology = loadOntology();
  const systemPrompt = buildSystemPrompt(ontology);

  // Build per-product requests, fetching descriptions from DB + Viator API
  const requests: Anthropic.Messages.Batches.BatchCreateParams.Request[] = [];
  const sourceTexts: Record<string, string> = {};

  for (const expId of ids) {
    console.log(`  Preparing ${expId}...`);
    try {
      const { prompt, sourceText, title } = await preparePrompt(expId, ontology);

      // Extract just the product section from the full prompt for the user message
      // (preparePrompt returns the full combined prompt; we need the product data separately)
      const productMsg = prompt.split('## Product to Analyze')[1];
      const userContent = productMsg
        ? `## Product to Analyze${productMsg}`
        : prompt; // fallback: full prompt as user message

      requests.push({
        custom_id: expId,
        params: {
          model: EXTRACT_MODEL,
          max_tokens: 4096,
          system: [
            {
              type: 'text',
              text: systemPrompt,
              cache_control: { type: 'ephemeral' },
            },
          ],
          messages: [{ role: 'user', content: userContent }],
        },
      });

      sourceTexts[expId] = sourceText;
      console.log(`    OK (${title})`);
    } catch (err) {
      console.error(`    FAILED to prepare: ${(err as Error).message}`);
    }
  }

  if (requests.length === 0) {
    console.error('\nNo requests prepared. Aborting.');
    await pgClient.end();
    process.exit(1);
  }

  // ── Spend gate ──
  const calibrationPath = resolve(diffDir, 'calibration-cost.json');
  let costPerItem = 0.05; // conservative default until first calibration
  let costSource = 'default estimate';
  if (existsSync(calibrationPath)) {
    try {
      const cal = JSON.parse(readFileSync(calibrationPath, 'utf-8'));
      costPerItem = cal.costPerItem;
      costSource = `measured from ${cal.measuredFrom} (${cal.sampleSize} products, ${cal.model})`;
    } catch { /* use default */ }
  }
  const estimatedCost = requests.length * costPerItem;
  console.log(`\n── Spend gate ──`);
  console.log(`  Cost/item:      $${costPerItem.toFixed(4)} (${costSource})`);
  console.log(`  Items:          ${requests.length}`);
  console.log(`  Estimated cost: $${estimatedCost.toFixed(2)} USD`);
  if (estimatedCost > 5) {
    console.error(`\n  BLOCKED: estimated cost $${estimatedCost.toFixed(2)} exceeds $5 gate.`);
    console.error(`  Get Dan's explicit go before re-running with --force-spend.`);
    if (!args.includes('--force-spend')) {
      await pgClient.end();
      process.exit(1);
    }
    console.log(`  --force-spend flag present, proceeding.`);
  }
  console.log('');

  console.log(`Submitting ${requests.length} requests to Message Batches API...`);
  const batch = await anthropic.messages.batches.create({ requests });

  console.log(`\nBatch submitted.`);
  console.log(`  Batch ID:  ${batch.id}`);
  console.log(`  Status:    ${batch.processing_status}`);
  console.log(`  Expires:   ${batch.expires_at}`);
  console.log(`  Requests:  ${batch.request_counts.processing} processing`);

  // Save batch tracking file
  if (!existsSync(diffDir)) mkdirSync(diffDir, { recursive: true });
  const trackingPath = resolve(diffDir, `${batchId}.batch.json`);
  writeFileSync(trackingPath, JSON.stringify({
    batchId,
    apiBatchId: batch.id,
    productIds: ids,
    sourceTexts,
    promptVersion: EXTRACT_PROMPT_VERSION,
    model: EXTRACT_MODEL,
    submittedAt: new Date().toISOString(),
    expiresAt: batch.expires_at,
  }, null, 2), 'utf-8');

  console.log(`\nTracking file: ${trackingPath}`);
  console.log(`\nCheck status:  pnpm enrich:status -- ${batchId}`);
  console.log(`Collect:       pnpm enrich:collect -- ${batchId}`);

  await pgClient.end();
}

main().catch((err) => {
  console.error('Batch submission failed:', err);
  process.exit(1);
});
