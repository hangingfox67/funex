/**
 * Season context from phuket.yaml.
 */

const MONTH_MAP: Record<string, number> = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
};

export interface SeasonContext {
  season: 'high' | 'shoulder' | 'low';
  label: string;
  basis: 'config';
  as_of: string;
}

export function resolveSeason(
  date: string,
  seasonConfig: { high: string[]; shoulder: string[]; low: string[] },
): SeasonContext {
  const month = new Date(date).getMonth() + 1; // 1-indexed
  const monthAbbrs = Object.entries(MONTH_MAP);

  for (const [name, months] of Object.entries(seasonConfig) as [string, string[]][]) {
    const monthNums = months.map((m) => MONTH_MAP[m]).filter(Boolean);
    if (monthNums.includes(month)) {
      return {
        season: name as 'high' | 'shoulder' | 'low',
        label: `${name} season (${months.join(', ')})`,
        basis: 'config',
        as_of: new Date().toISOString(),
      };
    }
  }

  return { season: 'low', label: 'unknown season', basis: 'config', as_of: new Date().toISOString() };
}
