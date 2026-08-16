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

describe('attributes.v1.yaml', () => {
  const raw = readFileSync(
    resolve(repoRoot, 'ontology', 'attributes.v1.yaml'),
    'utf-8',
  );
  const ontology = parseYaml(raw);

  it('has version 1', () => {
    expect(ontology.version).toBe(1);
  });

  it('defines core attributes', () => {
    const keys = Object.keys(ontology.attributes);
    for (const expected of [
      'min_age', 'mobility', 'intensity', 'seasickness_risk',
      'indoor', 'rain_viable', 'non_swimmer_ok', 'group_type',
    ]) {
      expect(keys, `missing attribute: ${expected}`).toContain(expected);
    }
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
    for (const expected of ['min_age', 'mobility', 'non_swimmer_ok', 'seasickness_risk']) {
      expect(safetyKeys).toContain(expected);
    }
  });
});
