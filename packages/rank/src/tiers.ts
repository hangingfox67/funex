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

export function scoreTier(
  exp: ExperienceRow,
  opts: {
    seaClassification?: 'calm' | 'moderate' | 'rough';
    rainSlots?: { morning: boolean; midday: boolean; evening: boolean };
    requestSlot?: 'morning' | 'midday' | 'evening';
    season?: 'high' | 'shoulder' | 'low';
    transferMinutes?: number;
    partyEnergy?: 'low' | 'moderate' | 'high';
    youngestAge?: number;
  },
): TierResult {
  let score = 35; // baseline — calibrated so excellent requires multiple positive signals
  const reasons: string[] = [];

  if (exp.enrichmentTier !== 'enriched') {
    return { tier: 'fair', score: 20, reasons: ['basic_tier'] };
  }

  const attrs = new Map(exp.attributes.map((a) => [a.key, a]));
  const val = (k: string) => attrs.get(k)?.value;
  const evidence = (k: string) => attrs.get(k)?.evidence ?? [];

  // ── Sea state fit ──
  if (opts.seaClassification === 'rough' || opts.seaClassification === 'moderate') {
    const waterExp = val('water_exposure') as string | undefined;
    const isRough = opts.seaClassification === 'rough';
    if (waterExp === 'open_sea') {
      score -= isRough ? 30 : 15;
      reasons.push('sea_state_risk');
    } else if (waterExp === 'sheltered_bay' || waterExp === 'none') {
      score += 10;
      reasons.push('sheltered_from_swell');
    }
  }

  // ── Slot-aware rain fit ──
  if (opts.rainSlots) {
    const rainOk = val('rain_viable');
    const indoor = val('indoor');
    const isIndoor = rainOk === true || indoor === true;
    const slot = opts.requestSlot ?? 'morning';
    const slotRainy = opts.rainSlots[slot];
    const anySlotDry = !opts.rainSlots.morning || !opts.rainSlots.midday || !opts.rainSlots.evening;
    const allRainy = opts.rainSlots.morning && opts.rainSlots.midday && opts.rainSlots.evening;
    const isFullDay = !opts.requestSlot; // no specific slot = full day

    if (isIndoor) {
      // Indoor/rain-viable: always good, bonus when it's raining
      if (slotRainy || allRainy) { score += 15; reasons.push('rain_safe'); }
    } else if (isFullDay && slotRainy && anySlotDry) {
      // Full-day outdoor with partial rain: penalty
      score -= 10;
      reasons.push('rain_risk_afternoon');
    } else if (!slotRainy && anySlotDry) {
      // Outdoor activity in a dry slot: positive signal
      score += 5;
      reasons.push('dry_window_match');
    } else if (slotRainy) {
      // Outdoor in a rainy slot
      score -= 15;
      reasons.push('rain_risk');
    }
  }

  // ── Transfer time ──
  if (opts.transferMinutes !== undefined) {
    if (opts.transferMinutes <= 15) { score += 10; reasons.push('nearby'); }
    else if (opts.transferMinutes >= 60) { score -= 10; reasons.push('far_transfer'); }
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

  return { tier, score, reasons };
}
