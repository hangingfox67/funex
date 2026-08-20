import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { sql } from 'drizzle-orm';
import { db, client, isFixture, FIXTURE_ID_PREFIX } from '@funex/graph';
import { buildBookingUrl, routeExperience } from '../router.js';

describe('Rail router (A2)', () => {
  afterAll(async () => {
    await client.end();
  });

  describe('buildBookingUrl', () => {
    it('includes session ID in the URL', () => {
      const result = buildBookingUrl(
        { provider: 'viator', payoutModel: 'affiliate', rate: 0.08 },
        '12345P1',
        's_test-session-123',
        'exp_170728P24',
      );
      expect(result.url).toContain('sid=s_test-session-123');
      expect(result.url).toContain('12345P1');
      expect(result.provider).toBe('viator');
      expect(result.payoutModel).toBe('affiliate');
      expect(result.rate).toBe(0.08);
    });

    it('includes campaign=sessionId in the URL', () => {
      const result = buildBookingUrl(
        { provider: 'viator', payoutModel: 'affiliate', rate: 0.08 },
        '12345P1',
        's_campaign-test',
        'exp_170728P24',
      );
      expect(result.url).toContain('campaign=s_campaign-test');
    });

    it('includes redirectUrl with sessionId and experienceId', () => {
      const result = buildBookingUrl(
        { provider: 'viator', payoutModel: 'affiliate', rate: 0.08 },
        '12345P1',
        's_test-session-123',
        'exp_170728P24',
      );
      expect(result.redirectUrl).toBe('/r/s_test-session-123/exp_170728P24');
    });
  });

  describe('routeExperience', () => {
    beforeAll(async () => {
      // Ensure sync has run (experiences and rails exist)
      const exps = await db.execute(sql`SELECT count(*) as c FROM experience`);
      if (Number(exps[0].c) === 0) {
        throw new Error('Run sync before router tests — no experiences found');
      }
    });

    it('returns a session-tagged URL for a valid experience', async () => {
      // Use a real Viator product, not a fixture
      const rows = await db.execute(
        sql`SELECT id FROM experience WHERE id NOT LIKE 'exp_phuket_%' LIMIT 1`,
      );
      if (rows.length === 0) throw new Error('No real products synced — run sync first');
      const expId = rows[0].id as string;
      const result = await routeExperience(expId, 's_router-test', db);
      expect(result).not.toBeNull();
      expect(result!.url).toContain('sid=s_router-test');
      expect(result!.url).toContain('viator.com');
      expect(result!.provider).toBe('viator');
      expect(result!.redirectUrl).toBe(`/r/s_router-test/${expId}`);
    });

    it('returns null for a nonexistent experience', async () => {
      const result = await routeExperience('exp_nonexistent', 's_test', db);
      expect(result).toBeNull();
    });

    it('rejects all fixture experiences — they must never reach agents', async () => {
      for (const i of [1, 10, 25, 50]) {
        const expId = `exp_phuket_${String(i).padStart(4, '0')}`;
        const result = await routeExperience(expId, `s_batch-${i}`, db);
        expect(result, `fixture ${expId} must not be routable`).toBeNull();
      }
    });

    it('routes a real Viator experience (non-fixture)', async () => {
      // Pick any real experience (not prefixed with exp_phuket_)
      const rows = await db.execute(
        sql`SELECT id FROM experience WHERE id NOT LIKE 'exp_phuket_%' LIMIT 1`,
      );
      if (rows.length === 0) return; // skip if no real products synced
      const expId = rows[0].id as string;
      expect(isFixture(expId)).toBe(false);
      const result = await routeExperience(expId, 's_real-test', db);
      expect(result).not.toBeNull();
      expect(result!.url).toContain('sid=s_real-test');
      expect(result!.redirectUrl).toBe(`/r/s_real-test/${expId}`);
    });

    it('isFixture correctly classifies IDs', () => {
      expect(isFixture('exp_phuket_0001')).toBe(true);
      expect(isFixture('exp_phuket_0050')).toBe(true);
      expect(isFixture('exp_170728P24')).toBe(false);
      expect(isFixture('exp_5594474P3')).toBe(false);
      expect(FIXTURE_ID_PREFIX).toBe('exp_phuket_');
    });
  });
});
