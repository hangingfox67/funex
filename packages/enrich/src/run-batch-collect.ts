import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
config({ path: resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '.env'), override: true });

import { readFileSync } from 'fs';
import Anthropic from '@anthropic-ai/sdk';
import { client as pgClient, db, experiences } from '@funex/graph';
import { eq } from 'drizzle-orm';
import { parseAndValidateResponse, type ExtractionResult, type BatchMetadata } from './extract.js';
import { writeDiff } from './diff.js';
import { EXTRACT_PROMPT_VERSION, EXTRACT_MODEL } from './prompt.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const diffDir = resolve(__dirname, '..', 'diffs');

// Sonnet 4 pricing: $3/MTok input, $15/MTok output
const INPUT_COST_PER_TOKEN = 3 / 1_000_000;
const OUTPUT_COST_PER_TOKEN = 15 / 1_000_000;

async function main() {
  const args = process.argv.slice(2).filter((a) => a !== '--');
  const batchId = args[0];

  if (!batchId) {
    console.error('Usage: pnpm enrich:collect -- <batch-id>');
    console.error('  e.g. pnpm enrich:collect -- cal-20260819');
    process.exit(1);
  }

  const trackingPath = resolve(diffDir, `${batchId}.batch.json`);
  let tracking: {
    apiBatchId: string;
    productIds: string[];
    sourceTexts: Record<string, string>;
    submittedAt: string;
  };
  try {
    tracking = JSON.parse(readFileSync(trackingPath, 'utf-8'));
  } catch {
    console.error(`Tracking file not found: ${trackingPath}`);
    process.exit(1);
  }

  const anthropic = new Anthropic();

  // Check status first
  const batch = await anthropic.messages.batches.retrieve(tracking.apiBatchId);
  if (batch.processing_status !== 'ended') {
    console.error(`Batch ${batchId} is still ${batch.processing_status}. Wait for it to end.`);
    console.log(`  Processing: ${batch.request_counts.processing}`);
    console.log(`  Succeeded:  ${batch.request_counts.succeeded}`);
    await pgClient.end();
    process.exit(1);
  }

  console.log(`Collecting results for batch "${batchId}" (${batch.id})...`);
  console.log(`  Succeeded: ${batch.request_counts.succeeded}`);
  console.log(`  Errored:   ${batch.request_counts.errored}`);
  console.log(`  Expired:   ${batch.request_counts.expired}`);
  console.log('');

  // Stream results
  const decoder = await anthropic.messages.batches.results(tracking.apiBatchId);
  const results: ExtractionResult[] = [];
  const perProductCosts: BatchMetadata['perProductCosts'] = [];
  let totalInputTokens = 0;
  let totalOutputTokens = 0;
  let totalCostUsd = 0;

  for await (const entry of decoder) {
    const expId = entry.custom_id;

    if (entry.result.type !== 'succeeded') {
      console.error(`  ${expId}: ${entry.result.type}`);
      if (entry.result.type === 'errored') {
        console.error(`    Error: ${JSON.stringify(entry.result.error)}`);
      }
      continue;
    }

    const message = entry.result.message;
    const text = message.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('');

    // Get experience title from DB
    const [exp] = await db.select().from(experiences).where(eq(experiences.id, expId));
    const title = exp?.title ?? expId;
    const sourceText = tracking.sourceTexts[expId] ?? '';

    try {
      const attributes = parseAndValidateResponse(expId, text, sourceText);

      const inputTokens = message.usage.input_tokens;
      const outputTokens = message.usage.output_tokens;
      const costUsd = inputTokens * INPUT_COST_PER_TOKEN + outputTokens * OUTPUT_COST_PER_TOKEN;

      results.push({ experienceId: expId, title, attributes, usage: { inputTokens, outputTokens }, costUsd });
      perProductCosts.push({ experienceId: expId, inputTokens, outputTokens, costUsd });
      totalInputTokens += inputTokens;
      totalOutputTokens += outputTokens;
      totalCostUsd += costUsd;

      const attrCount = Object.keys(attributes).length;
      console.log(`  ${expId}: ${attrCount} attrs, ${inputTokens}/${outputTokens} tok, $${costUsd.toFixed(4)}`);
    } catch (err) {
      console.error(`  ${expId}: parse/validation failed — ${(err as Error).message}`);
    }
  }

  const metadata: BatchMetadata = {
    promptVersion: EXTRACT_PROMPT_VERSION,
    model: EXTRACT_MODEL,
    startedAt: tracking.submittedAt,
    completedAt: batch.ended_at ?? new Date().toISOString(),
    productIds: tracking.productIds,
    totalInputTokens,
    totalOutputTokens,
    totalCostUsd,
    perProductCosts,
  };

  const diffPath = writeDiff(results, metadata, batchId);

  console.log(`\nBatch collected.`);
  console.log(`  Products: ${results.length}/${tracking.productIds.length}`);
  console.log(`  Total tokens: ${totalInputTokens} in / ${totalOutputTokens} out`);
  console.log(`  Total cost: $${totalCostUsd.toFixed(4)} USD`);
  console.log(`  Avg cost/product: $${results.length > 0 ? (totalCostUsd / results.length).toFixed(4) : '0.0000'} USD`);
  console.log(`\nDiff written to: ${diffPath}`);
  if (results.length > 0) {
    console.log(`Review it, then run: pnpm enrich:approve ${batchId}`);
  }

  await pgClient.end();
}

main().catch((err) => {
  console.error('Collection failed:', err);
  process.exit(1);
});
