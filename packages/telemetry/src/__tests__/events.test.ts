import { describe, it, expect, afterAll } from 'vitest';
import { sql } from 'drizzle-orm';
import { db, client, events } from '@funex/graph';
import { createSessionId, ensureSession, createEventWriter } from '../index.js';

describe('Telemetry (A2)', () => {
  afterAll(async () => {
    await client.end();
  });

  it('creates session IDs with s_ prefix', () => {
    const id = createSessionId();
    expect(id).toMatch(/^s_/);
    expect(id.length).toBeGreaterThan(5);
  });

  it('creates unique session IDs', () => {
    const ids = new Set(Array.from({ length: 100 }, () => createSessionId()));
    expect(ids.size).toBe(100);
  });

  it('ensureSession inserts a session row', async () => {
    const sid = createSessionId();
    await ensureSession(db, sid, 'phuket');

    const rows = await db.execute(sql`SELECT * FROM session WHERE id = ${sid}`);
    expect(rows.length).toBe(1);
    expect(rows[0].destination_slug).toBe('phuket');
  });

  it('ensureSession is idempotent', async () => {
    const sid = createSessionId();
    await ensureSession(db, sid, 'phuket');
    await ensureSession(db, sid, 'phuket');

    const rows = await db.execute(sql`SELECT * FROM session WHERE id = ${sid}`);
    expect(rows.length).toBe(1);
  });

  it('EventWriter logs events with correct session', async () => {
    const sid = createSessionId();
    await ensureSession(db, sid);
    const writer = createEventWriter(db);

    await writer.log(sid, 'test.event', { key: 'value', num: 42 });

    const rows = await db
      .select()
      .from(events)
      .where(sql`session_id = ${sid}`);

    expect(rows.length).toBe(1);
    expect(rows[0].type).toBe('test.event');
    expect(rows[0].payload).toEqual({ key: 'value', num: 42 });
  });
});
