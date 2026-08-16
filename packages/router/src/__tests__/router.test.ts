import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { sql } from 'drizzle-orm';
import { db, client } from '@funex/graph';
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
      );
      expect(result.url).toContain('sid=s_test-session-123');
      expect(result.url).toContain('12345P1');
      expect(result.provider).toBe('viator');
      expect(result.payoutModel).toBe('affiliate');
      expect(result.rate).toBe(0.08);
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
      const result = await routeExperience('exp_phuket_0001', 's_router-test', db);
      expect(result).not.toBeNull();
      expect(result!.url).toContain('sid=s_router-test');
      expect(result!.url).toContain('viator.com');
      expect(result!.provider).toBe('viator');
    });

    it('returns null for a nonexistent experience', async () => {
      const result = await routeExperience('exp_nonexistent', 's_test', db);
      expect(result).toBeNull();
    });

    it('every synced experience can be routed', async () => {
      for (let i = 1; i <= 50; i++) {
        const expId = `exp_phuket_${String(i).padStart(4, '0')}`;
        const result = await routeExperience(expId, `s_batch-${i}`, db);
        expect(result, `routing failed for ${expId}`).not.toBeNull();
        expect(result!.url).toContain(`sid=s_batch-${i}`);
      }
    });
  });
});
