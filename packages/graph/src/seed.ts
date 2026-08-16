import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { parse as parseYaml } from 'yaml';
import { sql } from 'drizzle-orm';
import { db, client } from './connection.js';
import { destinations } from './schema.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..', '..', '..');

interface ZoneConfig {
  name: string;
  kind: string;
  center: [number, number];
  geometry: { type: string; coordinates: number[][][] };
}

interface DestinationConfig {
  name: string;
  country: string;
  currency: string;
  timezone: string;
  zones: Record<string, ZoneConfig>;
  env_variables: string[];
  season: unknown;
  query_seeds: string[];
  time_buckets: unknown;
  traffic_factors: Record<string, Record<string, number>>;
}

async function seed() {
  // ── Parse phuket.yaml ──
  console.log('Reading destinations/phuket.yaml...');
  const phuketRaw = readFileSync(
    resolve(repoRoot, 'destinations', 'phuket.yaml'),
    'utf-8',
  );
  const phuket: DestinationConfig = parseYaml(phuketRaw);
  console.log(`  destination: ${phuket.name} (${phuket.country})`);
  console.log(`  zones: ${Object.keys(phuket.zones).join(', ')}`);
  console.log(`  env_variables: ${phuket.env_variables.join(', ')}`);

  // ── Parse attributes.v1.yaml ──
  console.log('\nReading ontology/attributes.v1.yaml...');
  const ontologyRaw = readFileSync(
    resolve(repoRoot, 'ontology', 'attributes.v1.yaml'),
    'utf-8',
  );
  const ontology = parseYaml(ontologyRaw);
  const attrKeys = Object.keys(ontology.attributes);
  const safetyAttrs = attrKeys.filter(
    (k) => ontology.attributes[k].risk_class === 'safety',
  );
  console.log(
    `  v${ontology.version}: ${attrKeys.length} attributes (${safetyAttrs.length} safety-class)`,
  );

  // ── Seed destination ──
  console.log('\nSeeding destination...');
  await db
    .insert(destinations)
    .values({
      slug: phuket.name,
      name: phuket.name.charAt(0).toUpperCase() + phuket.name.slice(1),
      country: phuket.country,
      currency: phuket.currency,
      timezone: phuket.timezone,
      configRef: 'destinations/phuket.yaml',
    })
    .onConflictDoUpdate({
      target: destinations.slug,
      set: {
        name: 'Phuket',
        country: phuket.country,
        currency: phuket.currency,
        timezone: phuket.timezone,
        configRef: 'destinations/phuket.yaml',
      },
    });

  // ── Seed zones with PostGIS geometry ──
  console.log('Seeding zones...');
  for (const [slug, zone] of Object.entries(phuket.zones)) {
    const geojson = JSON.stringify(zone.geometry);
    const center = JSON.stringify({ lng: zone.center[0], lat: zone.center[1] });

    await db.execute(sql`
      INSERT INTO zone (slug, destination_slug, name, kind, center, geometry)
      VALUES (
        ${slug},
        ${phuket.name},
        ${zone.name},
        ${zone.kind},
        ${center}::jsonb,
        ST_GeomFromGeoJSON(${geojson})
      )
      ON CONFLICT (destination_slug, slug) DO UPDATE SET
        name = EXCLUDED.name,
        kind = EXCLUDED.kind,
        center = EXCLUDED.center,
        geometry = EXCLUDED.geometry
    `);
  }

  // ── Verify ──
  const rows = await db.execute(sql`
    SELECT slug, name, kind,
           ST_AsText(geometry) AS geom_wkt,
           ST_Area(geometry::geography) AS area_m2
    FROM zone
    WHERE destination_slug = 'phuket'
    ORDER BY slug
  `);

  console.log('\nSeeded zones:');
  for (const row of rows) {
    const wkt = String(row.geom_wkt).slice(0, 50);
    const areaSqKm = (Number(row.area_m2) / 1e6).toFixed(1);
    console.log(`  ${row.slug} (${row.kind}) — ${areaSqKm} km² — ${wkt}...`);
  }

  console.log('\nSeed complete.');
  await client.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
