import './check-node.js';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
config({ path: resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '.env'), override: true });

import { writeFileSync } from 'fs';
import { sql, eq } from 'drizzle-orm';
import { client, db, experiences, attributes } from '@funex/graph';
import { reclassify } from './reclassify.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
  const apply = process.argv.includes('--apply');

  // Get all enriched products with their categories
  const enrichedIds = await db
    .selectDistinct({ experienceId: attributes.experienceId })
    .from(attributes)
    .where(sql`${attributes.experienceId} NOT LIKE 'exp_phuket_%'`);

  const enrichedSet = new Set(enrichedIds.map((r) => r.experienceId));

  const rows = await db.select().from(experiences).where(sql`${experiences.id} NOT LIKE 'exp_phuket_%'`);
  const enriched = rows.filter((r) => enrichedSet.has(r.id));

  console.log(`Reclassifying ${enriched.length} enriched products...\n`);

  const changes: { id: string; title: string; from: string; to: string; reason: string; tags: string[] }[] = [];
  const tagMap: { id: string; tags: string[] }[] = [];

  for (const row of enriched) {
    const result = reclassify({
      id: row.id,
      title: row.title,
      currentCategory: row.category,
      attributes: {},
    });

    tagMap.push({ id: row.id, tags: result.activityTags });

    if (result.changed) {
      changes.push({
        id: row.id,
        title: row.title.substring(0, 60),
        from: result.currentCategory,
        to: result.newCategory,
        reason: result.reason,
        tags: result.activityTags,
      });
    }
  }

  // Report
  console.log(`Changes: ${changes.length} / ${enriched.length}\n`);
  for (const c of changes.sort((a, b) => a.from.localeCompare(b.from))) {
    console.log(`  ${c.id} [${c.from} → ${c.to}]`);
    console.log(`    ${c.title}`);
    console.log(`    reason: ${c.reason}${c.tags.length > 0 ? ' | tags: ' + c.tags.join(',') : ''}`);
  }

  // Write diff for review
  const diffPath = resolve(__dirname, '..', 'diffs', 'category-reclassify.json');
  writeFileSync(diffPath, JSON.stringify({ changes, tagMap, total: enriched.length }, null, 2));
  console.log(`\nDiff written to: ${diffPath}`);

  if (apply) {
    console.log('\nApplying changes...');
    for (const c of changes) {
      await db.update(experiences).set({ category: c.to }).where(eq(experiences.id, c.id));
    }
    // Store activity_tags as attribute
    for (const t of tagMap) {
      if (t.tags.length > 0) {
        await db.insert(attributes).values({
          experienceId: t.id,
          key: 'activity_tags',
          value: JSON.stringify(t.tags),
          confidence: 1.0,
          evidence: [{ source: 'reclassify', pointer: 'Extracted from title' }] as any,
          riskClass: 'info',
        }).onConflictDoUpdate({
          target: [attributes.experienceId, attributes.key],
          set: { value: sql`EXCLUDED.value`, updatedAt: sql`now()` },
        });
      }
    }
    console.log(`Applied ${changes.length} category changes + ${tagMap.filter(t => t.tags.length > 0).length} activity_tags rows.`);
  } else {
    console.log('\nDry run. Add --apply to execute.');
  }

  await client.end();
}

main().catch(console.error);
