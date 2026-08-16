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

export async function syncCatalog(
  db: typeof defaultDb = defaultDb,
  connector?: RailConnector,
) {
  const conn = connector ?? createViatorConnector();
  const sessionId = createSessionId();
  const events = createEventWriter(db);

  await ensureSession(db, sessionId, 'phuket');
  await events.log(sessionId, 'sync.started', { provider: 'viator', destination: 'phuket' });

  const products = await conn.syncCatalog('phuket');

  let synced = 0;
  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const expId = `exp_phuket_${String(i + 1).padStart(4, '0')}`;

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

    // Upsert rail (one synthetic "offer")
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
  }

  await events.log(sessionId, 'sync.completed', {
    provider: 'viator',
    destination: 'phuket',
    count: synced,
  });

  return { sessionId, synced };
}
