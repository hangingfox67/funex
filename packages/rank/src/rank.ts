/**
 * Ranker: pure function (graph + context + request) → portfolio.
 * NO imports from router/connectors (Directive 8 — lint-enforced).
 *
 * Response is a PORTFOLIO (default 4, max 8): best overall + alternative
 * category + wildcard/value, each from a distinct venue. Venue variants
 * folded into alternatives[] on the winning row.
 */
import type { ExperienceRow, RankedCandidate, VariantRef } from './types.js';
import { applyHardFilters, type FilterContext } from './filters.js';
import { scoreTier } from './tiers.js';
import type { ContextSnapshot } from '@funex/context';

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
  transportIntent?: boolean;
  partySize?: number;
  motionComfort?: 'low' | 'normal';
  returnBy?: string; // "13:00" — ranker enforces duration + transfers ≤ deadline from slot start
  maxResults?: number; // default 4, cap 8

  // Exclusions for conversational follow-up
  exclude?: {
    categories?: string[];
    venues?: string[];
    expIds?: string[];
    activityTags?: string[]; // e.g. ["zipline"] excludes all combos containing zipline
  };
  seen?: string[]; // experience IDs already shown — equivalent to exclude.expIds
}

export interface RankResult {
  candidates: RankedCandidate[];
  filtered: { id: string; reason: string }[];
  totalInput: number;
  totalQualified: number; // passed filters before portfolio assembly
}

// ── Venue dedup ──

/** Generate a venue key from title: normalized first 3 significant words. */
function venueKey(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !['the', 'and', 'from', 'with', 'for', 'phuket', 'private', 'tour', 'day', 'full'].includes(w))
    .slice(0, 3)
    .join('_') || title.toLowerCase().substring(0, 20);
}

// ── Group type scoring ──

function groupTypeFit(
  groupTypes: unknown,
  partyEnergy?: string,
  youngestAge?: number,
): number {
  if (!Array.isArray(groupTypes)) return 0;
  const types = groupTypes as string[];

  // Family query (youngestAge < 18) penalizes solo/couple-only products
  if (youngestAge !== undefined && youngestAge < 18) {
    if (types.includes('family')) return 5;
    if (!types.includes('family') && types.length > 0) return -5;
  }

  return 0;
}

/**
 * Rank experiences into a portfolio.
 */
export function rank(
  experiences: ExperienceRow[],
  ctx: ContextSnapshot | null,
  request: RankRequest,
): RankResult {
  const maxResults = Math.min(request.maxResults ?? 4, 8);
  const bucket = request.timeBucket ?? 'morning';
  const seaClass = ctx?.seaState.classification;

  const rainSlots = ctx?.weather.rain_buckets ? {
    morning: ctx.weather.rain_buckets.find((b) => b.slot === 'morning')?.rainy ?? false,
    midday: ctx.weather.rain_buckets.find((b) => b.slot === 'midday')?.rainy ?? false,
    evening: ctx.weather.rain_buckets.find((b) => b.slot === 'evening')?.rainy ?? false,
  } : undefined;

  const transferMap = new Map<string, number>();
  if (ctx) {
    for (const t of (ctx.transfers[bucket] ?? [])) {
      transferMap.set(t.to_zone, t.duration_minutes);
    }
  }

  // Build exclusion sets
  const excludeIds = new Set<string>([
    ...(request.pastActivityIds ?? []),
    ...(request.exclude?.expIds ?? []),
    ...(request.seen ?? []),
  ]);
  const excludeCategories = new Set(request.exclude?.categories ?? []);
  const excludeVenues = new Set(request.exclude?.venues ?? []);

  // Compute available minutes from slot start to return_by deadline
  let availableMinutes: number | undefined;
  if (request.returnBy) {
    const slotStartHours: Record<string, number> = { morning: 7, midday: 11, evening: 16 };
    const startHour = slotStartHours[bucket] ?? 7;
    const [retH, retM] = request.returnBy.split(':').map(Number);
    const deadlineMinutes = retH * 60 + (retM || 0);
    const startMinutes = startHour * 60;
    availableMinutes = Math.max(0, deadlineMinutes - startMinutes);
  }

  const filterCtx: FilterContext = {
    youngestAge: request.youngestAge,
    requireNonSwimmerOk: request.requireNonSwimmerOk,
    requirePregnantOk: request.requirePregnantOk,
    maxMobility: request.maxMobility,
    budgetCents: request.budgetCents,
    maxDurationMinutes: request.maxDurationMinutes,
    maxTransferMinutes: request.maxTransferMinutes,
    availableMinutes,
    rainSlots,
    requestSlot: request.timeBucket,
    activityIntent: !request.transportIntent,
    partySize: request.partySize,
    motionComfort: request.motionComfort,
    excludeActivityTags: request.exclude?.activityTags ? new Set(request.exclude.activityTags) : undefined,
    excludeIds,
  };

  // ── Score all experiences ──
  type ScoredExp = RankedCandidate & { venueKey: string };
  const scored: ScoredExp[] = [];
  const filtered: { id: string; reason: string }[] = [];

  for (const exp of experiences) {
    // Explicit exclusions
    if (excludeCategories.has(exp.category)) {
      filtered.push({ id: exp.id, reason: 'excluded_category' });
      continue;
    }
    const vk = venueKey(exp.title);
    if (excludeVenues.has(vk)) {
      filtered.push({ id: exp.id, reason: 'excluded_venue' });
      continue;
    }

    // Use MEDIAN transfer time (robust to outlier zones like Khao Lak/Ko Yao)
    let medianTransfer: number | undefined;
    if (transferMap.size > 0) {
      const sorted = [...transferMap.values()].sort((a, b) => a - b);
      medianTransfer = sorted[Math.floor(sorted.length / 2)];
    }

    const filterResult = applyHardFilters(exp, { ...filterCtx, transferMinutes: medianTransfer });
    if (filterResult) {
      filtered.push({ id: exp.id, reason: filterResult });
      continue;
    }

    const { tier, score: baseScore, reasons } = scoreTier(exp, {
      seaClassification: seaClass,
      rainSlots,
      requestSlot: request.timeBucket,
      season: ctx?.season.season,
      transferMinutes: medianTransfer,
      budgetCents: request.budgetCents,
      motionComfort: request.motionComfort,
      partyEnergy: request.energy,
      youngestAge: request.youngestAge,
    });

    // group_type scoring
    const attrs = new Map(exp.attributes.map((a) => [a.key, a]));
    const gtFit = groupTypeFit(attrs.get('group_type')?.value, request.energy, request.youngestAge);
    const score = Math.max(0, Math.min(100, baseScore + gtFit));
    if (gtFit > 0) reasons.push('group_fit');
    if (gtFit < 0) reasons.push('group_mismatch');

    const mobilityNote = attrs.get('mobility_note')?.value as string | null ?? null;
    const bookingConstraints: string[] = [];
    const bookingNote = attrs.get('booking_age_note')?.value as string | undefined;
    if (bookingNote) bookingConstraints.push(bookingNote);
    const healthWarnings = attrs.get('health_warnings')?.value as string[] | undefined;
    if (healthWarnings) bookingConstraints.push(...healthWarnings);

    scored.push({
      experienceId: exp.id,
      title: exp.title,
      category: exp.category,
      durationMinutes: exp.durationMinutes,
      priceThb: exp.basePriceCents ? Math.round(exp.basePriceCents / 100) : null,
      enrichmentTier: exp.enrichmentTier,
      tier: score >= 65 ? 'excellent' : score >= 40 ? 'good' : 'fair', // recalc after gtFit
      score,
      reasons,
      portfolioRole: 'best_overall', // assigned during assembly
      attributes: exp.attributes,
      mobilityNote,
      bookingConstraints,
      transferMinutes: medianTransfer ?? null,
      alternatives: [],
      venueKey: vk,
    });
  }

  const totalQualified = scored.length;

  // Sort: enriched first, then score desc
  // Sort: enriched first, then score desc, then nearest wins ties
  scored.sort((a, b) => {
    if (a.enrichmentTier !== b.enrichmentTier) return a.enrichmentTier === 'enriched' ? -1 : 1;
    if (b.score !== a.score) return b.score - a.score;
    // "Same fun, less taxi" — nearest wins ties
    return (a.transferMinutes ?? 999) - (b.transferMinutes ?? 999);
  });

  // ── Venue dedup: one slot per venue, variants as alternatives[] ──
  const venueWinners = new Map<string, ScoredExp>();
  const venueAlts = new Map<string, VariantRef[]>();

  for (const c of scored) {
    if (!venueWinners.has(c.venueKey)) {
      venueWinners.set(c.venueKey, c);
      venueAlts.set(c.venueKey, []);
    } else {
      venueAlts.get(c.venueKey)!.push({
        experienceId: c.experienceId,
        title: c.title,
        priceThb: c.priceThb,
        durationMinutes: c.durationMinutes,
      });
    }
  }

  // Attach alternatives to winners
  for (const [vk, winner] of venueWinners) {
    winner.alternatives = venueAlts.get(vk) ?? [];
  }

  const deduped = [...venueWinners.values()];

  // ── Portfolio assembly ──
  // Roles: best_overall, alternative_category, wildcard/value.
  // Wildcard must differ on ACTIVITY TYPE from slots 1-2 (no shared primary
  // activity tokens). This prevents "3 zipline variants in different packaging".

  /** Extract primary activity token from title for diversity check. */
  function primaryActivityToken(title: string): string {
    const t = title.toLowerCase();
    const tokens = ['zipline', 'hanuman', 'atv', 'snorkel', 'kayak', 'canoe', 'dive',
      'jet ski', 'jetski', 'cooking', 'temple', 'elephant', 'massage', 'spa',
      'waterpark', 'water park', 'splash', 'andamanda', 'cabaret', 'museum',
      'aquarium', 'escape room', 'trampoline', 'muay thai', 'surf', 'golf',
      'yacht', 'catamaran', 'cruise', 'helicopter'];
    for (const tok of tokens) {
      if (t.includes(tok)) return tok;
    }
    return t.split(/\s+/).slice(0, 2).join('_');
  }

  const portfolio: RankedCandidate[] = [];
  const usedCategories = new Set<string>();
  const usedActivityTokens = new Set<string>();

  // 1. Best overall
  if (deduped.length > 0) {
    const best = deduped[0];
    best.portfolioRole = 'best_overall';
    portfolio.push(best);
    usedCategories.add(best.category);
    usedActivityTokens.add(primaryActivityToken(best.title));
  }

  // 2. Best from a DIFFERENT category AND different activity token
  for (const c of deduped) {
    if (portfolio.length >= maxResults) break;
    if (portfolio.some((p) => p.experienceId === c.experienceId)) continue;
    const token = primaryActivityToken(c.title);
    if (!usedCategories.has(c.category) && !usedActivityTokens.has(token)) {
      c.portfolioRole = 'alternative_category';
      portfolio.push(c);
      usedCategories.add(c.category);
      usedActivityTokens.add(token);
    }
  }

  // 3. Wildcard/value: must differ on activity type from existing slots
  for (const c of deduped) {
    if (portfolio.length >= maxResults) break;
    if (portfolio.some((p) => p.experienceId === c.experienceId)) continue;

    const token = primaryActivityToken(c.title);
    const isNewActivity = !usedActivityTokens.has(token);
    const bestPrice = portfolio[0]?.priceThb;
    const isValue = bestPrice && c.priceThb && c.priceThb < bestPrice * 0.5;

    if (isNewActivity) {
      c.portfolioRole = isValue ? 'value' : 'wildcard';
      portfolio.push(c);
      usedActivityTokens.add(token);
    }
  }

  // Backfill if we still haven't reached maxResults
  for (const c of deduped) {
    if (portfolio.length >= maxResults) break;
    if (portfolio.some((p) => p.experienceId === c.experienceId)) continue;
    c.portfolioRole = 'wildcard';
    portfolio.push(c);
  }

  return {
    candidates: portfolio.slice(0, maxResults),
    filtered,
    totalInput: experiences.length,
    totalQualified,
  };
}
