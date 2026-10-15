/**
 * Transfer routing correctness tests.
 *
 * Covers: unknown routes, pickup coverage, same-zone uncertainty,
 * verification gating, multiple start points, no median ranking.
 */
import { describe, it, expect } from 'vitest';
import { rank, type RankRequest } from '../rank.js';
import type { ExperienceRow, RankAttribute } from '../types.js';
import type { ContextSnapshot } from '@funex/context';

// ── Fixtures ──

function makeAttr(key: string, value: unknown, riskClass = 'informational', gateStatus?: string): RankAttribute {
  return {
    key, value, confidence: 0.95, riskClass,
    evidence: [{ source: 'test', pointer: 'fixture', ...(gateStatus ? { gate_status: gateStatus } : {}) }],
  };
}

function makeExp(id: string, title: string, overrides?: Partial<ExperienceRow>): ExperienceRow {
  return {
    id,
    title,
    category: 'adventure',
    durationMinutes: 180,
    basePriceCents: 200000,
    meetingPoints: [],
    enrichmentTier: 'enriched',
    attributes: [
      makeAttr('rain_viable', false),
      makeAttr('indoor', false),
      makeAttr('water_exposure', 'none'),
      makeAttr('vessel_type', 'none'),
      makeAttr('mobility', 'moderate'),
      makeAttr('non_swimmer_ok', true),
      makeAttr('pregnant_ok', true),
      makeAttr('seasickness_risk', 'none'),
      makeAttr('intensity', 'moderate'),
    ],
    ...overrides,
  };
}

function makeCtx(stayingZone: string): ContextSnapshot {
  return {
    destination: 'phuket',
    zone: stayingZone,
    date: '2026-08-20',
    weather: {
      date: '2026-08-20',
      zone: stayingZone,
      temperature: { min: 27, max: 32, unit: 'celsius' },
      precipitation: { probability: 10, total_mm: 0 },
      rain_buckets: [
        { slot: 'morning', probability: 10, total_mm: 0, rainy: false },
        { slot: 'midday', probability: 15, total_mm: 0, rainy: false },
        { slot: 'evening', probability: 5, total_mm: 0, rainy: false },
      ],
      wind: { speed_kmh: 10, gusts_kmh: 15, direction: 180 },
      uv_index_max: 7,
      summary: 'Clear',
      basis: 'forecast',
      as_of: new Date().toISOString(),
    },
    seaState: {
      date: '2026-08-20',
      zone: stayingZone,
      swell_height_m: 0.5,
      swell_direction: 180,
      swell_period_s: 8,
      wave_height_m: 0.6,
      zone_exposed_to: 240,
      exposure_match: false,
      classification: 'calm',
      summary: 'Calm',
      basis: 'marine_forecast',
      as_of: new Date().toISOString(),
    },
    transfers: {
      morning: [
        { from_zone: 'kata', to_zone: 'patong', bucket: 'morning', duration_minutes: 14, distance_km: 8, basis: 'routed', as_of: '' },
        { from_zone: 'kata', to_zone: 'old_town', bucket: 'morning', duration_minutes: 24, distance_km: 15, basis: 'routed', as_of: '' },
        { from_zone: 'kata', to_zone: 'khao_lak', bucket: 'morning', duration_minutes: 83, distance_km: 90, basis: 'routed', as_of: '' },
        { from_zone: 'kata', to_zone: 'airport', bucket: 'morning', duration_minutes: 45, distance_km: 35, basis: 'routed', as_of: '' },
      ],
      midday: [],
      evening: [],
    },
    season: { season: 'low', label: 'low season', basis: 'config', as_of: new Date().toISOString() },
  };
}

// ── Tests ──

describe('Transfer routing correctness', () => {
  // 1. Verified venue produces a transfer estimate
  it('verified venue in different zone produces transfer minutes', () => {
    const exp = makeExp('exp_verified', 'Andamanda Waterpark');
    const ctx = makeCtx('kata');
    const venueZones = new Map([['exp_verified', 'old_town']]);

    const result = rank([exp], ctx, {
      stayingZone: 'kata',
      date: '2026-08-20',
      venueZones,
    });

    expect(result.candidates).toHaveLength(1);
    expect(result.candidates[0].transferMinutes).toBe(24); // kata→old_town
  });

  // 2. Pickup-only product has unknown journey duration (no transfer)
  it('product without venue zone has null transfer (no median fallback)', () => {
    const exp = makeExp('exp_pickup', 'Private Island Boat Tour');
    const ctx = makeCtx('kata');
    // No venueZones entry for this product

    const result = rank([exp], ctx, {
      stayingZone: 'kata',
      date: '2026-08-20',
      venueZones: new Map(), // empty — no verified venues
    });

    expect(result.candidates).toHaveLength(1);
    expect(result.candidates[0].transferMinutes).toBeNull();
    // Must NOT have near_you or far_transfer reasons
    expect(result.candidates[0].reasons).not.toContain('near_you');
    expect(result.candidates[0].reasons).not.toContain('far_transfer');
    expect(result.candidates[0].reasons).not.toContain('far_for_its_length');
  });

  // 3. Unresolved venue gets no transfer (venueZones map won't contain it)
  it('unresolved venue is excluded from venueZones and gets null transfer', () => {
    const exp = makeExp('exp_unresolved', 'Mysterious Pier Departure');
    const ctx = makeCtx('kata');
    // Simulate: unresolved venue not in the verified map
    const venueZones = new Map<string, string>(); // not present

    const result = rank([exp], ctx, {
      stayingZone: 'kata',
      date: '2026-08-20',
      venueZones,
    });

    expect(result.candidates).toHaveLength(1);
    expect(result.candidates[0].transferMinutes).toBeNull();
  });

  // 4. Same-zone venue does NOT produce a fabricated zero-minute transfer
  it('same-zone venue does not get near_you or zero transfer', () => {
    const exp = makeExp('exp_same_zone', 'Kata Beach Cooking Class');
    const ctx = makeCtx('kata');
    const venueZones = new Map([['exp_same_zone', 'kata']]);

    const result = rank([exp], ctx, {
      stayingZone: 'kata',
      date: '2026-08-20',
      venueZones,
    });

    expect(result.candidates).toHaveLength(1);
    // Same-zone: transfer unknown (intra-zone distance varies)
    expect(result.candidates[0].transferMinutes).toBeNull();
    expect(result.candidates[0].reasons).not.toContain('near_you');
  });

  // 5. No median-based ranking: without venueZones, no transfer scoring at all
  it('ranking without venueZones applies no transfer penalties', () => {
    const near = makeExp('exp_near', 'Patong Show', { category: 'nightlife' });
    const far = makeExp('exp_far', 'Khao Lak Dive', { category: 'diving' });
    const ctx = makeCtx('kata');

    // With venueZones: patong is close, khao_lak is far
    const withVenues = rank([near, far], ctx, {
      stayingZone: 'kata',
      date: '2026-08-20',
      venueZones: new Map([['exp_near', 'patong'], ['exp_far', 'khao_lak']]),
    });
    const nearScore = withVenues.candidates.find((c) => c.experienceId === 'exp_near')!.score;
    const farScore = withVenues.candidates.find((c) => c.experienceId === 'exp_far')!.score;
    // Near should score higher due to transfer bonus
    expect(nearScore).toBeGreaterThan(farScore);

    // Without venueZones: both get same transfer treatment (none)
    const withoutVenues = rank([near, far], ctx, {
      stayingZone: 'kata',
      date: '2026-08-20',
      venueZones: new Map(),
    });
    const nearScore2 = withoutVenues.candidates.find((c) => c.experienceId === 'exp_near')!.score;
    const farScore2 = withoutVenues.candidates.find((c) => c.experienceId === 'exp_far')!.score;
    // Without venue info: scores equal (no transfer component)
    expect(nearScore2).toBe(farScore2);
  });

  // 6. Return-by does not assume zero transfer for unknown routes
  it('return_by with unknown transfer filters only on duration exceeding deadline', () => {
    // 4-hour activity, 6-hour window, unknown transfer
    const fits = makeExp('exp_fits', 'Half-Day Tour', { durationMinutes: 240 });
    // 7-hour activity, 6-hour window — too long even without transfer
    const tooLong = makeExp('exp_too_long', 'Full Day Safari', { durationMinutes: 420 });
    const ctx = makeCtx('kata');

    const result = rank([fits, tooLong], ctx, {
      stayingZone: 'kata',
      date: '2026-08-20',
      returnBy: '13:00', // morning slot (7:00) → 360 min available
      timeBucket: 'morning',
      venueZones: new Map(), // no venue info
    });

    // Half-day (240 min) fits in 360 min window
    expect(result.candidates.some((c) => c.experienceId === 'exp_fits')).toBe(true);
    // Full-day (420 min) exceeds 360 min window even without transfer
    expect(result.filtered.some((f) => f.id === 'exp_too_long' && f.reason === 'exceeds_return_deadline')).toBe(true);
  });

  // 7. Return-by with known transfer accounts for round-trip
  it('return_by with known transfer filters on duration + round-trip', () => {
    // 4-hour activity + 83 min each way (166 min round trip) = 406 min total
    // Available: 360 min — should be filtered
    const exp = makeExp('exp_far_deadline', 'Khao Lak Day Trip', { durationMinutes: 240 });
    const ctx = makeCtx('kata');

    const result = rank([exp], ctx, {
      stayingZone: 'kata',
      date: '2026-08-20',
      returnBy: '13:00',
      timeBucket: 'morning',
      venueZones: new Map([['exp_far_deadline', 'khao_lak']]),
    });

    // Should be filtered: 240 + 2*83 = 406 > 360
    expect(result.filtered.some((f) => f.id === 'exp_far_deadline' && f.reason === 'exceeds_return_deadline')).toBe(true);
  });

  // 8. Verification gating: far venue gets penalty, same product unverified does not
  it('far verified venue gets transfer penalty, unverified same product does not', () => {
    // Short activity (60 min) + long transfer (83 min to khao_lak) → ratio > 1 → penalty
    const exp = makeExp('exp_gated', 'Short Khao Lak Activity', { durationMinutes: 60 });
    const ctx = makeCtx('kata');

    // With verified venue mapping (khao_lak = 83 min from kata)
    const withVenue = rank([exp], ctx, {
      stayingZone: 'kata',
      date: '2026-08-20',
      venueZones: new Map([['exp_gated', 'khao_lak']]),
    });

    // Without (simulating unverified venue not in map)
    const withoutVenue = rank([exp], ctx, {
      stayingZone: 'kata',
      date: '2026-08-20',
      venueZones: new Map(),
    });

    // With venue: has transfer minutes and far_for_its_length penalty
    expect(withVenue.candidates[0].transferMinutes).toBe(83);
    expect(withVenue.candidates[0].reasons).toContain('far_for_its_length');
    // Without: null transfer, no penalty
    expect(withoutVenue.candidates[0].transferMinutes).toBeNull();
    expect(withoutVenue.candidates[0].reasons).not.toContain('far_for_its_length');
    // Scores differ due to penalty
    expect(withVenue.candidates[0].score).toBeLessThan(withoutVenue.candidates[0].score);
  });
});

// ── Safety filter: unconfirmed suitability ──

describe('Safety filter: unconfirmed suitability', () => {
  // N3: Unconfirmed pregnant_ok=true must not pass pregnant filter
  it('unconfirmed pregnant_ok=true is filtered when pregnant constraint active', () => {
    const exp = makeExp('exp_unconfirmed_preg', 'Private Catamaran Cruise', {
      attributes: [
        makeAttr('rain_viable', true),
        makeAttr('indoor', false),
        makeAttr('water_exposure', 'coastal'),
        makeAttr('vessel_type', 'catamaran'),
        makeAttr('mobility', 'moderate'),
        makeAttr('non_swimmer_ok', true, 'safety'),
        makeAttr('pregnant_ok', true, 'safety', 'unconfirmed'), // unconfirmed!
        makeAttr('seasickness_risk', 'low'),
        makeAttr('intensity', 'low'),
      ],
    });
    const ctx = makeCtx('patong');

    const result = rank([exp], ctx, {
      stayingZone: 'patong',
      date: '2026-08-20',
      requirePregnantOk: true,
    });

    // Must be filtered — unconfirmed true is not safe
    expect(result.candidates).toHaveLength(0);
    expect(result.filtered.some((f) => f.reason === 'pregnant_unconfirmed')).toBe(true);
  });

  // Confirmed pregnant_ok=true should pass
  it('confirmed pregnant_ok=true passes pregnant filter', () => {
    const exp = makeExp('exp_confirmed_preg', 'Cooking Class', {
      attributes: [
        makeAttr('rain_viable', true),
        makeAttr('indoor', true),
        makeAttr('water_exposure', 'none'),
        makeAttr('vessel_type', 'none'),
        makeAttr('mobility', 'moderate'),
        makeAttr('non_swimmer_ok', true, 'safety'),
        makeAttr('pregnant_ok', true, 'safety', 'confirmed'),
        makeAttr('seasickness_risk', 'none'),
        makeAttr('intensity', 'low'),
      ],
    });
    const ctx = makeCtx('patong');

    const result = rank([exp], ctx, {
      stayingZone: 'patong',
      date: '2026-08-20',
      requirePregnantOk: true,
    });

    expect(result.candidates).toHaveLength(1);
  });
});

// ── Pricing basis: budget filter ──

describe('Pricing basis: budget filter', () => {
  // 1. Expensive per-person product (ADULT+CHILD bands) — filtered by budget
  it('confirmed per-person product over budget is filtered', () => {
    const exp = makeExp('exp_expensive_pp', 'Premium Snorkeling Tour', {
      basePriceCents: 500000, // 5,000 THB per person
      attributes: [
        makeAttr('rain_viable', false),
        makeAttr('indoor', false),
        makeAttr('water_exposure', 'open_sea'),
        makeAttr('vessel_type', 'speedboat'),
        makeAttr('mobility', 'moderate'),
        makeAttr('non_swimmer_ok', true),
        makeAttr('pregnant_ok', true),
        makeAttr('seasickness_risk', 'moderate'),
        makeAttr('intensity', 'moderate'),
        makeAttr('viator.age_bands', [{ band: 'ADULT', startAge: 18, endAge: 99 }, { band: 'CHILD', startAge: 3, endAge: 17 }]),
      ],
    });
    const ctx = makeCtx('kata');

    const result = rank([exp], ctx, {
      stayingZone: 'kata',
      date: '2026-08-20',
      budgetCents: 200000, // 2,000 THB budget
    });

    expect(result.candidates).toHaveLength(0);
    expect(result.filtered.some((f) => f.reason === 'over_budget')).toBe(true);
  });

  // 2. Unknown-basis product excluded when budget is supplied (even if displayed price is under budget)
  it('unknown-basis product excluded when budget is supplied, even if price appears under budget', () => {
    const exp = makeExp('exp_cheap_traveler', 'Horror Escape Room', {
      basePriceCents: 100000, // 1,000 THB — looks under budget, but basis unknown
      attributes: [
        makeAttr('rain_viable', true),
        makeAttr('indoor', true),
        makeAttr('water_exposure', 'none'),
        makeAttr('vessel_type', 'none'),
        makeAttr('mobility', 'moderate'),
        makeAttr('non_swimmer_ok', true),
        makeAttr('pregnant_ok', false),
        makeAttr('seasickness_risk', 'none'),
        makeAttr('intensity', 'moderate'),
        makeAttr('viator.age_bands', [{ band: 'TRAVELER', startAge: 0, endAge: 120 }]),
      ],
    });
    const ctx = makeCtx('kata');

    const result = rank([exp], ctx, {
      stayingZone: 'kata',
      date: '2026-08-20',
      budgetCents: 200000, // 2,000 THB budget — price is under, but basis is unknown
    });

    expect(result.candidates).toHaveLength(0);
    expect(result.filtered.some((f) => f.reason === 'unknown_pricing_basis')).toBe(true);
  });

  // 3. Expensive unknown-basis product also excluded
  it('expensive unknown-basis product excluded when budget supplied', () => {
    const exp = makeExp('exp_traveler_band', 'Private Yacht Charter', {
      basePriceCents: 5000000, // 50,000 THB
      attributes: [
        makeAttr('rain_viable', true),
        makeAttr('indoor', false),
        makeAttr('water_exposure', 'coastal'),
        makeAttr('vessel_type', 'catamaran'),
        makeAttr('mobility', 'moderate'),
        makeAttr('non_swimmer_ok', true),
        makeAttr('pregnant_ok', false),
        makeAttr('seasickness_risk', 'low'),
        makeAttr('intensity', 'low'),
        makeAttr('viator.age_bands', [{ band: 'TRAVELER', startAge: 0, endAge: 120 }]),
      ],
    });
    const ctx = makeCtx('kata');

    const result = rank([exp], ctx, {
      stayingZone: 'kata',
      date: '2026-08-20',
      budgetCents: 200000,
    });

    expect(result.candidates).toHaveLength(0);
    expect(result.filtered.some((f) => f.reason === 'unknown_pricing_basis')).toBe(true);
  });

  // 4. Unknown-basis product included when no budget supplied
  it('unknown-basis product included when no budget is supplied', () => {
    const exp = makeExp('exp_traveler_no_budget', 'Private Yacht Charter', {
      basePriceCents: 5000000,
      attributes: [
        makeAttr('rain_viable', true),
        makeAttr('indoor', false),
        makeAttr('water_exposure', 'coastal'),
        makeAttr('vessel_type', 'catamaran'),
        makeAttr('mobility', 'moderate'),
        makeAttr('non_swimmer_ok', true),
        makeAttr('pregnant_ok', false),
        makeAttr('seasickness_risk', 'low'),
        makeAttr('intensity', 'low'),
        makeAttr('viator.age_bands', [{ band: 'TRAVELER', startAge: 0, endAge: 120 }]),
      ],
    });
    const ctx = makeCtx('kata');

    const result = rank([exp], ctx, {
      stayingZone: 'kata',
      date: '2026-08-20',
      // no budgetCents
    });

    expect(result.candidates).toHaveLength(1);
  });

  // 5. Per-person product under budget passes
  it('confirmed per-person product under budget passes', () => {
    const exp = makeExp('exp_cheap_pp', 'Muay Thai Class', {
      basePriceCents: 50000, // 500 THB per person
      attributes: [
        makeAttr('rain_viable', true),
        makeAttr('indoor', true),
        makeAttr('water_exposure', 'none'),
        makeAttr('vessel_type', 'none'),
        makeAttr('mobility', 'moderate'),
        makeAttr('non_swimmer_ok', true),
        makeAttr('pregnant_ok', false),
        makeAttr('seasickness_risk', 'none'),
        makeAttr('intensity', 'high'),
        makeAttr('viator.age_bands', [{ band: 'ADULT', startAge: 13, endAge: 99 }]),
      ],
    });
    const ctx = makeCtx('kata');

    const result = rank([exp], ctx, {
      stayingZone: 'kata',
      date: '2026-08-20',
      budgetCents: 200000, // 2,000 THB budget
    });

    expect(result.candidates).toHaveLength(1);
  });
});
