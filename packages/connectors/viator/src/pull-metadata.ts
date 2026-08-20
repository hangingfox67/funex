/**
 * Pull structured metadata (additionalInfo, ageBands) from Viator product detail API.
 * Writes to packages/enrich/diffs/viator-metadata.json.
 * Metadata only — no descriptions stored (directive 3).
 */
import './check-node.js';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
config({ path: resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..', '.env'), override: true });

import { writeFileSync, readFileSync, existsSync } from 'fs';
import { client, db, providerMappings } from '@funex/graph';
import { not, like } from 'drizzle-orm';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = resolve(__dirname, '..', '..', '..', '..', 'packages', 'enrich', 'diffs', 'viator-metadata.json');

interface AdditionalInfo {
  type: string;
  description: string;
}

interface AgeBand {
  ageBand: string;
  startAge: number;
  endAge: number;
}

export interface ProductMetadata {
  productCode: string;
  additionalInfo: AdditionalInfo[];
  ageBands: AgeBand[];
  pulledAt: string;
}

async function main() {
  const apiKey = process.env.VIATOR_API_KEY;
  if (!apiKey) {
    console.error('VIATOR_API_KEY required');
    process.exit(1);
  }

  // Load existing progress (idempotent)
  let existing = new Map<string, ProductMetadata>();
  if (existsSync(outPath)) {
    try {
      const prev: ProductMetadata[] = JSON.parse(readFileSync(outPath, 'utf-8'));
      for (const p of prev) existing.set(p.productCode, p);
      console.log(`Resuming: ${existing.size} already pulled`);
    } catch { /* fresh start */ }
  }

  // Get all real product codes
  const mappings = await db
    .select({ productCode: providerMappings.providerProductId })
    .from(providerMappings)
    .where(not(like(providerMappings.experienceId, 'exp_phuket_%')));

  const codes = mappings.map((m) => m.productCode).filter((c) => !existing.has(c));
  console.log(`Pulling metadata for ${codes.length} products (${existing.size} already done)...`);

  let pulled = 0;
  let errors = 0;

  for (const code of codes) {
    try {
      const resp = await fetch(`https://api.viator.com/partner/products/${code}`, {
        headers: {
          'exp-api-key': apiKey,
          'Accept': 'application/json;version=2.0',
          'Accept-Language': 'en-US',
        },
      });

      if (!resp.ok) {
        console.error(`  ${code}: HTTP ${resp.status}`);
        errors++;
        continue;
      }

      const data = await resp.json();

      existing.set(code, {
        productCode: code,
        additionalInfo: data.additionalInfo ?? [],
        ageBands: data.pricingInfo?.ageBands ?? [],
        pulledAt: new Date().toISOString(),
      });

      pulled++;
      if (pulled % 50 === 0) {
        console.log(`  ${pulled}/${codes.length} pulled (${errors} errors)...`);
        // Checkpoint write
        writeFileSync(outPath, JSON.stringify([...existing.values()], null, 2));
      }

      // Rate limit: ~1.5 req/s
      await new Promise((r) => setTimeout(r, 700));
    } catch (err) {
      console.error(`  ${code}: ${(err as Error).message}`);
      errors++;
    }
  }

  // Final write
  const allMetadata = [...existing.values()];
  writeFileSync(outPath, JSON.stringify(allMetadata, null, 2));

  // Report coverage
  const types = new Map<string, number>();
  for (const m of allMetadata) {
    for (const info of m.additionalInfo) {
      types.set(info.type, (types.get(info.type) ?? 0) + 1);
    }
  }

  console.log(`\nDone. ${pulled} new, ${errors} errors, ${allMetadata.length} total.`);
  console.log(`\nCoverage:`);
  for (const [type, count] of [...types.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${type}: ${count} products`);
  }

  const withAgeBands = allMetadata.filter((m) => m.ageBands.length > 0).length;
  console.log(`\n  Products with ageBands: ${withAgeBands}`);

  await client.end();
}

main().catch((err) => {
  console.error('Metadata pull failed:', err);
  process.exit(1);
});
