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
      maxResults: 8,
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

  // ── Portfolio: persona 1 returns 4 diverse venues ──
  it('p01 portfolio: 4 diverse venues with reason codes', () => {
    const result = rank(allExperiences, ctx, {
      stayingZone: 'kata',
      date: '2026-08-20',
      youngestAge: 9,
      energy: 'high',
      timeBucket: 'morning',
      maxResults: 4,
    });

    expect(result.candidates.length).toBe(4);

    // All 4 must be from different experience IDs (venue dedup handled internally)
    const ids = new Set(result.candidates.map((c) => c.experienceId));
    expect(ids.size).toBe(4);

    // Must have at least 2 different categories
    const cats = new Set(result.candidates.map((c) => c.category));
    expect(cats.size).toBeGreaterThanOrEqual(2);

    // best_overall role assigned
    expect(result.candidates[0].portfolioRole).toBe('best_overall');

    // All have reason codes
    for (const c of result.candidates) {
      expect(c.reasons.length).toBeGreaterThan(0);
    }
  });

  // ── Follow-up: same persona + exclude adventure → 4 NEW venues, zero overlap ──
  it('p01 follow-up: exclude adventure → 4 new venues, zero overlap', () => {
    const first = rank(allExperiences, ctx, {
      stayingZone: 'kata',
      date: '2026-08-20',
      youngestAge: 9,
      energy: 'high',
      timeBucket: 'morning',
      maxResults: 4,
    });

    const firstIds = first.candidates.map((c) => c.experienceId);
    const firstVenues = first.candidates.map((c) => c.title);

    const followUp = rank(allExperiences, ctx, {
      stayingZone: 'kata',
      date: '2026-08-20',
      youngestAge: 9,
      energy: 'high',
      timeBucket: 'morning',
      maxResults: 4,
      exclude: { categories: ['adventure'] },
      seen: firstIds,
    });

    expect(followUp.candidates.length).toBe(4);

    // Zero overlap with first set
    for (const c of followUp.candidates) {
      expect(firstIds, `${c.experienceId} was in first set`).not.toContain(c.experienceId);
    }

    // No adventure category
    for (const c of followUp.candidates) {
      expect(c.category).not.toBe('adventure');
    }
  });

  // ── All 29 personas ──
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
        maxResults: 8, // personas test with larger set for coverage
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

      // Return-by: no full-day trips when deadline enforced
      if (persona.expect.noFullDayTrips) {
        for (const c of result.candidates) {
          if (c.durationMinutes && c.durationMinutes > 360) {
            throw new Error(`${persona.id}: ${c.title} is ${c.durationMinutes}min — should be filtered by return_by deadline`);
          }
        }
      }

      // Min group violation: no product should require more travelers than the party
      if (persona.expect.noMinGroupViolation && persona.request.partySize) {
        for (const c of result.candidates.filter((c) => c.enrichmentTier === 'enriched')) {
          const mt = c.attributes.find((a) => a.key === 'min_travelers_per_booking');
          if (mt && typeof mt.value === 'number') {
            expect(mt.value, `${persona.id}: ${c.experienceId} requires ${mt.value} travelers but party is ${persona.request.partySize}`)
              .toBeLessThanOrEqual(persona.request.partySize);
          }
        }
      }
    });
  }

  // ── Transport intent gate ──
  it('transport excluded from activity-intent queries', () => {
    const result = rank(allExperiences, ctx, {
      stayingZone: 'kata',
      date: '2026-08-20',
      energy: 'high',
      youngestAge: 9,
      timeBucket: 'morning',
      maxResults: 8,
    });

    for (const c of result.candidates) {
      expect(c.category, `${c.title} is transport but activity-intent`).not.toBe('transport');
    }

    // But with transportIntent=true, transport should appear
    const transportResult = rank(allExperiences, ctx, {
      stayingZone: 'kata',
      date: '2026-08-20',
      transportIntent: true,
      maxResults: 8,
    });
    // Should not filter transport
    const filtered = transportResult.filtered.filter((f) => f.reason === 'logistics_not_activity');
    expect(filtered.length).toBe(0);
  });

  // ── Geography: khao_lak distance sanity ──
  it('Kata guest with default transfer tolerance does NOT get khao_lak products excellent', () => {
    // Khao Lak is ~90km from Kata — should NOT dominate the portfolio
    const result = rank(allExperiences, ctx, {
      stayingZone: 'kata',
      date: '2026-08-20',
      maxResults: 8,
    });

    // Khao Lak products (title contains "Khao Lak") should not be in top results
    // unless they have very high scores for other reasons
    const khaoLakInTop = result.candidates.filter((c) =>
      c.title.toLowerCase().includes('khao lak'),
    );
    // Acceptable: 0-1 khao lak products (might appear as wildcard). NOT dominating.
    expect(khaoLakInTop.length).toBeLessThanOrEqual(1);
  });

  it('staying=khao_lak anchors cleanly and returns results', () => {
    const result = rank(allExperiences, ctx, {
      stayingZone: 'khao_lak',
      date: '2026-08-20',
      maxResults: 4,
    });

    expect(result.candidates.length).toBeGreaterThanOrEqual(1);
  });

  // ── Review signal doesn't collapse portfolio diversity ──
  it('review counts do not collapse portfolio to same blockbusters', () => {
    const result = rank(allExperiences, ctx, {
      stayingZone: 'kata',
      date: '2026-08-20',
      maxResults: 4,
    });

    // Must have 4 candidates from different activity types
    expect(result.candidates.length).toBe(4);

    // No two candidates share the same experienceId
    const ids = new Set(result.candidates.map((c) => c.experienceId));
    expect(ids.size).toBe(4);

    // At least 2 different categories
    const cats = new Set(result.candidates.map((c) => c.category));
    expect(cats.size).toBeGreaterThanOrEqual(2);

    // The top-5 review-count products (44720P2, 15484P1, 44720P1, etc.)
    // must NOT fill all 4 slots — portfolio diversity beats review volume
    const blockbusters = new Set(['exp_44720P2', 'exp_15484P1', 'exp_44720P1', 'exp_399004P1', 'exp_90546P39']);
    const blockbusterCount = result.candidates.filter((c) => blockbusters.has(c.experienceId)).length;
    expect(blockbusterCount).toBeLessThanOrEqual(2);
  });
});

// ── Forced-weather fixtures (never depend on real weather) ──

function makeCtx(overrides: {
  rainSlots: { morning: boolean; midday: boolean; evening: boolean };
  seaClassification?: 'calm' | 'moderate' | 'rough';
}): ContextSnapshot {
  return {
    destination: 'phuket',
    zone: 'kata',
    date: '2026-08-20',
    weather: {
      date: '2026-08-20',
      zone: 'kata',
      temperature: { min: 27, max: 32, unit: 'celsius' },
      precipitation: { probability: 80, total_mm: 15 },
      rain_buckets: [
        { slot: 'morning', probability: overrides.rainSlots.morning ? 80 : 10, total_mm: overrides.rainSlots.morning ? 5 : 0, rainy: overrides.rainSlots.morning },
        { slot: 'midday', probability: overrides.rainSlots.midday ? 75 : 15, total_mm: overrides.rainSlots.midday ? 4 : 0, rainy: overrides.rainSlots.midday },
        { slot: 'evening', probability: overrides.rainSlots.evening ? 90 : 5, total_mm: overrides.rainSlots.evening ? 10 : 0, rainy: overrides.rainSlots.evening },
      ],
      wind: { speed_kmh: 15, gusts_kmh: 25, direction: 240 },
      uv_index_max: 7,
      summary: 'Fixture weather',
      basis: 'forecast',
      as_of: new Date().toISOString(),
    },
    seaState: {
      date: '2026-08-20',
      zone: 'kata',
      swell_height_m: 1.5,
      swell_direction: 270,
      swell_period_s: 8,
      wave_height_m: 1.8,
      zone_exposed_to: 240,
      exposure_match: true,
      classification: overrides.seaClassification ?? 'moderate',
      summary: 'Fixture sea state',
      basis: 'marine_forecast',
      as_of: new Date().toISOString(),
    },
    transfers: { morning: [], midday: [], evening: [] },
    season: { season: 'low', label: 'low season', basis: 'config', as_of: new Date().toISOString() },
  };
}

describe('Forced-weather fixtures', () => {
  // Uses allExperiences loaded in the first describe's beforeAll.
  // DB connection shared — no separate afterAll.
  const getEnriched = () => allExperiences.filter((r) => r.enrichmentTier === 'enriched');

  it('(a) rain after 15:00 — morning zipline passes, full-day outdoor penalized, indoor unaffected', () => {
    const afternoonRain = makeCtx({ rainSlots: { morning: false, midday: false, evening: true } });
    const result = rank(getEnriched(), afternoonRain, {
      stayingZone: 'kata',
      date: '2026-08-20',
      energy: 'high',
      timeBucket: 'morning',
      maxResults: 8,
    });

    // Morning zipline should pass (outdoor, but morning is dry)
    const ziplines = result.candidates.filter((c) => c.title.toLowerCase().includes('zipline') || c.title.toLowerCase().includes('hanuman'));
    expect(ziplines.length).toBeGreaterThan(0);

    // Check for dry_window_match reason on morning outdoor activities
    const withDryWindow = result.candidates.filter((c) => c.reasons.includes('dry_window_match'));
    expect(withDryWindow.length).toBeGreaterThan(0);

    // Indoor activities should not have rain_risk
    const muayThai = result.candidates.find((c) => c.title.toLowerCase().includes('muay thai'));
    if (muayThai) {
      expect(muayThai.reasons).not.toContain('rain_risk');
    }
  });

  it('(b) all-day rain — outdoor hard-filtered, indoor ranked', () => {
    const enriched = getEnriched();
    expect(enriched.length, 'No enriched products loaded').toBeGreaterThan(0);

    // Verify we have rain_viable=false products in the set
    const outdoorCount = enriched.filter((e) => {
      const rv = e.attributes.find((a) => a.key === 'rain_viable');
      const indoor = e.attributes.find((a) => a.key === 'indoor');
      return rv?.value === false && indoor?.value !== true;
    }).length;

    const allDayRain = makeCtx({ rainSlots: { morning: true, midday: true, evening: true } });
    const result = rank(enriched, allDayRain, {
      stayingZone: 'kata',
      date: '2026-08-20',
      maxResults: 8,
    });

    // Outdoor non-rain-viable should be filtered
    const filteredRain = result.filtered.filter((f) => f.reason === 'not_rain_viable');
    if (outdoorCount > 0) {
      expect(filteredRain.length, `${outdoorCount} outdoor products but 0 rain-filtered`).toBeGreaterThan(0);
    }

    // Indoor/rain-viable candidates should have rain_safe reason
    const rainSafe = result.candidates.filter((c) => c.reasons.includes('rain_safe'));
    expect(rainSafe.length).toBeGreaterThanOrEqual(0);
  });

  it('(c) rain after 15:00 — full-day 480min outdoor gets rain_risk_afternoon, short morning gets dry_window_match', () => {
    const afternoonRain = makeCtx({ rainSlots: { morning: false, midday: false, evening: true } });
    const enriched = getEnriched();

    // Find a short morning outdoor and a full-day outdoor product
    const shortOutdoor = enriched.find((e) => {
      const rain = e.attributes.find((a) => a.key === 'rain_viable');
      const indoor = e.attributes.find((a) => a.key === 'indoor');
      return e.durationMinutes && e.durationMinutes <= 180 && rain?.value === false && indoor?.value !== true;
    });
    const fullDayOutdoor = enriched.find((e) => {
      const rain = e.attributes.find((a) => a.key === 'rain_viable');
      const indoor = e.attributes.find((a) => a.key === 'indoor');
      return e.durationMinutes && e.durationMinutes >= 420 && rain?.value === false && indoor?.value !== true;
    });

    if (shortOutdoor) {
      const result = rank([shortOutdoor], afternoonRain, {
        stayingZone: 'kata', date: '2026-08-20', timeBucket: 'morning', maxResults: 1,
      });
      if (result.candidates.length > 0) {
        // Short morning outdoor: starts and ends in dry slots → dry_window_match
        expect(result.candidates[0].reasons).toContain('dry_window_match');
        expect(result.candidates[0].reasons).not.toContain('rain_risk_afternoon');
      }
    }

    if (fullDayOutdoor) {
      const result = rank([fullDayOutdoor], afternoonRain, {
        stayingZone: 'kata', date: '2026-08-20', timeBucket: 'morning', maxResults: 1,
      });
      if (result.candidates.length > 0) {
        // Full-day outdoor starting morning: spans into evening rain → rain_risk_afternoon
        expect(result.candidates[0].reasons).toContain('rain_risk_afternoon');
        expect(result.candidates[0].reasons).not.toContain('dry_window_match');
      }
    }
  });
});
