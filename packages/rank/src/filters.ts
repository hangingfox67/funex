/**
 * Hard filters — experiences that fail these are excluded entirely.
 * Pure functions: no imports from router/connectors (Directive 8).
 */
import type { ExperienceRow } from './types.js';

export interface FilterContext {
  // Party constraints
  youngestAge?: number;
  requireNonSwimmerOk?: boolean;
  requirePregnantOk?: boolean;
  maxMobility?: 'limited' | 'moderate' | 'full';

  // Logistics
  budgetCents?: number;
  maxDurationMinutes?: number;
  maxTransferMinutes?: number;
  transferMinutes?: number; // pre-resolved for this experience

  // Environment
  requireRainViable?: boolean;
  isRainyDay?: boolean;

  // Past
  excludeIds?: Set<string>;
}

const MOBILITY_LEVEL = { limited: 0, moderate: 1, full: 2 } as const;

/** Returns null if passes, or a reason string if filtered out. */
export function applyHardFilters(exp: ExperienceRow, ctx: FilterContext): string | null {
  // Past activity exclusion
  if (ctx.excludeIds?.has(exp.id)) return 'already_done';

  // Budget
  if (ctx.budgetCents && exp.basePriceCents && exp.basePriceCents > ctx.budgetCents) {
    return 'over_budget';
  }

  // Duration
  if (ctx.maxDurationMinutes && exp.durationMinutes && exp.durationMinutes > ctx.maxDurationMinutes) {
    return 'too_long';
  }

  // Transfer time
  if (ctx.maxTransferMinutes && ctx.transferMinutes && ctx.transferMinutes > ctx.maxTransferMinutes) {
    return 'too_far';
  }

  // For enriched products, apply safety filters
  if (exp.enrichmentTier !== 'enriched') return null;

  const attrs = new Map(exp.attributes.map((a) => [a.key, a]));
  const val = (k: string) => attrs.get(k)?.value;
  const conf = (k: string) => attrs.get(k)?.confidence ?? 0;

  // Age floor: with_adult_from (booking constraint) and independent_from (safety)
  if (ctx.youngestAge !== undefined) {
    const waf = val('with_adult_from') as number | undefined;
    if (waf !== undefined && waf !== null && ctx.youngestAge < waf) {
      return `age_floor:${waf}`;
    }
    // booking_age_note also means booking constraint
    const bookingNote = val('booking_age_note') as string | undefined;
    if (bookingNote) {
      const match = bookingNote.match(/under (\d+)/);
      if (match && ctx.youngestAge < parseInt(match[1])) {
        return `booking_age_floor:${match[1]}`;
      }
    }
  }

  // Mobility: filter if activity requires MORE than party can handle
  if (ctx.maxMobility) {
    const mob = val('mobility') as string | undefined;
    if (mob && MOBILITY_LEVEL[mob as keyof typeof MOBILITY_LEVEL] !== undefined) {
      const required = MOBILITY_LEVEL[mob as keyof typeof MOBILITY_LEVEL];
      const partyMax = MOBILITY_LEVEL[ctx.maxMobility];
      if (required > partyMax) return `mobility:${mob}`;
    }
  }

  // Non-swimmer
  if (ctx.requireNonSwimmerOk) {
    const nsOk = val('non_swimmer_ok');
    if (nsOk === false) return 'requires_swimming';
  }

  // Pregnant
  if (ctx.requirePregnantOk) {
    const pregOk = val('pregnant_ok');
    if (pregOk === false) return 'not_pregnant_safe';
  }

  // Rain viability
  if (ctx.requireRainViable || ctx.isRainyDay) {
    const rainOk = val('rain_viable');
    if (rainOk === false && ctx.isRainyDay) return 'not_rain_viable';
  }

  return null; // passes all filters
}
