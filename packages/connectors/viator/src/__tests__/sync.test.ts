import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { sql } from 'drizzle-orm';
import { db, client, experiences, providerMappings, rails, sessions, events } from '@funex/graph';
import { syncCatalog } from '../sync.js';

describe('Viator mock sync (A2)', () => {
  beforeAll(async () => {
    // Ensure destination exists (seed should have run)
    const dest = await db.execute(sql`SELECT slug FROM destination WHERE slug = 'phuket'`);
    if (dest.length === 0) {
      throw new Error('Run db:seed before tests — destination "phuket" not found');
    }
  });

  afterAll(async () => {
    await client.end();
  });

  it('syncs exactly 50 experience rows', async () => {
    const result = await syncCatalog(db);
    expect(result.synced).toBe(50);

    const rows = await db.select().from(experiences);
    expect(rows.length).toBe(50);
  });

  it('each experience has exactly one provider_mapping', async () => {
    const mappings = await db.select().from(providerMappings);
    expect(mappings.length).toBe(50);

    // Every experience ID should have exactly one mapping
    const expIds = new Set(mappings.map((m) => m.experienceId));
    expect(expIds.size).toBe(50);

    // All mappings are viator
    for (const m of mappings) {
      expect(m.provider).toBe('viator');
      expect(m.providerProductId).toBeTruthy();
    }
  });

  it('each experience has exactly one rail (synthetic offer)', async () => {
    const allRails = await db.select().from(rails);
    expect(allRails.length).toBe(50);

    for (const r of allRails) {
      expect(r.provider).toBe('viator');
      expect(r.payoutModel).toBe('affiliate');
      expect(r.rate).toBe(0.08);
      expect(r.health).toBe('active');
    }
  });

  it('sync created a session and logged events', async () => {
    const allSessions = await db.select().from(sessions);
    expect(allSessions.length).toBeGreaterThanOrEqual(1);

    // Find sync session (the most recent one)
    const syncSession = allSessions[allSessions.length - 1];
    expect(syncSession.id).toMatch(/^s_/);
    expect(syncSession.destinationSlug).toBe('phuket');

    // Check events for this session
    const sessionEvents = await db
      .select()
      .from(events)
      .where(sql`session_id = ${syncSession.id}`);

    const types = sessionEvents.map((e) => e.type);
    expect(types).toContain('sync.started');
    expect(types).toContain('sync.completed');
  });
});
