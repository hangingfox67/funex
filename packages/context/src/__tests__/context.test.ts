import { describe, it, expect, afterEach } from 'vitest';
import { context, resetContextCache } from '../context.js';
import { resolveSeason } from '../season.js';
import { buildTravelMatrix, getTransfer } from '../travel.js';

describe('context (A4)', () => {
  afterEach(() => {
    resetContextCache();
  });

  it('context("phuket","kata","2026-08-20") returns all four components', async () => {
    const ctx = await context('phuket', 'kata', '2026-08-20');

    // Weather
    expect(ctx.weather).toBeDefined();
    expect(ctx.weather.basis).toBe('forecast');
    expect(ctx.weather.as_of).toBeTruthy();
    expect(ctx.weather.zone).toBe('kata');
    expect(ctx.weather.temperature.min).toBeGreaterThan(0);
    expect(ctx.weather.temperature.max).toBeGreaterThan(0);

    // Sea state
    expect(ctx.seaState).toBeDefined();
    expect(ctx.seaState.basis).toBe('marine_forecast');
    expect(ctx.seaState.as_of).toBeTruthy();
    expect(ctx.seaState.zone).toBe('kata');
    expect(ctx.seaState.zone_exposed_to).toBe(240); // SW
    expect(['calm', 'moderate', 'rough']).toContain(ctx.seaState.classification);

    // Transfers
    expect(ctx.transfers.morning.length).toBeGreaterThan(0);
    expect(ctx.transfers.midday.length).toBeGreaterThan(0);
    expect(ctx.transfers.evening.length).toBeGreaterThan(0);
    // Check a specific transfer
    const toPatong = ctx.transfers.morning.find((t) => t.to_zone === 'patong');
    expect(toPatong).toBeDefined();
    expect(toPatong!.duration_minutes).toBeGreaterThan(0);
    expect(toPatong!.basis).toBeTruthy();

    // Season
    expect(ctx.season).toBeDefined();
    expect(ctx.season.season).toBe('low'); // August = low season
    expect(ctx.season.basis).toBe('config');
  }, 15000); // API timeout

  it('sea state uses exposed_to direction from phuket.yaml', async () => {
    const ctx = await context('phuket', 'panwa', '2026-08-20');

    // Panwa faces SE (135°) — sheltered from SW monsoon swell
    expect(ctx.seaState.zone_exposed_to).toBe(135);
    // With SW swell in August, Panwa should be calmer than west coast
  }, 15000);

  it('transfer times vary by time bucket (traffic factors)', async () => {
    const zones = [
      { slug: 'kata', lat: 7.8167, lng: 98.2983 },
      { slug: 'patong', lat: 7.8967, lng: 98.2967 },
    ];
    const factors = {
      kata: { morning: 1.0, midday: 1.1, evening: 1.4 },
      patong: { morning: 1.1, midday: 1.2, evening: 1.5 },
    };

    const matrix = await buildTravelMatrix(zones, factors);

    const morning = getTransfer(matrix, 'kata', 'patong', 'morning');
    const evening = getTransfer(matrix, 'kata', 'patong', 'evening');

    expect(morning).not.toBeNull();
    expect(evening).not.toBeNull();
    // Evening should be longer due to traffic factor
    expect(evening!.duration_minutes).toBeGreaterThanOrEqual(morning!.duration_minutes);
  });

  it('same-zone transfer is zero', async () => {
    const zones = [
      { slug: 'kata', lat: 7.8167, lng: 98.2983 },
      { slug: 'patong', lat: 7.8967, lng: 98.2967 },
    ];
    const matrix = await buildTravelMatrix(zones, {});
    const same = getTransfer(matrix, 'kata', 'kata', 'morning');
    expect(same).not.toBeNull();
    expect(same!.duration_minutes).toBe(0);
    expect(same!.distance_km).toBe(0);
  });

  it('matrix covers zones × zones × 3 buckets', async () => {
    const zones = [
      { slug: 'kata', lat: 7.8167, lng: 98.2983 },
      { slug: 'patong', lat: 7.8967, lng: 98.2967 },
      { slug: 'old_town', lat: 7.8833, lng: 98.3917 },
    ];
    const matrix = await buildTravelMatrix(zones, {});

    // 3 zones × 2 others × 3 buckets = 18 transfers
    expect(matrix.transfers.length).toBe(18);
    expect(matrix.zones).toEqual(['kata', 'patong', 'old_town']);
    expect(matrix.buckets).toEqual(['morning', 'midday', 'evening']);
  });
});

describe('season', () => {
  const config = {
    high: ['nov', 'dec', 'jan', 'feb', 'mar', 'apr'],
    shoulder: ['may', 'oct'],
    low: ['jun', 'jul', 'aug', 'sep'],
  };

  it('August = low season', () => {
    expect(resolveSeason('2026-08-20', config).season).toBe('low');
  });

  it('December = high season', () => {
    expect(resolveSeason('2026-12-25', config).season).toBe('high');
  });

  it('May = shoulder season', () => {
    expect(resolveSeason('2026-05-15', config).season).toBe('shoulder');
  });
});
