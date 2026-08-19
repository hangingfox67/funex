import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { sql } from 'drizzle-orm';
import { db, client, experiences, providerMappings, rails, sessions, events } from '@funex/graph';
import { MockViatorConnector } from '../mock.js';
import { syncCatalog } from '../sync.js';

describe('Viator mock sync (A2)', () => {
  beforeAll(async () => {
    const dest = await db.execute(sql`SELECT slug FROM destination WHERE slug = 'phuket'`);
    if (dest.length === 0) {
      throw new Error('Run db:seed before tests — destination "phuket" not found');
    }
  });

  afterAll(async () => {
    await client.end();
  });

  it('syncs exactly 50 fixture experience rows', async () => {
    const result = await syncCatalog(db, new MockViatorConnector(), { source: 'fixture' });
    expect(result.synced).toBe(50);
    expect(result.source).toBe('fixture');

    // Count only fixture-sourced experiences
    const rows = await db.execute(sql`SELECT count(*) as c FROM experience WHERE id LIKE 'exp_phuket_%'`);
    expect(Number(rows[0].c)).toBe(50);
  });

  it('each fixture experience has exactly one provider_mapping', async () => {
    const rows = await db.execute(
      sql`SELECT pm.* FROM provider_mapping pm JOIN experience e ON pm.experience_id = e.id WHERE e.id LIKE 'exp_phuket_%'`,
    );
    expect(rows.length).toBe(50);

    for (const m of rows) {
      expect(m.provider).toBe('viator');
      expect(m.provider_product_id).toBeTruthy();
    }
  });

  it('each fixture experience has exactly one rail', async () => {
    const rows = await db.execute(
      sql`SELECT r.* FROM rail r JOIN experience e ON r.experience_id = e.id WHERE e.id LIKE 'exp_phuket_%'`,
    );
    expect(rows.length).toBe(50);

    for (const r of rows) {
      expect(r.provider).toBe('viator');
      expect(r.payout_model).toBe('affiliate');
    }
  });

  it('sync created a session and logged events', async () => {
    // Run a fresh sync and check its specific session
    const result = await syncCatalog(db, new MockViatorConnector(), { source: 'fixture' });
    expect(result.sessionId).toMatch(/^s_/);

    const sessionEvents = await db
      .select()
      .from(events)
      .where(sql`session_id = ${result.sessionId}`);

    const types = sessionEvents.map((e) => e.type);
    expect(types).toContain('sync.started');
    expect(types).toContain('sync.completed');
  });
});
