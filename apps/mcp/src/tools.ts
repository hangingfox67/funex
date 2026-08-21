/**
 * MCP tool definitions and handlers.
 * search_experiences + get_experience, anonymous, no auth.
 */
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db, searchExperiences, experiences, attributes, isFixture } from '@funex/graph';
import { context, resetContextCache, type ContextSnapshot } from '@funex/context';
import { rank, type RankRequest } from '@funex/rank';
import { routeExperience } from '@funex/router';
import { createSessionId, ensureSession, createEventWriter, logDemand, logSuppressedDemand } from '@funex/telemetry';
import { toServedAttribute, SEARCH_TOOL_DESCRIPTION } from '@funex/contracts';

const eventWriter = createEventWriter(db);

// ── Zod schemas for MCP tool params ──

export const SearchParamsSchema = {
  destination: z.string().default('phuket').describe('Destination slug'),
  date: z.string().describe('ISO date, e.g. 2026-08-20'),
  staying: z.string().describe('Zone slug: kata, karon, patong, bang_tao, panwa, old_town, airport'),
  party: z.array(z.object({
    role: z.string().describe('adult, child, senior'),
    age: z.number().optional(),
    notes: z.string().optional().describe('e.g. non-swimmer, limited-walking, pregnant'),
  })).min(1).describe('Travel party members'),
  energy: z.enum(['low', 'moderate', 'high']).optional().describe('Party energy level'),
  time_slot: z.enum(['morning', 'midday', 'evening']).optional().describe('Preferred time of day'),
  budget_thb: z.number().optional().describe('Max price per person in THB'),
  max_duration_minutes: z.number().optional(),
  return_by: z.string().optional().describe('Time deadline e.g. "13:00" — filters activities that cannot finish and return by this time'),
  max_results: z.number().min(1).max(8).default(4).describe('Portfolio size (default 4, max 8)'),
  exclude: z.object({
    categories: z.array(z.string()).optional(),
    activity_tags: z.array(z.string()).optional().describe('e.g. ["zipline"] excludes combos too'),
    exp_ids: z.array(z.string()).optional(),
  }).optional().describe('Exclusions for follow-up turns'),
  seen: z.array(z.string()).optional().describe('IDs already shown — guarantees fresh results'),
};

export const GetExperienceParamsSchema = {
  experience_id: z.string().describe('Experience ID (e.g. exp_170728P24)'),
};

// ── Handlers ──

export async function handleSearchExperiences(params: Record<string, unknown>): Promise<unknown> {
  const destination = (params.destination as string) ?? 'phuket';
  const date = params.date as string;
  const staying = params.staying as string;
  const party = params.party as { role: string; age?: number; notes?: string }[];
  const energy = params.energy as string | undefined;
  const timeSlot = params.time_slot as 'morning' | 'midday' | 'evening' | undefined;
  const budgetThb = params.budget_thb as number | undefined;
  const maxDuration = params.max_duration_minutes as number | undefined;
  const returnBy = params.return_by as string | undefined;
  const maxResults = Math.min((params.max_results as number) ?? 4, 8);
  const exclude = params.exclude as { categories?: string[]; activity_tags?: string[]; exp_ids?: string[] } | undefined;
  const seen = params.seen as string[] | undefined;

  // Derive constraints from party
  const ages = party.filter((p) => p.age !== undefined).map((p) => p.age!);
  const youngestAge = ages.length > 0 ? Math.min(...ages) : undefined;
  const notes = party.map((p) => p.notes ?? '').join(' ').toLowerCase();
  const requireNonSwimmerOk = notes.includes('non-swimmer') || notes.includes('non swimmer');
  const requirePregnantOk = notes.includes('pregnant');
  const maxMobility = notes.includes('wheelchair') ? 'limited' as const
    : notes.includes('limited-walking') || notes.includes('limited walking') ? 'limited' as const
    : undefined;

  const safetyFiltersActive = !!(requireNonSwimmerOk || requirePregnantOk || maxMobility);

  // Create session
  const sessionId = createSessionId();
  await ensureSession(db, sessionId, destination);

  // Get context
  let ctx: ContextSnapshot | null = null;
  try {
    ctx = await context(destination, staying, date);
  } catch (err) {
    console.error('Context fetch failed:', (err as Error).message);
  }

  // Search
  const { results: expRows, stats, resultQuality, resultQualityReason,
    excludedUnverifiedCount, excludedUnverifiedIds } = await searchExperiences({
    destinationSlug: destination,
    safetyFiltersActive,
    limit: 2000,
    db,
  });

  // Rank
  const rankRequest: RankRequest = {
    stayingZone: staying,
    date,
    youngestAge,
    maxMobility,
    requireNonSwimmerOk: requireNonSwimmerOk || undefined,
    requirePregnantOk: requirePregnantOk || undefined,
    budgetCents: budgetThb ? budgetThb * 100 : undefined,
    maxDurationMinutes: maxDuration,
    energy: energy as 'low' | 'moderate' | 'high' | undefined,
    timeBucket: timeSlot,
    partySize: party.length,
    returnBy,
    maxResults,
    exclude: exclude ? {
      categories: exclude.categories,
      activityTags: exclude.activity_tags,
      expIds: exclude.exp_ids,
    } : undefined,
    seen,
  };

  const ranked = rank(expRows, ctx, rankRequest);

  // Resolve booking URLs
  const candidates = await Promise.all(ranked.candidates.map(async (c) => {
    const booking = await routeExperience(c.experienceId, sessionId, db);
    const servedAttrs = c.attributes
      .filter((a) => !a.key.startsWith('viator.') && a.key !== 'activity_tags')
      .map((a) => toServedAttribute({
        key: a.key,
        value: a.value,
        confidence: a.confidence,
        riskClass: a.riskClass,
        evidence: a.evidence as { source: string; pointer: string; inference_basis?: string; gate_status?: string }[],
      }));

    const bookNowUrl = booking
      ? `https://thailandfunexperiences.com${booking.redirectUrl}`
      : null;

    return {
      experienceId: c.experienceId,
      title: c.title,
      category: c.category,
      durationMinutes: c.durationMinutes,
      price_per_person_thb: c.priceThb,
      price_note: 'Price shown is per person in Thai Baht (THB). Final price confirmed at checkout.',
      enrichmentTier: c.enrichmentTier,
      portfolioRole: c.portfolioRole,
      tier: c.tier,
      reasons: c.reasons,
      attributes: servedAttrs,
      book_now_url: bookNowUrl,
      booking_note: bookNowUrl
        ? 'Bookable now via this link — live availability, hotel pickup options shown at checkout.'
        : null,
      mobilityNote: c.mobilityNote,
      bookingConstraints: c.bookingConstraints,
      alternatives: c.alternatives,
    };
  }));

  // Log demand events
  const basicIds = ranked.candidates
    .filter((c) => c.enrichmentTier === 'basic')
    .map((c) => c.experienceId);
  if (basicIds.length > 0) {
    await logDemand(eventWriter, sessionId, basicIds, { safety_filtered: safetyFiltersActive });
  }
  if (excludedUnverifiedIds.length > 0) {
    await logSuppressedDemand(eventWriter, sessionId, excludedUnverifiedIds, {});
  }

  // Build refine hints
  const refine: Record<string, unknown> = {
    totalMatches: ranked.totalQualified,
  };
  if (ranked.totalQualified > maxResults) {
    const hints: string[] = [];
    if (!energy) hints.push('energy (low/moderate/high)');
    if (!timeSlot) hints.push('time_slot (morning/midday/evening)');
    if (!budgetThb) hints.push('budget_thb');
    if (!maxDuration) hints.push('max_duration_minutes');
    if (hints.length > 0) refine.canNarrowBy = hints;
  }

  const response = {
    sessionId,
    candidates,
    resultQuality,
    resultQualityReason,
    enrichedCount: candidates.filter((c) => c.enrichmentTier === 'enriched').length,
    basicCount: candidates.filter((c) => c.enrichmentTier === 'basic').length,
    excludedUnverifiedCount,
    context: ctx ? {
      weather: { summary: ctx.weather.summary, rain_buckets: ctx.weather.rain_buckets },
      seaState: { classification: ctx.seaState.classification, summary: ctx.seaState.summary },
      season: ctx.season.season,
    } : undefined,
    refine,
    catalogBreadth: {
      totalDestination: stats.totalDestination,
      enriched: stats.enriched,
      basic: stats.basic,
    },
  };

  // Log search event
  await eventWriter.log(sessionId, 'search', {
    destination, zone: staying, date, party,
    candidateCount: candidates.length,
    resultQuality,
    enrichedCount: response.enrichedCount,
  });

  resetContextCache();
  return response;
}

export async function handleGetExperience(params: Record<string, unknown>): Promise<unknown> {
  const expId = params.experience_id as string;

  if (!expId || isFixture(expId)) {
    return { error: 'Experience not found' };
  }

  const [exp] = await db.select().from(experiences).where(eq(experiences.id, expId));
  if (!exp) return { error: 'Experience not found' };

  // Load attributes
  const attrs = await db.select().from(attributes).where(eq(attributes.experienceId, expId));
  const servedAttrs = attrs
    .filter((a) => !a.key.startsWith('viator.') && a.key !== 'activity_tags')
    .map((a) => toServedAttribute({
      key: a.key,
      value: a.value,
      confidence: a.confidence,
      riskClass: a.riskClass,
      evidence: a.evidence as { source: string; pointer: string; inference_basis?: string; gate_status?: string }[],
    }));

  // Booking URL
  const sessionId = createSessionId();
  await ensureSession(db, sessionId);
  const booking = await routeExperience(expId, sessionId, db);

  await eventWriter.log(sessionId, 'get_experience', { experienceId: expId });

  const bookNowUrl = booking
    ? `https://thailandfunexperiences.com${booking.redirectUrl}`
    : null;

  return {
    experienceId: exp.id,
    title: exp.title,
    category: exp.category,
    durationMinutes: exp.durationMinutes,
    price_per_person_thb: exp.basePriceCents ? Math.round(exp.basePriceCents / 100) : null,
    price_note: 'Price shown is per person in Thai Baht (THB). Final price confirmed at checkout.',
    attributes: servedAttrs,
    book_now_url: bookNowUrl,
    booking_note: bookNowUrl
      ? 'Bookable now via this link — live availability, hotel pickup options shown at checkout.'
      : null,
    meetingPoints: exp.meetingPoints,
  };
}
