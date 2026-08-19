import { sql } from 'drizzle-orm';
import {
  experiences,
  providerMappings,
  rails,
  db as defaultDb,
} from '@funex/graph';
import {
  createSessionId,
  ensureSession,
  createEventWriter,
} from '@funex/telemetry';
import type { RailConnector } from './interface.js';
import { createViatorConnector } from './factory.js';

/**
 * Sync catalog from Viator (mock or real).
 *
 * source = 'fixture' for mock products (kept for tests, excluded from serving).
 * source = 'viator' for real API products (fresh exp_ids based on product code).
 */
export async function syncCatalog(
  db: typeof defaultDb = defaultDb,
  connector?: RailConnector,
  options: { source?: 'fixture' | 'viator' } = {},
) {
  const conn = connector ?? createViatorConnector();
  const source = options.source ?? (process.env.MOCK_VIATOR === '1' || !process.env.VIATOR_API_KEY ? 'fixture' : 'viator');
  const sessionId = createSessionId();
  const events = createEventWriter(db);

  await ensureSession(db, sessionId, 'phuket');
  await events.log(sessionId, 'sync.started', { provider: 'viator', destination: 'phuket', source });

  const products = await conn.syncCatalog('phuket');

  let synced = 0;
  for (let i = 0; i < products.length; i++) {
    const p = products[i];

    // Fixture products use sequential IDs; real products use productCode-based IDs
    const expId = source === 'fixture'
      ? `exp_phuket_${String(i + 1).padStart(4, '0')}`
      : `exp_${p.productCode}`;

    // Upsert experience
    await db
      .insert(experiences)
      .values({
        id: expId,
        destinationSlug: 'phuket',
        title: p.title,
        category: p.category,
        meetingPoints: p.meetingPoints,
        durationMinutes: p.durationMinutes,
        basePriceCents: p.priceCents,
      })
      .onConflictDoUpdate({
        target: experiences.id,
        set: {
          title: sql`EXCLUDED.title`,
          category: sql`EXCLUDED.category`,
          meetingPoints: sql`EXCLUDED.meeting_points`,
          durationMinutes: sql`EXCLUDED.duration_minutes`,
          basePriceCents: sql`EXCLUDED.base_price_cents`,
          updatedAt: sql`now()`,
        },
      });

    // Upsert provider_mapping
    await db
      .insert(providerMappings)
      .values({
        experienceId: expId,
        provider: 'viator',
        providerProductId: p.productCode,
      })
      .onConflictDoUpdate({
        target: [providerMappings.experienceId, providerMappings.provider],
        set: {
          providerProductId: sql`EXCLUDED.provider_product_id`,
        },
      });

    // Upsert rail
    await db
      .insert(rails)
      .values({
        experienceId: expId,
        provider: 'viator',
        payoutModel: 'affiliate',
        rate: 0.08,
        priority: 0,
        health: 'active',
      })
      .onConflictDoUpdate({
        target: [rails.experienceId, rails.provider],
        set: {
          payoutModel: sql`EXCLUDED.payout_model`,
          rate: sql`EXCLUDED.rate`,
          health: sql`EXCLUDED.health`,
        },
      });

    synced++;
    if (synced % 100 === 0) {
      console.log(`  Synced ${synced}/${products.length} to DB...`);
    }
  }

  await events.log(sessionId, 'sync.completed', {
    provider: 'viator',
    destination: 'phuket',
    source,
    count: synced,
  });

  return { sessionId, synced, source };
}
