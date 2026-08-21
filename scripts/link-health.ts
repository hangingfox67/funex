/**
 * Nightly link-health check.
 * HEAD-checks booking URLs for all enriched products.
 * Dead products (non-2xx/3xx) get rail.health set to 'dead',
 * dropping them from serving until re-synced.
 *
 * Usage: pnpm ops:link-health
 */
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
config({ path: resolve(dirname(fileURLToPath(import.meta.url)), '..', '.env'), override: true });

import { sql, eq } from 'drizzle-orm';
import { db, client, experiences, providerMappings, rails } from '@funex/graph';

const PHUKET_DEST_ID = '349';

function titleToSlug(title: string): string {
  return title
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 100);
}

async function main() {
  // Get all enriched products with active rails
  const rows = await db.execute(sql`
    SELECT e.id, e.title, pm.provider_product_id
    FROM experience e
    JOIN provider_mapping pm ON pm.experience_id = e.id
    JOIN rail r ON r.experience_id = e.id AND r.health = 'active'
    WHERE e.id NOT LIKE 'exp_phuket_%'
      AND e.id IN (SELECT DISTINCT experience_id FROM attribute WHERE experience_id NOT LIKE 'exp_phuket_%')
    ORDER BY e.id
  `);

  console.log(`Checking ${rows.length} enriched products with active rails...\n`);

  let checked = 0;
  let alive = 0;
  let dead = 0;
  const deadProducts: { id: string; title: string; status: number; url: string }[] = [];

  for (const row of rows) {
    const expId = row.id as string;
    const title = row.title as string;
    const productCode = row.provider_product_id as string;
    const slug = titleToSlug(title);
    const url = `https://www.viator.com/tours/Phuket/${slug}/d${PHUKET_DEST_ID}-${productCode}`;

    try {
      const resp = await fetch(url, {
        method: 'HEAD',
        redirect: 'follow',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; FunexLinkCheck/1.0)',
        },
        signal: AbortSignal.timeout(10000),
      });

      // 403 is Viator's bot protection — treat as alive (browsers get through)
      // Only 404/410 are genuinely dead
      if (resp.status === 404 || resp.status === 410) {
        dead++;
        deadProducts.push({ id: expId, title: title.substring(0, 50), status: resp.status, url });
        console.log(`  DEAD ${resp.status}: ${expId} ${title.substring(0, 50)}`);

        // Mark rail as dead
        await db.update(rails)
          .set({ health: 'dead' })
          .where(eq(rails.experienceId, expId));
      } else {
        alive++;
      }
    } catch (err) {
      // Timeout or network error — don't flag as dead (transient)
      console.warn(`  TIMEOUT: ${expId} ${title.substring(0, 50)}`);
    }

    checked++;
    if (checked % 50 === 0) {
      console.log(`  ${checked}/${rows.length} checked (${dead} dead)...`);
    }

    // Rate limit: ~2 req/s
    await new Promise((r) => setTimeout(r, 500));
  }

  console.log(`\nDone. ${checked} checked, ${alive} alive, ${dead} dead.`);
  if (deadProducts.length > 0) {
    console.log('\nDead products (rail.health set to "dead"):');
    for (const d of deadProducts) {
      console.log(`  ${d.id} [${d.status}] ${d.title}`);
    }
  }

  await client.end();
}

main().catch((err) => {
  console.error('Link health check failed:', err);
  process.exit(1);
});
