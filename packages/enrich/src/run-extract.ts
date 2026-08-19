import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
config({ path: resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '.env'), override: true });
import { client } from '@funex/graph';
import { extractOne, extractBatch } from './extract.js';
import { writeDiff } from './diff.js';

const CALIBRATION_SET = [
  'exp_phuket_0001', 'exp_phuket_0002', 'exp_phuket_0003',
  'exp_phuket_0009', 'exp_phuket_0011', 'exp_phuket_0014',
  'exp_phuket_0015', 'exp_phuket_0019', 'exp_phuket_0021',
  'exp_phuket_0022', 'exp_phuket_0023', 'exp_phuket_0024',
  'exp_phuket_0030', 'exp_phuket_0032', 'exp_phuket_0033',
  'exp_phuket_0039', 'exp_phuket_0042', 'exp_phuket_0044',
  'exp_phuket_0046', 'exp_phuket_0048',
];

async function main() {
  // Filter out bare "--" from pnpm passthrough
  const args = process.argv.slice(2).filter((a) => a !== '--');

  // Single product mode: --single exp_phuket_0046
  const singleIdx = args.indexOf('--single');
  if (singleIdx !== -1 && args[singleIdx + 1]) {
    const expId = args[singleIdx + 1];
    console.log(`Extracting single product: ${expId}`);
    const result = await extractOne(expId);
    console.log('\n=== Raw extraction output ===\n');
    console.log(JSON.stringify(result, null, 2));
    console.log(`\nTokens: ${result.usage.inputTokens} in / ${result.usage.outputTokens} out`);
    console.log(`Cost: $${result.costUsd.toFixed(4)} USD`);
    await client.end();
    return;
  }

  // Batch mode (default: calibration set)
  const ids = args.length > 0 ? args.filter((a) => a.startsWith('exp_')) : CALIBRATION_SET;
  const batchId = `cal-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`;

  console.log(`Extracting batch "${batchId}" — ${ids.length} products\n`);
  const { results, metadata } = await extractBatch(ids);

  const diffPath = writeDiff(results, metadata, batchId);
  console.log(`\nBatch complete.`);
  console.log(`  Products: ${results.length}/${ids.length}`);
  console.log(`  Total tokens: ${metadata.totalInputTokens} in / ${metadata.totalOutputTokens} out`);
  console.log(`  Total cost: $${metadata.totalCostUsd.toFixed(4)} USD`);
  console.log(`  Avg cost/product: $${(metadata.totalCostUsd / results.length).toFixed(4)} USD`);
  console.log(`\nDiff written to: ${diffPath}`);
  console.log(`Review it, then run: pnpm enrich:approve ${batchId}`);

  await client.end();
}

main().catch((err) => {
  console.error('Extraction failed:', err);
  process.exit(1);
});
