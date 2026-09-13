/**
 * Pull review count + average rating from Viator product detail API
 * for all products. Writes directly to attribute table as viator.review_count
 * and viator.average_rating. No LLM, no enrichment spend.
 *
 * Idempotent — upserts by experience_id + key.
 * Rate limited at ~1.4 req/s (700ms delay).
 */
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
config({ path: resolve(dirname(fileURLToPath(import.meta.url)), '..', '.env'), override: true });

import postgres from 'postgres';

const client = postgres(process.env.DATABASE_URL ?? 'postgresql://funex:funex@localhost:5432/funex');
const apiKey = process.env.VIATOR_API_KEY;

if (!apiKey) {
  console.error('VIATOR_API_KEY required');
  process.exit(1);
}

async function main() {
  // Get all real product codes
  const mappings = await client`
    SELECT experience_id, provider_product_id as code
    FROM provider_mapping
    WHERE experience_id NOT LIKE 'exp_phuket_%'
  `;

  console.log(`Pulling review counts for ${mappings.length} products...\n`);

  let pulled = 0;
  let errors = 0;
  let withReviews = 0;

  for (const m of mappings) {
    try {
      const resp = await fetch(`https://api.viator.com/partner/products/${m.code}`, {
        headers: {
          'exp-api-key': apiKey,
          'Accept': 'application/json;version=2.0',
          'Accept-Language': 'en-US',
        },
      });

      if (!resp.ok) { errors++; continue; }

      const data = await resp.json();
      const totalReviews = data.reviews?.totalReviews ?? 0;
      const avgRating = data.reviews?.combinedAverageRating ?? 0;

      // Store as verbatim attributes
      await client`
        INSERT INTO attribute (experience_id, key, value, confidence, evidence, risk_class)
        VALUES (${m.experience_id}, 'viator.review_count', ${JSON.stringify(totalReviews)}, 1.0,
          ${JSON.stringify([{source: 'viator_verbatim', pointer: 'Viator product detail API totalReviews'}])},
          'info')
        ON CONFLICT (experience_id, key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()
      `;

      await client`
        INSERT INTO attribute (experience_id, key, value, confidence, evidence, risk_class)
        VALUES (${m.experience_id}, 'viator.average_rating', ${JSON.stringify(Math.round(avgRating * 100) / 100)}, 1.0,
          ${JSON.stringify([{source: 'viator_verbatim', pointer: 'Viator product detail API combinedAverageRating'}])},
          'info')
        ON CONFLICT (experience_id, key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()
      `;

      if (totalReviews > 0) withReviews++;
      pulled++;

      if (pulled % 100 === 0) {
        console.log(`  ${pulled}/${mappings.length} pulled (${withReviews} with reviews, ${errors} errors)...`);
      }

      await new Promise((r) => setTimeout(r, 700));
    } catch (err) {
      errors++;
    }
  }

  // Report
  const counts = await client`
    SELECT value::text::int as cnt FROM attribute
    WHERE key = 'viator.review_count' AND experience_id NOT LIKE 'exp_phuket_%'
    ORDER BY cnt DESC
  `;

  const vals = counts.map((r: any) => r.cnt as number);
  const median = vals[Math.floor(vals.length / 2)] ?? 0;
  const p90 = vals[Math.floor(vals.length * 0.1)] ?? 0; // top 10%
  const max = vals[0] ?? 0;
  const total = vals.reduce((a: number, b: number) => a + b, 0);
  const zeros = vals.filter((v: number) => v === 0).length;

  console.log(`\nDone. ${pulled} pulled, ${errors} errors.`);
  console.log(`\nReview distribution:`);
  console.log(`  With reviews: ${withReviews} / ${pulled}`);
  console.log(`  Zeros: ${zeros}`);
  console.log(`  Median: ${median}`);
  console.log(`  P90 (top 10%): ${p90}`);
  console.log(`  Max: ${max}`);
  console.log(`  Total reviews: ${total}`);

  await client.end();
}

main().catch((err) => { console.error(err); process.exit(1); });
