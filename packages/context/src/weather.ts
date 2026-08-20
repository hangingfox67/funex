/**
 * Weather context via Open-Meteo forecast API (no key needed).
 * Returns daily summary + hourly precipitation aggregated to
 * morning/midday/evening buckets for slot-aware rain filtering.
 */

export interface RainBucket {
  slot: 'morning' | 'midday' | 'evening';
  probability: number;  // max probability in this slot
  total_mm: number;     // sum of precipitation in this slot
  rainy: boolean;       // probability >= 60%
}

export interface WeatherForecast {
  date: string;
  zone: string;
  temperature: { min: number; max: number; unit: 'celsius' };
  precipitation: { probability: number; total_mm: number };
  rain_buckets: RainBucket[];
  wind: { speed_kmh: number; gusts_kmh: number; direction: number };
  uv_index_max: number;
  summary: string;
  basis: 'forecast';
  as_of: string;
}

// Slot definitions (local time hours)
const SLOTS: { name: 'morning' | 'midday' | 'evening'; startHour: number; endHour: number }[] = [
  { name: 'morning', startHour: 7, endHour: 11 },
  { name: 'midday', startHour: 11, endHour: 16 },
  { name: 'evening', startHour: 16, endHour: 21 },
];

export async function fetchWeather(
  lat: number,
  lng: number,
  date: string,
  zone: string,
): Promise<WeatherForecast> {
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', String(lat));
  url.searchParams.set('longitude', String(lng));
  url.searchParams.set('daily', 'temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,uv_index_max,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant');
  url.searchParams.set('hourly', 'precipitation_probability,precipitation');
  url.searchParams.set('timezone', 'Asia/Bangkok');
  url.searchParams.set('start_date', date);
  url.searchParams.set('end_date', date);

  const resp = await fetch(url.toString());
  if (!resp.ok) {
    throw new Error(`Open-Meteo weather error ${resp.status}: ${await resp.text()}`);
  }

  const data = await resp.json();
  const d = data.daily;
  const h = data.hourly;

  const tempMax = d.temperature_2m_max?.[0] ?? 0;
  const tempMin = d.temperature_2m_min?.[0] ?? 0;
  const precipMm = d.precipitation_sum?.[0] ?? 0;
  const precipProb = d.precipitation_probability_max?.[0] ?? 0;
  const windSpeed = d.wind_speed_10m_max?.[0] ?? 0;
  const windGusts = d.wind_gusts_10m_max?.[0] ?? 0;
  const windDir = d.wind_direction_10m_dominant?.[0] ?? 0;
  const uvMax = d.uv_index_max?.[0] ?? 0;

  // Aggregate hourly data into morning/midday/evening buckets
  const hourlyProb: number[] = h?.precipitation_probability ?? [];
  const hourlyPrecip: number[] = h?.precipitation ?? [];
  const rainBuckets: RainBucket[] = SLOTS.map((slot) => {
    let maxProb = 0;
    let totalMm = 0;
    for (let hr = slot.startHour; hr < slot.endHour; hr++) {
      if (hr < hourlyProb.length) maxProb = Math.max(maxProb, hourlyProb[hr]);
      if (hr < hourlyPrecip.length) totalMm += hourlyPrecip[hr];
    }
    return {
      slot: slot.name,
      probability: maxProb,
      total_mm: Math.round(totalMm * 10) / 10,
      rainy: maxProb >= 60,
    };
  });

  // Build summary
  const rainySlots = rainBuckets.filter((b) => b.rainy).map((b) => b.slot);
  let summary = '';
  if (rainySlots.length === 3) summary = `Rain all day (${precipMm}mm). `;
  else if (rainySlots.length > 0) summary = `Rain ${rainySlots.join(' + ')} (${precipMm}mm). `;
  else if (precipProb >= 40) summary = `Chance of rain (${precipProb}%). `;
  else summary = 'Mostly dry. ';

  if (windSpeed > 40) summary += `Strong wind ${windSpeed}km/h. `;
  else if (windSpeed > 25) summary += `Breezy ${windSpeed}km/h. `;
  if (uvMax >= 8) summary += `Very high UV (${uvMax}). `;
  summary += `${tempMin}–${tempMax}°C.`;

  return {
    date,
    zone,
    temperature: { min: tempMin, max: tempMax, unit: 'celsius' },
    precipitation: { probability: precipProb, total_mm: precipMm },
    rain_buckets: rainBuckets,
    wind: { speed_kmh: windSpeed, gusts_kmh: windGusts, direction: windDir },
    uv_index_max: uvMax,
    summary: summary.trim(),
    basis: 'forecast',
    as_of: new Date().toISOString(),
  };
}
