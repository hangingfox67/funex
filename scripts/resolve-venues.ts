/**
 * Batch venue resolution for enriched products.
 *
 * 1. Pull logistics from Viator product detail for all enriched products without venues
 * 2. Collect unique location refs
 * 3. Resolve via /locations/bulk (batched, max 100 per call)
 * 4. Create venue records + product_venue links
 * 5. Report coverage
 *
 * Idempotent — skips products that already have venue links.
 * Rate limited at ~1.4 req/s for product detail, /locations/bulk is one batched call.
 */
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
config({ path: resolve(dirname(fileURLToPath(import.meta.url)), '..', '.env'), override: true });

import crypto from 'node:crypto';
import postgres from 'postgres';

const client = postgres(process.env.DATABASE_URL ?? 'postgresql://funex:funex@localhost:5432/funex');
const apiKey = process.env.VIATOR_API_KEY!;
const API_BASE = 'https://api.viator.com/partner';

// Zone centers for nearest-zone assignment
const ZONES: { slug: string; lat: number; lng: number }[] = [
  { slug: 'kata', lat: 7.8167, lng: 98.2983 },
  { slug: 'karon', lat: 7.8467, lng: 98.2933 },
  { slug: 'patong', lat: 7.8967, lng: 98.2967 },
  { slug: 'kamala', lat: 7.9550, lng: 98.2817 },
  { slug: 'bang_tao', lat: 7.9867, lng: 98.2917 },
  { slug: 'rawai', lat: 7.7750, lng: 98.3367 },
  { slug: 'panwa', lat: 7.8067, lng: 98.3983 },
  { slug: 'old_town', lat: 7.8833, lng: 98.3917 },
  { slug: 'mai_khao', lat: 8.0700, lng: 98.3017 },
  { slug: 'airport', lat: 8.1117, lng: 98.3117 },
  { slug: 'natai', lat: 8.2200, lng: 98.2733 },
  { slug: 'khao_lak', lat: 8.6300, lng: 98.2450 },
  { slug: 'ko_yao', lat: 8.0700, lng: 98.5800 },
];

function nearestZone(lat: number, lng: number): string {
  let best = 'patong';
  let bestDist = Infinity;
  for (const z of ZONES) {
    const d = Math.sqrt((lat - z.lat) ** 2 + (lng - z.lng) ** 2);
    if (d < bestDist) { bestDist = d; best = z.slug; }
  }
  return best;
}

function venueId(name: string, ref: string): string {
  const hash = crypto.createHash('md5').update(ref || name).digest('hex').substring(0, 12);
  return `v_${hash}`;
}

interface ProductLogistics {
  expId: string;
  title: string;
  startRef: string | null;
  startDesc: string;
  pickupType: string;
}

async function main() {
  // Get enriched products without venue links
  const products = await client`
    SELECT pm.experience_id, pm.provider_product_id as code, e.title
    FROM provider_mapping pm
    JOIN experience e ON e.id = pm.experience_id
    WHERE pm.experience_id NOT LIKE 'exp_phuket_%'
      AND pm.experience_id IN (
        SELECT DISTINCT experience_id FROM attribute
        WHERE experience_id NOT LIKE 'exp_phuket_%'
          AND key NOT LIKE 'viator.%' AND key != 'activity_tags' AND key != 'min_travelers_per_booking'
      )
      AND pm.experience_id NOT IN (SELECT experience_id FROM product_venue)
    ORDER BY pm.experience_id
  `;

  console.log(`Resolving venues for ${products.length} enriched products...\n`);

  // Phase 1: Pull logistics from product detail
  const logistics: ProductLogistics[] = [];
  const allRefs = new Map<string, { names: string[]; descs: string[] }>();
  let pulled = 0;

  for (const p of products) {
    try {
      const resp = await fetch(`${API_BASE}/products/${p.code}`, {
        headers: { 'exp-api-key': apiKey, 'Accept': 'application/json;version=2.0', 'Accept-Language': 'en-US' },
      });
      if (!resp.ok) { pulled++; continue; }
      const d = await resp.json();

      const startRef = d.logistics?.start?.[0]?.location?.ref ?? null;
      const startDesc = d.logistics?.start?.[0]?.description ?? '';
      const pickupType = d.logistics?.travelerPickup?.pickupOptionType ?? 'unknown';

      logistics.push({ expId: p.experience_id as string, title: p.title as string, startRef, startDesc, pickupType });

      if (startRef) {
        if (!allRefs.has(startRef)) allRefs.set(startRef, { names: [], descs: [] });
        const entry = allRefs.get(startRef)!;
        entry.names.push(p.title as string);
        entry.descs.push(startDesc.substring(0, 150));
      }

      pulled++;
      if (pulled % 50 === 0) console.log(`  ${pulled}/${products.length} pulled...`);
      await new Promise((r) => setTimeout(r, 700));
    } catch { pulled++; }
  }

  console.log(`\nPulled logistics for ${pulled} products. Unique refs: ${allRefs.size}`);

  // Phase 2: Resolve refs via /locations/bulk (max 100 per call)
  const refs = [...allRefs.keys()];
  const resolved = new Map<string, { name: string; lat?: number; lng?: number; address?: string; provider: string; providerRef?: string }>();

  for (let i = 0; i < refs.length; i += 100) {
    const batch = refs.slice(i, i + 100);
    try {
      const resp = await fetch(`${API_BASE}/locations/bulk`, {
        method: 'POST',
        headers: { 'exp-api-key': apiKey, 'Accept': 'application/json;version=2.0', 'Accept-Language': 'en-US', 'Content-Type': 'application/json' },
        body: JSON.stringify({ locations: batch }),
      });
      if (!resp.ok) { console.error(`  /locations/bulk batch ${i} failed:`, resp.status); continue; }
      const data = await resp.json();

      for (const loc of data.locations) {
        resolved.set(loc.reference, {
          name: loc.name ?? 'Unknown',
          lat: loc.center?.latitude,
          lng: loc.center?.longitude,
          address: [loc.address?.street, loc.address?.administrativeArea, loc.address?.country].filter(Boolean).join(', '),
          provider: loc.provider ?? 'unknown',
          providerRef: loc.providerReference,
        });
      }
      console.log(`  Resolved batch ${i}-${i + batch.length}: ${data.locations.length} locations`);
      await new Promise((r) => setTimeout(r, 500));
    } catch (err) {
      console.error(`  /locations/bulk batch ${i} error:`, (err as Error).message);
    }
  }

  console.log(`\nResolved ${resolved.size} unique locations`);

  // Phase 3: Create venues + links
  let venuesCreated = 0;
  let linksCreated = 0;
  let noRef = 0;
  let noCoords = 0;
  let withCoords = 0;

  // First create venue records for resolved locations
  const venueMap = new Map<string, string>(); // ref → venue_id

  for (const [ref, loc] of resolved) {
    const vId = venueId(loc.name, ref);
    const zone = loc.lat && loc.lng ? nearestZone(loc.lat, loc.lng) : null;
    const precision = loc.lat && loc.lng ? 'exact_point' : (loc.address ? 'approximate_area' : 'unknown');
    const verification = loc.lat && loc.lng ? 'verified' : 'needs_review';
    const source = loc.provider === 'TRIPADVISOR' ? 'viator_tripadvisor' : 'viator_google';

    if (loc.lat) withCoords++;
    else noCoords++;

    await client`
      INSERT INTO venue (id, name, location_type, address, latitude, longitude, zone_slug, precision, verification, source, source_ref, evidence)
      VALUES (${vId}, ${loc.name}, 'venue', ${loc.address ?? null}, ${loc.lat ?? null}, ${loc.lng ?? null},
        ${zone}, ${precision}, ${verification}, ${source}, ${ref}, ${'Viator /locations/bulk ' + loc.provider})
      ON CONFLICT (id) DO UPDATE SET
        latitude = COALESCE(EXCLUDED.latitude, venue.latitude),
        longitude = COALESCE(EXCLUDED.longitude, venue.longitude),
        zone_slug = COALESCE(EXCLUDED.zone_slug, venue.zone_slug),
        last_checked = now()
    `;
    venueMap.set(ref, vId);
    venuesCreated++;
  }

  // Link products to venues
  for (const p of logistics) {
    if (!p.startRef) { noRef++; continue; }
    const vId = venueMap.get(p.startRef);
    if (!vId) continue;

    const relationship = p.pickupType === 'PICKUP_EVERYONE' ? 'pickup_area'
      : p.startDesc.toLowerCase().includes('pier') ? 'departure_pier'
      : 'activity_location';

    await client`
      INSERT INTO product_venue (experience_id, venue_id, relationship)
      VALUES (${p.expId}, ${vId}, ${relationship})
      ON CONFLICT DO NOTHING
    `;
    linksCreated++;
  }

  // Phase 4: Report
  const [totalVenues] = await client`SELECT count(*) as c FROM venue`;
  const [totalLinks] = await client`SELECT count(*) as c FROM product_venue`;
  const [withZone] = await client`SELECT count(DISTINCT experience_id) as c FROM product_venue pv JOIN venue v ON v.id = pv.venue_id WHERE v.zone_slug IS NOT NULL`;

  console.log(`\n=== VENUE RESOLUTION REPORT ===`);
  console.log(`Products processed: ${products.length}`);
  console.log(`Unique location refs: ${allRefs.size}`);
  console.log(`Resolved via /locations/bulk: ${resolved.size}`);
  console.log(`  With coordinates: ${withCoords}`);
  console.log(`  Without coordinates (Google Places ID only): ${noCoords}`);
  console.log(`Products without any location ref: ${noRef}`);
  console.log(`Venues created/updated: ${venuesCreated}`);
  console.log(`Product-venue links created: ${linksCreated}`);
  console.log(`Total venues in register: ${totalVenues.c}`);
  console.log(`Total product-venue links: ${totalLinks.c}`);
  console.log(`Products with venue zone (routable): ${withZone.c}`);

  await client.end();
}

main().catch((err) => { console.error(err); process.exit(1); });
