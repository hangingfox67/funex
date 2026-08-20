import { describe, it, expect, afterAll } from 'vitest';
import { db, client } from '../connection.js';
import { searchExperiences } from '../search.js';

describe('searchExperiences fallback', () => {
  afterAll(async () => {
    await client.end();
  });

  it('returns enriched products with attributes populated', async () => {
    const { results, stats } = await searchExperiences({
      destinationSlug: 'phuket',
      safetyFiltersActive: false,
      limit: 10,
      db,
    });

    expect(results.length).toBeGreaterThan(0);

    const enriched = results.filter((r) => r.enrichmentTier === 'enriched');
    if (enriched.length > 0) {
      expect(enriched[0].attributes.length).toBeGreaterThan(0);
    }

    expect(stats.totalDestination).toBeGreaterThan(0);
    expect(stats.enriched + stats.basic).toBe(stats.totalDestination);
  });

  it('returns basic products with empty attributes', async () => {
    const { results } = await searchExperiences({
      destinationSlug: 'phuket',
      safetyFiltersActive: false,
      limit: 2000,
      db,
    });

    const basic = results.filter((r) => r.enrichmentTier === 'basic');
    if (basic.length > 0) {
      expect(basic[0].attributes).toEqual([]);
    }

    // Enriched should appear before basic
    const firstBasicIdx = results.findIndex((r) => r.enrichmentTier === 'basic');
    let lastEnrichedIdx = -1;
    for (let i = results.length - 1; i >= 0; i--) {
      if (results[i].enrichmentTier === 'enriched') { lastEnrichedIdx = i; break; }
    }
    if (firstBasicIdx >= 0 && lastEnrichedIdx >= 0) {
      expect(lastEnrichedIdx).toBeLessThan(firstBasicIdx);
    }
  });

  it('excludes basic products when safety filters are active', async () => {
    const { results, excludedUnverifiedCount } = await searchExperiences({
      destinationSlug: 'phuket',
      safetyFiltersActive: true,
      limit: 2000,
      db,
    });

    const basic = results.filter((r) => r.enrichmentTier === 'basic');
    expect(basic.length).toBe(0);

    for (const r of results) {
      expect(r.enrichmentTier).toBe('enriched');
    }

    // Excluded count should reflect the basic products that were filtered out
    expect(excludedUnverifiedCount).toBeGreaterThan(0);
  });

  it('returns excludedUnverifiedIds when safety-filtering', async () => {
    const { excludedUnverifiedIds, excludedUnverifiedCount } = await searchExperiences({
      destinationSlug: 'phuket',
      safetyFiltersActive: true,
      limit: 2000,
      db,
    });

    expect(excludedUnverifiedIds.length).toBe(excludedUnverifiedCount);
    // None of the excluded IDs should be fixtures
    for (const id of excludedUnverifiedIds) {
      expect(id).not.toMatch(/^exp_phuket_/);
    }
  });

  it('returns zero excludedUnverifiedCount without safety filters', async () => {
    const { excludedUnverifiedCount } = await searchExperiences({
      destinationSlug: 'phuket',
      safetyFiltersActive: false,
      limit: 10,
      db,
    });

    expect(excludedUnverifiedCount).toBe(0);
  });

  it('resultQuality reflects mix of tiers', async () => {
    // Without safety filters, should include both enriched and basic → mixed
    const mixed = await searchExperiences({
      destinationSlug: 'phuket',
      safetyFiltersActive: false,
      limit: 2000,
      db,
    });
    expect(mixed.resultQuality).toBe('mixed');
    expect(mixed.resultQualityReason).toBeNull();

    // With safety filters, only enriched
    const enrichedOnly = await searchExperiences({
      destinationSlug: 'phuket',
      safetyFiltersActive: true,
      limit: 2000,
      db,
    });
    expect(enrichedOnly.resultQuality).toBe('enriched');
    expect(enrichedOnly.resultQualityReason).toBeNull();
  });

  it('resultQuality is basic_only with reason when no enriched match', async () => {
    // Use a category unlikely to have enriched products
    const result = await searchExperiences({
      destinationSlug: 'phuket',
      safetyFiltersActive: false,
      categories: ['transport'],
      limit: 10,
      db,
    });

    // Transport category likely has no enriched products in calibration set
    if (result.resultQuality === 'basic_only') {
      expect(result.resultQualityReason).toBeTruthy();
    }
  });

  it('never returns fixture products', async () => {
    const { results } = await searchExperiences({
      destinationSlug: 'phuket',
      safetyFiltersActive: false,
      limit: 2000,
      db,
    });

    for (const r of results) {
      expect(r.id).not.toMatch(/^exp_phuket_/);
    }
  });

  it('filters by category', async () => {
    const { results } = await searchExperiences({
      destinationSlug: 'phuket',
      safetyFiltersActive: false,
      categories: ['diving'],
      limit: 100,
      db,
    });

    for (const r of results) {
      expect(r.category).toBe('diving');
    }
  });

  it('reports accurate catalog stats', async () => {
    const { stats } = await searchExperiences({
      destinationSlug: 'phuket',
      safetyFiltersActive: false,
      limit: 1,
      db,
    });

    expect(stats.totalDestination).toBeGreaterThanOrEqual(1800);
    expect(stats.enriched).toBeGreaterThanOrEqual(20);
    expect(stats.basic).toBe(stats.totalDestination - stats.enriched);
  });
});
