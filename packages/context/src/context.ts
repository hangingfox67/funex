/**
 * Unified context function.
 *
 * context("phuket", "kata", "2026-08-20") returns:
 *   - weather forecast
 *   - sea state (with swell-direction × zone exposure join)
 *   - transfer times from this zone to all others (3 buckets)
 *   - season
 * Each with basis and as_of.
 */
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { parse as parseYaml } from 'yaml';
import { fetchWeather, type WeatherForecast } from './weather.js';
import { fetchSeaState, type SeaState } from './marine.js';
import { buildTravelMatrix, getTransfer, type TravelMatrix, type TransferTime } from './travel.js';
import { resolveSeason, type SeasonContext } from './season.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..', '..', '..');

interface DestConfig {
  zones: Record<string, { center: [number, number]; name: string; kind: string }>;
  exposed_to: Record<string, { direction: number; label: string }>;
  season: { high: string[]; shoulder: string[]; low: string[] };
  traffic_factors: Record<string, { morning: number; midday: number; evening: number }>;
}

let cachedConfig: Map<string, DestConfig> | null = null;

function loadConfig(destination: string): DestConfig {
  if (cachedConfig?.has(destination)) return cachedConfig.get(destination)!;
  const path = resolve(repoRoot, 'destinations', `${destination}.yaml`);
  const raw = readFileSync(path, 'utf-8');
  const parsed = parseYaml(raw) as DestConfig;
  if (!cachedConfig) cachedConfig = new Map();
  cachedConfig.set(destination, parsed);
  return parsed;
}

// Cached travel matrix (rebuilt at most once per session)
let cachedMatrix: TravelMatrix | null = null;

export interface ContextSnapshot {
  destination: string;
  zone: string;
  date: string;
  weather: WeatherForecast;
  seaState: SeaState;
  transfers: {
    morning: TransferTime[];
    midday: TransferTime[];
    evening: TransferTime[];
  };
  season: SeasonContext;
}

export async function context(
  destination: string,
  zone: string,
  date: string,
): Promise<ContextSnapshot> {
  const config = loadConfig(destination);
  const zoneConfig = config.zones[zone];
  if (!zoneConfig) throw new Error(`Unknown zone: ${zone} in ${destination}`);

  const [lng, lat] = zoneConfig.center;
  const exposedTo = config.exposed_to[zone]?.direction ?? 0;

  // Fetch weather + marine in parallel
  const [weather, seaState] = await Promise.all([
    fetchWeather(lat, lng, date, zone),
    fetchSeaState(lat, lng, date, zone, exposedTo),
  ]);

  // Build or reuse travel matrix
  if (!cachedMatrix) {
    const zoneCenters = Object.entries(config.zones).map(([slug, z]) => ({
      slug,
      lat: z.center[1],
      lng: z.center[0],
    }));
    cachedMatrix = await buildTravelMatrix(
      zoneCenters,
      config.traffic_factors,
      process.env.ORS_API_KEY,
    );
  }

  // Get transfers FROM this zone to all others
  const allZones = Object.keys(config.zones);
  const transfers = {
    morning: allZones.map((z) => getTransfer(cachedMatrix!, zone, z, 'morning')!).filter(Boolean),
    midday: allZones.map((z) => getTransfer(cachedMatrix!, zone, z, 'midday')!).filter(Boolean),
    evening: allZones.map((z) => getTransfer(cachedMatrix!, zone, z, 'evening')!).filter(Boolean),
  };

  const season = resolveSeason(date, config.season);

  return {
    destination,
    zone,
    date,
    weather,
    seaState,
    transfers,
    season,
  };
}

/** Reset cached matrix (for testing). */
export function resetContextCache(): void {
  cachedMatrix = null;
  cachedConfig = null;
}
