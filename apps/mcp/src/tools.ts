/**
 * MCP tool definitions and handlers.
 * search_experiences + get_experience, anonymous, no auth.
 */
import { z } from 'zod';
import crypto from 'node:crypto';
import { eq } from 'drizzle-orm';
import postgres from 'postgres';
import { db, searchExperiences, experiences, attributes, isFixture } from '@funex/graph';
import { context, resetContextCache, type ContextSnapshot } from '@funex/context';
import { rank, type RankRequest } from '@funex/rank';
import { routeExperience } from '@funex/router';
import { createSessionId, ensureSession, createEventWriter, logDemand, logSuppressedDemand } from '@funex/telemetry';
import { toServedAttribute, SEARCH_TOOL_DESCRIPTION } from '@funex/contracts';

const eventWriter = createEventWriter(db);
const rawClient = postgres(process.env.DATABASE_URL ?? 'postgresql://funex:funex@localhost:5432/funex');
const SITE_ORIGIN = process.env.SITE_ORIGIN ?? 'https://thailandfunexperiences.com';

/** Create an opaque booking token (no session/exp IDs in the URL). */
async function createBookingToken(sessionId: string, experienceId: string): Promise<string> {
  const token = crypto.randomBytes(12).toString('base64url');
  await rawClient`INSERT INTO booking_token (token, session_id, experience_id) VALUES (${token}, ${sessionId}, ${experienceId})`;
  return token;
}

// ── Zone enum ──
const ZONE_ENUM = ['kata', 'karon', 'patong', 'kamala', 'bang_tao', 'rawai', 'panwa', 'old_town', 'mai_khao', 'airport', 'natai', 'khao_lak', 'ko_yao'] as const;

// ── Zod schemas for MCP tool params ──

export const SearchParamsSchema = {
  destination: z.string().default('phuket').describe('Destination slug'),
  date: z.string().date().describe('ISO date, e.g. 2026-09-10'),
  staying: z.enum(ZONE_ENUM).optional().describe('Zone slug where the party is staying. Omit if unknown — server defaults to patong (central).'),
  party: z.array(z.object({
    role: z.enum(['adult', 'child', 'senior']).describe('Traveler role'),
    age: z.number().optional(),
  })).min(1).describe('Travel party members — ages help filter bookability and suitability'),
  constraints: z.object({
    non_swimmer: z.boolean().optional().describe('Optional. Used only to exclude unsuitable activities for this request. Not stored.'),
    pregnant: z.boolean().optional().describe('Optional. Used only to exclude unsuitable activities for this request. Not stored.'),
    mobility: z.enum(['limited', 'moderate', 'full']).optional().describe('Optional. Used only to exclude unsuitable activities for this request. Not stored.'),
    motion_comfort: z.enum(['low', 'normal']).optional().describe('Optional. Low avoids rough seas and bumpy rides. Used only to filter this request. Not stored.'),
  }).optional().describe('Structured safety/comfort constraints. Translate traveler health and comfort needs into these flags rather than free text.'),
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

// ── Annotations ──

export const SEARCH_ANNOTATIONS = {
  readOnlyHint: false,
  openWorldHint: false,
  destructiveHint: false,
};

export const GET_EXPERIENCE_ANNOTATIONS = {
  readOnlyHint: false,
  openWorldHint: false,
  destructiveHint: false,
};

// ── Supported destinations ──

const SUPPORTED_DESTINATIONS = ['phuket'];
const SUPPORTED_DESTINATION_MESSAGE = 'We currently cover Phuket and its surroundings (Phang Nga Bay, Khao Lak, Ko Yao).';

// ── Handlers ──

export async function handleSearchExperiences(params: Record<string, unknown>): Promise<unknown> {
  const destination = ((params.destination as string) ?? 'phuket').toLowerCase().trim();
  const date = params.date as string;
  const staying = (params.staying as string) ?? 'patong';
  const party = params.party as { role: string; age?: number }[];

  // Unsupported destination: graceful decline
  if (!SUPPORTED_DESTINATIONS.includes(destination)) {
    const sessionId = createSessionId();
    await ensureSession(db, sessionId);
    await eventWriter.log(sessionId, 'demand.unsupported_destination', {
      requestedDestination: destination,
    });
    return {
      candidates: [],
      resultQuality: 'unsupported_destination',
      resultQualityReason: `${SUPPORTED_DESTINATION_MESSAGE} "${destination}" isn't supported yet.`,
      supportedDestinations: SUPPORTED_DESTINATIONS,
      conditions: null,
      refine: null,
      catalog: { total: 0, enriched: 0 },
    };
  }

  const energy = params.energy as string | undefined;
  const timeSlot = params.time_slot as 'morning' | 'midday' | 'evening' | undefined;
  const budgetThb = params.budget_thb as number | undefined;
  const maxDuration = params.max_duration_minutes as number | undefined;
  const returnBy = params.return_by as string | undefined;
  const maxResults = Math.min((params.max_results as number) ?? 4, 8);
  const exclude = params.exclude as { categories?: string[]; activity_tags?: string[]; exp_ids?: string[] } | undefined;
  const seen = params.seen as string[] | undefined;

  // Read structured constraints
  const constraints = params.constraints as {
    non_swimmer?: boolean;
    pregnant?: boolean;
    mobility?: 'limited' | 'moderate' | 'full';
    motion_comfort?: 'low' | 'normal';
  } | undefined;

  const ages = party.filter((p) => p.age !== undefined).map((p) => p.age!);
  const youngestAge = ages.length > 0 ? Math.min(...ages) : undefined;
  const requireNonSwimmerOk = constraints?.non_swimmer ?? false;
  const requirePregnantOk = constraints?.pregnant ?? false;
  const maxMobility = constraints?.mobility;
  const motionComfort = constraints?.motion_comfort;
  // Transfer penalty is automatic ranking behavior — no public param

  const safetyFiltersActive = !!(requireNonSwimmerOk || requirePregnantOk || maxMobility);

  const sessionId = createSessionId();
  await ensureSession(db, sessionId, destination);

  let ctx: ContextSnapshot | null = null;
  try {
    ctx = await context(destination, staying, date);
  } catch (err) {
    console.error('Context fetch failed:', (err as Error).message);
  }

  const { results: expRows, stats, resultQuality, resultQualityReason,
    excludedUnverifiedCount, excludedUnverifiedIds } = await searchExperiences({
    destinationSlug: destination,
    safetyFiltersActive,
    limit: 2000,
    db,
  });

  const rankRequest: RankRequest = {
    stayingZone: staying,
    date,
    youngestAge,
    maxMobility,
    requireNonSwimmerOk: requireNonSwimmerOk || undefined,
    requirePregnantOk: requirePregnantOk || undefined,
    budgetCents: budgetThb ? budgetThb * 100 : undefined,
    maxDurationMinutes: maxDuration,
    // maxTransferMinutes: automatic via transfer-ratio penalty, no public param
    energy: energy as 'low' | 'moderate' | 'high' | undefined,
    timeBucket: timeSlot,
    partySize: party.length,
    motionComfort: motionComfort,
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

    // Opaque booking token — no session/exp IDs in the URL
    let bookNowUrl: string | null = null;
    if (booking) {
      const token = await createBookingToken(sessionId, c.experienceId);
      bookNowUrl = `${SITE_ORIGIN}/r/${token}`;
    }

    return {
      experience_id: c.experienceId,
      title: c.title,
      category: c.category,
      duration_minutes: c.durationMinutes,
      price_per_person_thb: c.priceThb,
      price_note: 'Per person in THB. Final price at checkout.',
      fit: c.tier,
      reasons: c.reasons,
      book_now_url: bookNowUrl,
      booking_note: bookNowUrl ? 'Live availability. Hotel pickup options at checkout.' : null,
      mobility_note: c.mobilityNote,
      booking_constraints: c.bookingConstraints.length > 0 ? c.bookingConstraints : undefined,
      alternatives: c.alternatives.length > 0 ? c.alternatives : undefined,
    };
  }));

  const basicIds = ranked.candidates
    .filter((c) => c.enrichmentTier === 'basic')
    .map((c) => c.experienceId);
  if (basicIds.length > 0) {
    await logDemand(eventWriter, sessionId, basicIds, { safety_filtered: safetyFiltersActive });
  }
  if (excludedUnverifiedIds.length > 0) {
    await logSuppressedDemand(eventWriter, sessionId, excludedUnverifiedIds, {});
  }

  let finalResultQuality = resultQuality;
  let finalResultQualityReason = resultQualityReason;

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
    // No sessionId, no timestamps, no internal stats in the response
    candidates,
    resultQuality: finalResultQuality,
    resultQualityReason: finalResultQualityReason,
    conditions: ctx ? {
      weather: ctx.weather.summary,
      sea: ctx.seaState.summary,
      season: ctx.season.season,
    } : undefined,
    refine,
    catalog: {
      total: stats.totalDestination,
      enriched: stats.enriched,
    },
  };

  // Log — minimized: no constraint values, no individual ages
  await eventWriter.log(sessionId, 'search', {
    destination, zone: staying, date,
    partySize: party.length,
    safety_filter_applied: safetyFiltersActive,
    candidateCount: candidates.length,
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

  const sessionId = createSessionId();
  await ensureSession(db, sessionId);
  const booking = await routeExperience(expId, sessionId, db);

  await eventWriter.log(sessionId, 'get_experience', { experienceId: expId });

  let bookNowUrl: string | null = null;
  if (booking) {
    const token = await createBookingToken(sessionId, expId);
    bookNowUrl = `${SITE_ORIGIN}/r/${token}`;
  }

  return {
    experience_id: exp.id,
    title: exp.title,
    category: exp.category,
    duration_minutes: exp.durationMinutes,
    price_per_person_thb: exp.basePriceCents ? Math.round(exp.basePriceCents / 100) : null,
    price_note: 'Per person in THB. Final price at checkout.',
    attributes: servedAttrs,
    book_now_url: bookNowUrl,
    booking_note: bookNowUrl ? 'Live availability. Hotel pickup options at checkout.' : null,
  };
}
