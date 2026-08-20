/**
 * Travel time matrix: zones × meeting points × 3 time buckets.
 *
 * ORS client: api.heigit.org (primary) → api.openrouteservice.org (legacy fallback).
 * ONE Matrix V2 request per rebuild (all zones batched). 500 matrix calls/month quota.
 *
 * Traffic factors from phuket.yaml multiply base durations per zone/bucket.
 */

// ORS is migrating api.openrouteservice.org → api.heigit.org.
// heigit matrix endpoint not yet live (404 as of 2026-08-20).
// Try heigit first; fall back to legacy ORS. Swap when heigit activates.
const ORS_BASE_PRIMARY = 'https://api.heigit.org/ors/v2/matrix/driving-car';
const ORS_BASE_LEGACY = 'https://api.openrouteservice.org/v2/matrix/driving-car';

export interface TransferTime {
  from_zone: string;
  to_zone: string;
  bucket: 'morning' | 'midday' | 'evening';
  duration_minutes: number;
  distance_km: number;
  basis: 'routed' | 'haversine_estimate';
  as_of: string;
}

export interface TravelMatrix {
  destination: string;
  zones: string[];
  buckets: ('morning' | 'midday' | 'evening')[];
  transfers: TransferTime[];
  basis: 'routed' | 'haversine_estimate';
  as_of: string;
}

interface ZoneCenter {
  slug: string;
  lat: number;
  lng: number;
}

interface TrafficFactors {
  [zone: string]: { morning: number; midday: number; evening: number };
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const BASE_SPEED_KMH = 30;

function estimateDuration(distKm: number, trafficFactor: number): number {
  return Math.round((distKm / BASE_SPEED_KMH) * 60 * trafficFactor);
}

async function tryOrsMatrix(
  url: string,
  apiKey: string,
  coords: number[][],
): Promise<{ durations: number[][]; distances: number[][]; quotaHeaders: Record<string, string> } | null> {
  try {
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        locations: coords,
        metrics: ['duration', 'distance'],
        units: 'km',
      }),
    });

    // Log quota-relevant headers
    const quotaHeaders: Record<string, string> = {};
    for (const key of ['x-ratelimit-limit', 'x-ratelimit-remaining', 'x-ratelimit-reset', 'x-quota-limit', 'x-quota-remaining']) {
      const val = resp.headers.get(key);
      if (val) quotaHeaders[key] = val;
    }
    if (Object.keys(quotaHeaders).length > 0) {
      console.log('  ORS quota:', JSON.stringify(quotaHeaders));
    }

    if (!resp.ok) {
      const body = await resp.text();
      console.warn(`  ORS ${url} returned ${resp.status}: ${body.substring(0, 200)}`);
      return null;
    }

    const data = await resp.json();
    return { durations: data.durations, distances: data.distances, quotaHeaders };
  } catch (err) {
    console.warn(`  ORS ${url} error: ${(err as Error).message}`);
    return null;
  }
}

/**
 * Build the travel matrix.
 * ONE batched Matrix V2 request for all zone pairs (quota-efficient).
 * Tries heigit.org first, then legacy ORS, then haversine fallback.
 */
export async function buildTravelMatrix(
  zones: ZoneCenter[],
  trafficFactors: TrafficFactors,
  orsApiKey?: string,
): Promise<TravelMatrix> {
  const buckets: ('morning' | 'midday' | 'evening')[] = ['morning', 'midday', 'evening'];
  const transfers: TransferTime[] = [];

  if (orsApiKey) {
    const coords = zones.map((z) => [z.lng, z.lat]); // ORS uses [lng, lat]
    console.log(`  ORS matrix: ${zones.length} zones, ${coords.length}×${coords.length} = 1 API call`);

    // Try primary (heigit.org), then legacy fallback
    let result = await tryOrsMatrix(ORS_BASE_PRIMARY, orsApiKey, coords);
    if (!result) {
      console.log('  Falling back to legacy api.openrouteservice.org...');
      result = await tryOrsMatrix(ORS_BASE_LEGACY, orsApiKey, coords);
    }

    if (result) {
      for (let i = 0; i < zones.length; i++) {
        for (let j = 0; j < zones.length; j++) {
          if (i === j) continue;
          const baseDurationMin = Math.round(result.durations[i][j] / 60);
          const distKm = Math.round(result.distances[i][j] * 10) / 10;

          for (const bucket of buckets) {
            const factor = trafficFactors[zones[j].slug]?.[bucket] ?? 1.0;
            transfers.push({
              from_zone: zones[i].slug,
              to_zone: zones[j].slug,
              bucket,
              duration_minutes: Math.round(baseDurationMin * factor),
              distance_km: distKm,
              basis: 'routed',
              as_of: new Date().toISOString(),
            });
          }
        }
      }

      return {
        destination: 'phuket',
        zones: zones.map((z) => z.slug),
        buckets,
        transfers,
        basis: 'routed',
        as_of: new Date().toISOString(),
      };
    }

    console.warn('  Both ORS endpoints failed, falling back to haversine');
  }

  // Haversine fallback
  for (let i = 0; i < zones.length; i++) {
    for (let j = 0; j < zones.length; j++) {
      if (i === j) continue;
      const dist = Math.round(haversineKm(zones[i].lat, zones[i].lng, zones[j].lat, zones[j].lng) * 10) / 10;

      for (const bucket of buckets) {
        const factor = trafficFactors[zones[j].slug]?.[bucket] ?? 1.0;
        transfers.push({
          from_zone: zones[i].slug,
          to_zone: zones[j].slug,
          bucket,
          duration_minutes: estimateDuration(dist, factor),
          distance_km: dist,
          basis: 'haversine_estimate',
          as_of: new Date().toISOString(),
        });
      }
    }
  }

  return {
    destination: 'phuket',
    zones: zones.map((z) => z.slug),
    buckets,
    transfers,
    basis: 'haversine_estimate',
    as_of: new Date().toISOString(),
  };
}

/** Look up a single transfer from the matrix. */
export function getTransfer(
  matrix: TravelMatrix,
  fromZone: string,
  toZone: string,
  bucket: 'morning' | 'midday' | 'evening',
): TransferTime | null {
  if (fromZone === toZone) {
    return {
      from_zone: fromZone, to_zone: toZone, bucket,
      duration_minutes: 0, distance_km: 0,
      basis: matrix.basis, as_of: matrix.as_of,
    };
  }
  return matrix.transfers.find(
    (t) => t.from_zone === fromZone && t.to_zone === toZone && t.bucket === bucket,
  ) ?? null;
}
