/**
 * Ranker: pure function (graph + context + request) → candidates.
 * NO imports from router/connectors (Directive 8 — lint-enforced).
 */
import type { ExperienceRow, RankedCandidate } from './types.js';
import { applyHardFilters, type FilterContext } from './filters.js';
import { scoreTier } from './tiers.js';
import type { ContextSnapshot } from '@funex/context';
import type { TransferTime } from '@funex/context';

export interface RankRequest {
  stayingZone: string;
  date: string;
  youngestAge?: number;
  maxMobility?: 'limited' | 'moderate' | 'full';
  requireNonSwimmerOk?: boolean;
  requirePregnantOk?: boolean;
  requireRainViable?: boolean;
  budgetCents?: number;
  maxDurationMinutes?: number;
  maxTransferMinutes?: number;
  pastActivityIds?: string[];
  energy?: 'low' | 'moderate' | 'high';
  timeBucket?: 'morning' | 'midday' | 'evening';
  limit?: number;
}

export interface RankResult {
  candidates: RankedCandidate[];
  filtered: { id: string; reason: string }[];
  totalInput: number;
}

/**
 * Rank experiences. Pure function — no DB, no API calls.
 * Takes pre-fetched graph rows and context snapshot.
 */
export function rank(
  experiences: ExperienceRow[],
  ctx: ContextSnapshot | null,
  request: RankRequest,
): RankResult {
  const limit = request.limit ?? 20;
  const bucket = request.timeBucket ?? 'morning';
  const isRainy = ctx ? ctx.weather.precipitation.probability >= 60 : false;
  const seaClass = ctx?.seaState.classification;

  // Build transfer time lookup from context
  const transferMap = new Map<string, number>();
  if (ctx) {
    const bucketTransfers = ctx.transfers[bucket] ?? [];
    for (const t of bucketTransfers) {
      transferMap.set(t.to_zone, t.duration_minutes);
    }
  }

  // For now, all experiences are treated as being in the destination.
  // Transfer time uses the staying zone → experience's first meeting point zone.
  // Since meeting points aren't populated yet, we use a heuristic: 0 for same zone.
  // The context already provides transfers from the staying zone to all other zones.

  const filterCtx: FilterContext = {
    youngestAge: request.youngestAge,
    requireNonSwimmerOk: request.requireNonSwimmerOk,
    requirePregnantOk: request.requirePregnantOk,
    maxMobility: request.maxMobility,
    budgetCents: request.budgetCents,
    maxDurationMinutes: request.maxDurationMinutes,
    maxTransferMinutes: request.maxTransferMinutes,
    requireRainViable: request.requireRainViable,
    isRainyDay: isRainy,
    excludeIds: request.pastActivityIds ? new Set(request.pastActivityIds) : undefined,
  };

  const candidates: RankedCandidate[] = [];
  const filtered: { id: string; reason: string }[] = [];

  for (const exp of experiences) {
    // Estimate transfer time (no meeting points → use average across zones)
    const avgTransfer = transferMap.size > 0
      ? Math.round([...transferMap.values()].reduce((a, b) => a + b, 0) / transferMap.size)
      : undefined;

    const filterResult = applyHardFilters(exp, {
      ...filterCtx,
      transferMinutes: avgTransfer,
    });

    if (filterResult) {
      filtered.push({ id: exp.id, reason: filterResult });
      continue;
    }

    // Score
    const { tier, score, reasons } = scoreTier(exp, {
      seaClassification: seaClass,
      isRainyDay: isRainy,
      season: ctx?.season.season,
      transferMinutes: avgTransfer,
      partyEnergy: request.energy,
      youngestAge: request.youngestAge,
    });

    // Extract mobility_note and booking constraints
    const attrs = new Map(exp.attributes.map((a) => [a.key, a]));
    const mobilityNote = attrs.get('mobility_note')?.value as string | null ?? null;
    const bookingConstraints: string[] = [];
    const bookingNote = attrs.get('booking_age_note')?.value as string | undefined;
    if (bookingNote) bookingConstraints.push(bookingNote);
    const healthWarnings = attrs.get('health_warnings')?.value as string[] | undefined;
    if (healthWarnings) bookingConstraints.push(...healthWarnings);

    candidates.push({
      experienceId: exp.id,
      title: exp.title,
      category: exp.category,
      durationMinutes: exp.durationMinutes,
      priceThb: exp.basePriceCents ? Math.round(exp.basePriceCents / 100) : null,
      enrichmentTier: exp.enrichmentTier,
      tier,
      score,
      reasons,
      attributes: exp.attributes,
      mobilityNote,
      bookingConstraints,
      transferMinutes: avgTransfer ?? null,
    });
  }

  // Sort: enriched before basic, then by score descending, then by tier
  candidates.sort((a, b) => {
    if (a.enrichmentTier !== b.enrichmentTier) {
      return a.enrichmentTier === 'enriched' ? -1 : 1;
    }
    return b.score - a.score;
  });

  return {
    candidates: candidates.slice(0, limit),
    filtered,
    totalInput: experiences.length,
  };
}
