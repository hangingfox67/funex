/**
 * Marine context via Open-Meteo Marine API (no key needed).
 * Joins swell direction with zone exposed_to for per-zone sea state.
 */

export interface SeaState {
  date: string;
  zone: string;
  swell_height_m: number;
  swell_direction: number;
  swell_period_s: number;
  wave_height_m: number;
  zone_exposed_to: number;
  exposure_match: boolean;
  classification: 'calm' | 'moderate' | 'rough';
  summary: string;
  basis: 'marine_forecast';
  as_of: string;
}

/**
 * Check if zone is exposed to the incoming swell direction.
 * A zone is exposed if the swell comes within ±60° of its facing direction.
 */
function isExposed(zoneDirection: number, swellDirection: number): boolean {
  // Swell direction is where it comes FROM, zone direction is where it FACES
  // Zone faces 240° (SW), swell from 240° → direct hit
  let diff = Math.abs(zoneDirection - swellDirection);
  if (diff > 180) diff = 360 - diff;
  return diff <= 60;
}

function classifySea(
  waveHeight: number,
  swellHeight: number,
  exposed: boolean,
): 'calm' | 'moderate' | 'rough' {
  if (!exposed) return 'calm';
  const combined = Math.max(waveHeight, swellHeight);
  if (combined >= 2.0) return 'rough';
  if (combined >= 1.0) return 'moderate';
  return 'calm';
}

export async function fetchSeaState(
  lat: number,
  lng: number,
  date: string,
  zone: string,
  zoneExposedTo: number,
): Promise<SeaState> {
  const url = new URL('https://marine-api.open-meteo.com/v1/marine');
  url.searchParams.set('latitude', String(lat));
  url.searchParams.set('longitude', String(lng));
  url.searchParams.set('daily', 'wave_height_max,swell_wave_height_max,swell_wave_direction_dominant,swell_wave_period_max');
  url.searchParams.set('timezone', 'Asia/Bangkok');
  url.searchParams.set('start_date', date);
  url.searchParams.set('end_date', date);

  const resp = await fetch(url.toString());
  if (!resp.ok) {
    throw new Error(`Open-Meteo marine error ${resp.status}: ${await resp.text()}`);
  }

  const data = await resp.json();
  const d = data.daily;

  const waveHeight = d.wave_height_max?.[0] ?? 0;
  const swellHeight = d.swell_wave_height_max?.[0] ?? 0;
  const swellDir = d.swell_wave_direction_dominant?.[0] ?? 0;
  const swellPeriod = d.swell_wave_period_max?.[0] ?? 0;

  const exposed = isExposed(zoneExposedTo, swellDir);
  const classification = classifySea(waveHeight, swellHeight, exposed);

  let summary = `${classification} seas`;
  if (classification === 'rough') {
    summary = `Rough — swell ${swellHeight}m from ${swellDir}°, waves ${waveHeight}m. ${zone} directly exposed.`;
  } else if (classification === 'moderate') {
    summary = `Moderate — swell ${swellHeight}m, waves ${waveHeight}m. ${exposed ? 'Zone exposed.' : 'Zone sheltered.'}`;
  } else {
    summary = `Calm — ${exposed ? 'light swell' : 'sheltered from swell'}. Good for water activities.`;
  }

  return {
    date,
    zone,
    swell_height_m: swellHeight,
    swell_direction: swellDir,
    swell_period_s: swellPeriod,
    wave_height_m: waveHeight,
    zone_exposed_to: zoneExposedTo,
    exposure_match: exposed,
    classification,
    summary,
    basis: 'marine_forecast',
    as_of: new Date().toISOString(),
  };
}
