import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { rank, type RankRequest } from '../rank.js';
import { context, resetContextCache, type ContextSnapshot } from '@funex/context';
import { db, client, searchExperiences } from '@funex/graph';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..', '..', '..', '..');

interface Persona {
  id: string;
  name: string;
  description: string;
  request: RankRequest & { date?: string };
  expect: {
    minCandidates?: number;
    mustNotHaveMobility?: string;
    noSwimRequired?: boolean;
    allPregnantOk?: boolean;
    shouldPreferSheltered?: boolean;
    mustIncludeCategory?: string | null;
    mustExcludeReason?: string | null;
  };
}

const personas: Persona[] = JSON.parse(
  readFileSync(resolve(repoRoot, 'fixtures', 'personas', 'personas.json'), 'utf-8'),
);

let ctx: ContextSnapshot;
let allExperiences: Awaited<ReturnType<typeof searchExperiences>>['results'];

describe('Ranker (A5)', () => {
  beforeAll(async () => {
    // Fetch context once (live APIs)
    ctx = await context('phuket', 'kata', '2026-08-20');

    // Fetch all enriched + basic products
    const { results } = await searchExperiences({
      destinationSlug: 'phuket',
      safetyFiltersActive: false,
      limit: 2000,
      db,
    });
    allExperiences = results;
    console.log(`  Loaded ${allExperiences.length} experiences (${results.filter((r) => r.enrichmentTier === 'enriched').length} enriched)`);
  }, 30000);

  afterAll(async () => {
    resetContextCache();
    await client.end();
  });

  // ── p95 latency on all enriched ──
  it('p95 < 50ms on enriched products', () => {
    const enriched = allExperiences.filter((r) => r.enrichmentTier === 'enriched');
    const times: number[] = [];

    for (let i = 0; i < 100; i++) {
      const start = performance.now();
      rank(enriched, ctx, { stayingZone: 'kata', date: '2026-08-20' });
      times.push(performance.now() - start);
    }

    times.sort((a, b) => a - b);
    const p95 = times[Math.floor(times.length * 0.95)];
    console.log(`  p95 latency: ${p95.toFixed(2)}ms (100 runs, ${enriched.length} products)`);
    expect(p95).toBeLessThan(50);
  });

  // ── Directive 8 ──
  it('rank package imports nothing from router/connectors', async () => {
    const src = ['rank.ts', 'filters.ts', 'tiers.ts', 'index.ts']
      .map((f) => readFileSync(resolve(__dirname, '..', f), 'utf-8'))
      .join('\n');

    expect(src).not.toContain('@funex/router');
    expect(src).not.toContain('@funex/connectors');
    expect(src).not.toContain('./router');
    expect(src).not.toContain('./redirect');
  });

  // ── West swell → sheltered products outrank open sea (persona 19) ──
  it('p19: west swell → sheltered products outrank open-sea', () => {
    const enriched = allExperiences.filter((r) => r.enrichmentTier === 'enriched');
    const result = rank(enriched, ctx, {
      stayingZone: 'kata',
      date: '2026-08-20',
      energy: 'moderate',
      limit: 50,
    });

    // If sea state is moderate/rough (SW swell in August hits kata),
    // sheltered_bay/none products should score higher than open_sea
    if (ctx.seaState.classification !== 'calm') {
      const top10 = result.candidates.slice(0, 10);
      const shelteredInTop = top10.filter((c) => {
        const water = c.attributes.find((a) => a.key === 'water_exposure');
        return water && (water.value === 'sheltered_bay' || water.value === 'none');
      }).length;
      const openSeaInTop = top10.filter((c) => {
        const water = c.attributes.find((a) => a.key === 'water_exposure');
        return water && water.value === 'open_sea';
      }).length;

      console.log(`  Sea: ${ctx.seaState.classification}. Top 10: ${shelteredInTop} sheltered, ${openSeaInTop} open_sea`);
      // In rough/moderate seas, we should NOT have open_sea dominating the top
      expect(shelteredInTop).toBeGreaterThanOrEqual(openSeaInTop);
    }
  });

  // ── All 25 personas ──
  for (const persona of personas) {
    it(`${persona.id}: ${persona.name}`, () => {
      const safetyFiltersActive = !!(
        persona.request.requireNonSwimmerOk ||
        persona.request.requirePregnantOk ||
        persona.request.maxMobility
      );

      // Use appropriate experience set based on safety filters
      const experiences = safetyFiltersActive
        ? allExperiences.filter((e) => e.enrichmentTier === 'enriched')
        : allExperiences;

      const result = rank(experiences, ctx, {
        ...persona.request,
        stayingZone: persona.request.stayingZone ?? 'kata',
        date: persona.request.date ?? '2026-08-20',
      });

      // Min candidates
      if (persona.expect.minCandidates !== undefined) {
        expect(
          result.candidates.length,
          `${persona.id} expected ≥${persona.expect.minCandidates} candidates, got ${result.candidates.length}`,
        ).toBeGreaterThanOrEqual(persona.expect.minCandidates);
      }

      // No high-mobility when limited required
      if (persona.expect.mustNotHaveMobility) {
        for (const c of result.candidates) {
          const mob = c.attributes.find((a) => a.key === 'mobility');
          if (mob) {
            expect(mob.value, `${persona.id}: ${c.experienceId} has mobility=${mob.value}`)
              .not.toBe(persona.expect.mustNotHaveMobility);
          }
        }
      }

      // Non-swimmer safety
      if (persona.expect.noSwimRequired) {
        for (const c of result.candidates.filter((c) => c.enrichmentTier === 'enriched')) {
          const ns = c.attributes.find((a) => a.key === 'non_swimmer_ok');
          if (ns) {
            expect(ns.value, `${persona.id}: ${c.experienceId} requires swimming`).not.toBe(false);
          }
        }
      }

      // Pregnant safety
      if (persona.expect.allPregnantOk) {
        for (const c of result.candidates.filter((c) => c.enrichmentTier === 'enriched')) {
          const p = c.attributes.find((a) => a.key === 'pregnant_ok');
          if (p) {
            expect(p.value, `${persona.id}: ${c.experienceId} not pregnant safe`).not.toBe(false);
          }
        }
      }
    });
  }
});
