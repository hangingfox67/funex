/**
 * Travel time matrix: zones × meeting points × 3 time buckets.
 *
 * Uses OpenRouteService when ORS_API_KEY is set, otherwise falls back
 * to Haversine distance × average speed estimate.
 *
 * Traffic factors from phuket.yaml multiply base durations per zone/bucket.
 */

export interface TransferTime {
  from_zone: string;
  to_zone: string;
  bucket: 'morning' | 'midday' | 'evening';
  duration_minutes: number;
  distance_km: number;
  basis: 'matrix' | 'haversine_estimate';
  as_of: string;
}

export interface TravelMatrix {
  destination: string;
  zones: string[];
  buckets: ('morning' | 'midday' | 'evening')[];
  transfers: TransferTime[];
  basis: 'matrix' | 'haversine_estimate';
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

// Phuket average road speed: ~30 km/h (hilly, winding, congested)
const BASE_SPEED_KMH = 30;

function estimateDuration(distKm: number, trafficFactor: number): number {
  return Math.round((distKm / BASE_SPEED_KMH) * 60 * trafficFactor);
}

/**
 * Build the travel matrix using ORS or haversine fallback.
 */
export async function buildTravelMatrix(
  zones: ZoneCenter[],
  trafficFactors: TrafficFactors,
  orsApiKey?: string,
): Promise<TravelMatrix> {
  const buckets: ('morning' | 'midday' | 'evening')[] = ['morning', 'midday', 'evening'];
  const transfers: TransferTime[] = [];
  let basis: 'matrix' | 'haversine_estimate' = 'haversine_estimate';

  if (orsApiKey) {
    // ORS duration matrix
    try {
      const coords = zones.map((z) => [z.lng, z.lat]); // ORS uses [lng, lat]
      const resp = await fetch('https://api.openrouteservice.org/v2/matrix/driving-car', {
        method: 'POST',
        headers: {
          'Authorization': orsApiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          locations: coords,
          metrics: ['duration', 'distance'],
          units: 'km',
        }),
      });

      if (resp.ok) {
        const data = await resp.json();
        basis = 'matrix';

        for (let i = 0; i < zones.length; i++) {
          for (let j = 0; j < zones.length; j++) {
            if (i === j) continue;
            const baseDurationMin = Math.round(data.durations[i][j] / 60);
            const distKm = Math.round(data.distances[i][j] * 10) / 10;

            for (const bucket of buckets) {
              // Apply traffic factor for destination zone
              const factor = trafficFactors[zones[j].slug]?.[bucket] ?? 1.0;
              transfers.push({
                from_zone: zones[i].slug,
                to_zone: zones[j].slug,
                bucket,
                duration_minutes: Math.round(baseDurationMin * factor),
                distance_km: distKm,
                basis: 'matrix',
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
          basis,
          as_of: new Date().toISOString(),
        };
      }
      console.warn('ORS matrix request failed, falling back to haversine');
    } catch (err) {
      console.warn('ORS unavailable, falling back to haversine:', (err as Error).message);
    }
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
    basis,
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
