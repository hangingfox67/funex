/**
 * Hard filters — experiences that fail these are excluded entirely.
 * Pure functions: no imports from router/connectors (Directive 8).
 */
import type { ExperienceRow } from './types.js';

export interface RainSlotInfo {
  morning: boolean;  // rainy in this slot?
  midday: boolean;
  evening: boolean;
}

export interface FilterContext {
  // Party constraints
  youngestAge?: number;
  partySize?: number;
  requireNonSwimmerOk?: boolean;
  requirePregnantOk?: boolean;
  maxMobility?: 'limited' | 'moderate' | 'full';

  // Logistics
  budgetCents?: number;
  maxDurationMinutes?: number;
  maxTransferMinutes?: number;
  transferMinutes?: number;

  // Environment — slot-aware rain
  rainSlots?: RainSlotInfo;
  requestSlot?: 'morning' | 'midday' | 'evening';

  // Intent
  activityIntent?: boolean;

  // Exclusions — activity_tags catch combos ("no ziplines" excludes ATV+zipline combos)
  excludeActivityTags?: Set<string>;

  // Past
  excludeIds?: Set<string>;
}

const MOBILITY_LEVEL = { limited: 0, moderate: 1, full: 2 } as const;

// Categories that are pure logistics, not activities
const LOGISTICS_CATEGORIES = new Set(['transport']);

/** Returns null if passes, or a reason string if filtered out. */
export function applyHardFilters(exp: ExperienceRow, ctx: FilterContext): string | null {
  // Past activity exclusion
  if (ctx.excludeIds?.has(exp.id)) return 'already_done';

  // Intent gate: transport excluded from activity-intent queries
  if (ctx.activityIntent && LOGISTICS_CATEGORIES.has(exp.category)) {
    return 'logistics_not_activity';
  }

  // Activity tag exclusion: catches combos (e.g. "no ziplines" excludes ATV+zipline)
  if (ctx.excludeActivityTags && ctx.excludeActivityTags.size > 0) {
    const tags = exp.attributes.find((a) => a.key === 'activity_tags');
    if (tags && Array.isArray(tags.value)) {
      for (const tag of tags.value as string[]) {
        if (ctx.excludeActivityTags.has(tag)) {
          return `excluded_tag:${tag}`;
        }
      }
    }
  }

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

  // For enriched products, apply safety + weather filters
  if (exp.enrichmentTier !== 'enriched') return null;

  const attrs = new Map(exp.attributes.map((a) => [a.key, a]));
  const val = (k: string) => attrs.get(k)?.value;

  // Age floor
  if (ctx.youngestAge !== undefined) {
    const waf = val('with_adult_from') as number | undefined;
    if (waf !== undefined && waf !== null && ctx.youngestAge < waf) {
      return `age_floor:${waf}`;
    }
    const bookingNote = val('booking_age_note') as string | undefined;
    if (bookingNote) {
      const match = bookingNote.match(/under (\d+)/);
      if (match && ctx.youngestAge < parseInt(match[1])) {
        return `booking_age_floor:${match[1]}`;
      }
    }
  }

  // Min travelers: solo/small party can't book products requiring 2+
  if (ctx.partySize !== undefined) {
    const minTravelers = val('min_travelers_per_booking') as number | undefined;
    if (minTravelers && ctx.partySize < minTravelers) {
      return `min_travelers:${minTravelers}`;
    }
  }

  // Mobility
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

  // Slot-aware rain filtering
  if (ctx.rainSlots) {
    const rainOk = val('rain_viable');
    const indoor = val('indoor');
    const isIndoor = indoor === true || rainOk === true;

    if (!isIndoor) {
      const allSlotsRainy = ctx.rainSlots.morning && ctx.rainSlots.midday && ctx.rainSlots.evening;

      if (allSlotsRainy) {
        // All-day rain: hard-filter outdoor non-rain-viable products
        return 'not_rain_viable';
      }
      // Slot-specific rain: handled as penalty in tiers, not hard filter
    }
  }

  return null;
}
