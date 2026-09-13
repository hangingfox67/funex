/**
 * Tier scoring: excellent / good / fair.
 * Reason codes for each candidate.
 */
import type { ExperienceRow, RankedCandidate } from './types.js';

export type Tier = 'excellent' | 'good' | 'fair';

export interface TierResult {
  tier: Tier;
  score: number;  // 0-100 for stable sorting
  reasons: string[];
}

const MOBILITY_LEVEL = { limited: 0, moderate: 1, full: 2 } as const;

// Slot time ranges for duration-based rain overlap
const SLOT_HOURS = { morning: { start: 7, end: 11 }, midday: { start: 11, end: 16 }, evening: { start: 16, end: 21 } };
const SLOT_ORDER: ('morning' | 'midday' | 'evening')[] = ['morning', 'midday', 'evening'];

/** Check which rain slots a product spans, given start slot and duration. */
function spannedRainSlots(
  startSlot: 'morning' | 'midday' | 'evening',
  durationMinutes: number | null,
  rainSlots: { morning: boolean; midday: boolean; evening: boolean },
): { spansRainy: boolean; rainySlotNames: string[] } {
  if (!durationMinutes) return { spansRainy: rainSlots[startSlot], rainySlotNames: rainSlots[startSlot] ? [startSlot] : [] };

  const startHour = SLOT_HOURS[startSlot].start;
  const endHour = startHour + durationMinutes / 60;
  const rainySlotNames: string[] = [];

  for (const slot of SLOT_ORDER) {
    const s = SLOT_HOURS[slot];
    // Activity overlaps this slot if [startHour, endHour) intersects [s.start, s.end)
    if (endHour > s.start && startHour < s.end && rainSlots[slot]) {
      rainySlotNames.push(slot);
    }
  }

  return { spansRainy: rainySlotNames.length > 0, rainySlotNames };
}

export function scoreTier(
  exp: ExperienceRow,
  opts: {
    seaClassification?: 'calm' | 'moderate' | 'rough';
    rainSlots?: { morning: boolean; midday: boolean; evening: boolean };
    requestSlot?: 'morning' | 'midday' | 'evening';
    season?: 'high' | 'shoulder' | 'low';
    transferMinutes?: number;
    transferDistanceKm?: number;
    budgetCents?: number;
    motionComfort?: 'low' | 'normal';
    partyEnergy?: 'low' | 'moderate' | 'high';
    youngestAge?: number;
  },
): TierResult {
  let score = 35; // baseline — calibrated so excellent requires multiple positive signals
  const reasons: string[] = [];
  let tierCapped: Tier | null = null;

  if (exp.enrichmentTier !== 'enriched') {
    return { tier: 'fair', score: 20, reasons: ['basic_tier'] };
  }

  const attrs = new Map(exp.attributes.map((a) => [a.key, a]));
  const val = (k: string) => attrs.get(k)?.value;
  const evidence = (k: string) => attrs.get(k)?.evidence ?? [];

  // ── Sea state fit ──
  // Only applies to marine activities (vessel_type≠none OR water_exposure≠none).
  // Land-based products get no marine bonus or penalty.
  if (opts.seaClassification === 'rough' || opts.seaClassification === 'moderate') {
    const waterExp = val('water_exposure') as string | undefined;
    const vesselType = val('vessel_type') as string | undefined;
    const isMarineActivity = (waterExp && waterExp !== 'none') || (vesselType && vesselType !== 'none');

    if (isMarineActivity) {
      const isRough = opts.seaClassification === 'rough';
      if (waterExp === 'open_sea') {
        score -= isRough ? 30 : 15;
        reasons.push('sea_state_risk');
      } else if (waterExp === 'sheltered_bay') {
        score += 10;
        reasons.push('sheltered_from_swell');
      }
    }
    // Land-based (water_exposure=none, vessel_type=none): no marine reason codes
  }

  // ── Motion comfort: penalize moderate seasickness for low-comfort travelers ──
  if (opts.motionComfort === 'low') {
    const seasick = val('seasickness_risk') as string | undefined;
    if (seasick === 'moderate') {
      score -= 10;
      reasons.push('motion_comfort_risk');
    }
    // high seasickness already hard-filtered; low/none are fine
    if (seasick === 'none' || seasick === 'low') {
      score += 5;
      reasons.push('smooth_ride');
    }
  }

  // ── Slot-aware rain fit (duration-aware) ──
  if (opts.rainSlots) {
    const rainOk = val('rain_viable');
    const indoor = val('indoor');
    const isIndoor = rainOk === true || indoor === true;
    const slot = opts.requestSlot ?? 'morning';
    const anyRainy = opts.rainSlots.morning || opts.rainSlots.midday || opts.rainSlots.evening;

    if (isIndoor) {
      if (anyRainy) { score += 15; reasons.push('rain_safe'); }
    } else {
      // Check if the activity's duration spans into rainy slots
      const { spansRainy, rainySlotNames } = spannedRainSlots(
        slot, exp.durationMinutes, opts.rainSlots,
      );

      if (spansRainy && rainySlotNames.length > 0) {
        // Does it also cover dry slots?
        const startSlotRainy = opts.rainSlots[slot];
        if (!startSlotRainy) {
          // Starts dry, extends into rain — partial penalty + note
          score -= 5;
          reasons.push('rain_risk_afternoon');
        } else {
          // Starts in rain
          score -= 15;
          reasons.push('rain_risk');
        }
      } else if (!opts.rainSlots[slot]) {
        // Outdoor, requested slot is dry, duration stays in dry slots
        score += 5;
        reasons.push('dry_window_match');
      }
    }
  }

  // ── Transfer penalty (always on, ratio-based) ──
  // transfer_time / activity_duration ratio: ≥1 = severe, ≥2 = tier-capped at fair
  if (opts.transferMinutes !== undefined) {
    if (opts.transferMinutes <= 15) {
      score += 10;
      reasons.push('near_you');
    } else {
      const duration = exp.durationMinutes ?? 180; // default 3h if unknown
      const ratio = opts.transferMinutes / duration;

      if (ratio >= 2) {
        // Transfer is 2× the activity — absurd, cap at fair
        score -= 30;
        reasons.push('far_for_its_length');
        tierCapped = 'fair';
      } else if (ratio >= 1) {
        // Transfer equals activity — severe penalty
        score -= 20;
        reasons.push('far_for_its_length');
      } else if (ratio >= 0.5) {
        // Transfer is half the activity — moderate penalty
        score -= 10;
        reasons.push('far_transfer');
      }
      // ratio < 0.5 = acceptable, no penalty

      // Budget transfer cost estimate (rough: 15 THB/km, min 200 THB per trip)
      if (opts.budgetCents && opts.transferDistanceKm) {
        const estTransferCostThb = Math.max(200, opts.transferDistanceKm * 15) * 2; // round trip
        const budgetThb = opts.budgetCents / 100;
        const costRatio = estTransferCostThb / budgetThb;
        if (costRatio >= 0.5) {
          score -= 15;
          reasons.push('transfer_eats_budget');
        } else if (costRatio >= 0.25) {
          score -= 5;
        }
      }
    }
  }

  // ── Energy match ──
  if (opts.partyEnergy) {
    const intensity = val('intensity') as string | undefined;
    if (intensity) {
      const energyMap = { low: 0, moderate: 1, high: 2 };
      const intensityMap = { low: 0, moderate: 1, high: 2, extreme: 3 };
      const energyLevel = energyMap[opts.partyEnergy] ?? 1;
      const intLevel = intensityMap[intensity as keyof typeof intensityMap] ?? 1;
      const diff = Math.abs(energyLevel - intLevel);
      if (diff === 0) { score += 10; reasons.push('energy_match'); }
      else if (diff >= 2) { score -= 10; }
    }
  }

  // ── Age fit ──
  if (opts.youngestAge !== undefined) {
    const ageFit = val('age_fit') as { min: number; max: number } | undefined;
    if (ageFit && typeof ageFit === 'object' && ageFit.min !== undefined) {
      if (opts.youngestAge >= ageFit.min && opts.youngestAge <= (ageFit.max ?? 99)) {
        score += 5;
        reasons.push('age_fit');
      }
    }
  }

  // ── Confidence penalty: unconfirmed safety attributes ──
  const safetyAttrs = exp.attributes.filter((a) => a.riskClass === 'safety');
  const unconfirmedCount = safetyAttrs.filter((a) => {
    const ev = a.evidence as { gate_status?: string }[];
    return ev.some((e) => e.gate_status === 'unconfirmed');
  }).length;
  if (unconfirmedCount > 3) {
    score -= 5;
    reasons.push('low_confidence');
  }

  // ── Multi-source corroboration bonus ──
  const multiSource = exp.attributes.filter((a) => {
    const ev = a.evidence as { source?: string }[];
    const sources = new Set(ev.map((e) => e.source));
    return sources.size >= 2;
  }).length;
  if (multiSource >= 3) {
    score += 5;
    reasons.push('well_corroborated');
  }

  // ── Season fit ──
  const bestMonths = val('best_months') as string[] | undefined;
  if (bestMonths && opts.season) {
    // Simple: high season products in high season get a bump
    const crowding = val('crowding_by_season') as Record<string, string> | undefined;
    if (crowding) {
      const level = crowding[opts.season];
      if (level === 'packed') { score -= 5; reasons.push('crowded'); }
      else if (level === 'quiet') { score += 5; reasons.push('uncrowded'); }
    }
  }

  // Clamp
  score = Math.max(0, Math.min(100, score));

  let tier: Tier;
  if (score >= 65) tier = 'excellent';
  else if (score >= 40) tier = 'good';
  else tier = 'fair';

  // Tier cap from transfer ratio
  if (tierCapped) {
    const capOrder: Record<Tier, number> = { excellent: 2, good: 1, fair: 0 };
    if (capOrder[tier] > capOrder[tierCapped]) tier = tierCapped;
  }

  // ── Review quality tiebreaker (within-tier only, never reorders across tiers) ──
  // Bayesian smoothed: (n * avg + C * prior) / (n + C)
  // C = 20 (pseudocounts), prior = 4.5 (Phuket activity average)
  // Max contribution: ±3 points (hard-capped)
  const reviewCount = val('viator.review_count') as number | undefined;
  const avgRating = val('viator.average_rating') as number | undefined;

  if (reviewCount !== undefined && avgRating !== undefined && reviewCount > 0) {
    const C = 20; // smoothing constant
    const prior = 4.5;
    const bayesian = (reviewCount * avgRating + C * prior) / (reviewCount + C);
    // Map 3.0-5.0 range to -3..+3 tiebreaker
    const tiebreaker = Math.max(-3, Math.min(3, (bayesian - 4.0) * 3));
    score = Math.max(0, Math.min(100, score + tiebreaker));

    if (reviewCount >= 50 && bayesian >= 4.5) {
      reasons.push('crowd_validated');
    }
  }
  if (reviewCount !== undefined && reviewCount < 10) {
    reasons.push('limited_reviews');
  }

  return { tier, score, reasons };
}
