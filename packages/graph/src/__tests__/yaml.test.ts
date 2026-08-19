import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { parse as parseYaml } from 'yaml';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..', '..', '..', '..');

describe('phuket.yaml', () => {
  const raw = readFileSync(
    resolve(repoRoot, 'destinations', 'phuket.yaml'),
    'utf-8',
  );
  const config = parseYaml(raw);

  it('has required top-level fields', () => {
    expect(config.name).toBe('phuket');
    expect(config.country).toBe('th');
    expect(config.currency).toBe('THB');
    expect(config.timezone).toBe('Asia/Bangkok');
    expect(config.env_variables).toContain('weather');
    expect(config.env_variables).toContain('marine');
  });

  it('defines 7 zones with valid geometry', () => {
    const zoneKeys = Object.keys(config.zones);
    expect(zoneKeys).toHaveLength(7);
    expect(zoneKeys).toEqual(
      expect.arrayContaining([
        'kata', 'karon', 'patong', 'bang_tao', 'panwa', 'old_town', 'airport',
      ]),
    );

    for (const [, zone] of Object.entries(config.zones)) {
      const z = zone as Record<string, unknown>;
      expect(z.name).toBeTruthy();
      expect(z.kind).toBeTruthy();
      expect(z.center).toHaveLength(2);
      const geom = z.geometry as { type: string; coordinates: number[][][] };
      expect(geom.type).toBe('Polygon');
      expect(geom.coordinates).toHaveLength(1);
      // Closed polygon: first coord === last coord
      const ring = geom.coordinates[0];
      expect(ring.length).toBeGreaterThanOrEqual(4);
      expect(ring[0]).toEqual(ring[ring.length - 1]);
    }
  });

  it('has time_buckets and traffic_factors for every zone', () => {
    expect(config.time_buckets.morning).toBeDefined();
    expect(config.time_buckets.midday).toBeDefined();
    expect(config.time_buckets.evening).toBeDefined();

    for (const slug of Object.keys(config.zones)) {
      const tf = config.traffic_factors[slug];
      expect(tf, `missing traffic_factors for ${slug}`).toBeDefined();
      expect(tf.morning).toBeGreaterThanOrEqual(1.0);
      expect(tf.evening).toBeGreaterThanOrEqual(1.0);
    }
  });

  it('has season data', () => {
    expect(config.season.high).toContain('jan');
    expect(config.season.low).toContain('aug');
    expect(config.season.holidays.length).toBeGreaterThan(0);
  });
});

describe('attributes.v2.yaml', () => {
  const raw = readFileSync(
    resolve(repoRoot, 'ontology', 'attributes.v2.yaml'),
    'utf-8',
  );
  const ontology = parseYaml(raw);

  it('has version 2', () => {
    expect(ontology.version).toBe(2);
  });

  it('defines core attributes', () => {
    const keys = Object.keys(ontology.attributes);
    for (const expected of [
      'stated_min_age', 'with_adult_from', 'independent_from',
      'mobility', 'intensity', 'seasickness_risk',
      'indoor', 'rain_viable', 'non_swimmer_ok', 'group_type',
      'partial_participation_ok', 'vessel_type', 'water_exposure',
      'wheelchair_access', 'access_constraint', 'confirm_at_booking',
      'seasonal_closure',
    ]) {
      expect(keys, `missing attribute: ${expected}`).toContain(expected);
    }
  });

  it('replaces min_age with three age fields', () => {
    const keys = Object.keys(ontology.attributes);
    expect(keys).not.toContain('min_age');
    expect(keys).toContain('stated_min_age');
    expect(keys).toContain('with_adult_from');
    expect(keys).toContain('independent_from');
  });

  it('stated_min_age has textual_only constraint', () => {
    const attr = ontology.attributes.stated_min_age as Record<string, unknown>;
    expect(attr.inference_basis_constraint).toBe('textual_only');
  });

  it('wheelchair_access is enum with unknown option', () => {
    const attr = ontology.attributes.wheelchair_access as Record<string, unknown>;
    expect(attr.type).toBe('enum');
    expect(attr.values).toContain('unknown');
  });

  it('every attribute has type and risk_class', () => {
    for (const [key, attr] of Object.entries(ontology.attributes)) {
      const a = attr as Record<string, unknown>;
      expect(a.type, `${key} missing type`).toBeTruthy();
      expect(['info', 'safety']).toContain(a.risk_class);
    }
  });

  it('safety-class includes the expected keys', () => {
    const safetyKeys = Object.entries(ontology.attributes)
      .filter(([, a]) => (a as Record<string, unknown>).risk_class === 'safety')
      .map(([k]) => k);
    for (const expected of [
      'stated_min_age', 'independent_from', 'mobility',
      'non_swimmer_ok', 'seasickness_risk', 'wheelchair_access', 'pregnant_ok',
    ]) {
      expect(safetyKeys).toContain(expected);
    }
  });
});
