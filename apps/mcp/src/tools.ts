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

/**
 * Determine pricing basis from supplier age-band evidence.
 * - 'per_person': supplier uses ADULT/CHILD/SENIOR bands (confirmed per-traveler pricing)
 * - 'unknown': supplier uses single TRAVELER band or no band data (ambiguous)
 */
type PricingBasis = 'per_person' | 'unknown';

function pricingBasis(attributes: { key: string; value: unknown }[]): PricingBasis {
  const ageBands = attributes.find((a) => a.key === 'viator.age_bands')?.value;
  if (!Array.isArray(ageBands) || ageBands.length === 0) return 'unknown';
  // If any band uses ADULT, CHILD, SENIOR, INFANT — supplier confirms per-person pricing
  const hasTypedBand = ageBands.some((b: { band?: string }) =>
    b.band === 'ADULT' || b.band === 'CHILD' || b.band === 'SENIOR' || b.band === 'INFANT');
  return hasTypedBand ? 'per_person' : 'unknown';
}

const PRICE_NOTES: Record<PricingBasis, string> = {
  per_person: 'Per person in THB. Final price at checkout.',
  unknown: 'Pricing basis (per person or per group) is not confirmed by the supplier. Final price at checkout.',
};

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

// search_experiences: writes internal session + analytics (not read-only),
// calls Open-Meteo weather/marine + ORS travel matrix (public internet = open world),
// never destroys data.
export const SEARCH_ANNOTATIONS = {
  readOnlyHint: false,
  openWorldHint: true,
  destructiveHint: false,
};

// get_experience: writes internal analytics (not read-only),
// reads only from local database (no external calls = closed world),
// never destroys data.
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

  // Load venue zones: only verified physical venues influence routing
  const venueZoneRows = await rawClient`
    SELECT pv.experience_id, v.zone_slug
    FROM product_venue pv
    JOIN venue v ON v.id = pv.venue_id
    WHERE v.zone_slug IS NOT NULL
      AND pv.is_primary = true
      AND v.verification = 'verified'
      AND v.location_type != 'pickup_area'
  `;
  const venueZones = new Map<string, string>();
  for (const row of venueZoneRows) {
    venueZones.set(row.experience_id as string, row.zone_slug as string);
  }

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
    venueZones,
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

    // Pricing basis from supplier evidence
    const basis = pricingBasis(c.attributes);

    // Opaque booking token — no session/exp IDs in the URL
    let bookNowUrl: string | null = null;
    if (booking) {
      const token = await createBookingToken(sessionId, c.experienceId);
      bookNowUrl = `${SITE_ORIGIN}/r/${token}`;
    }

    // Transfer context
    let transfer_note: string;
    const venueZone = venueZones.get(c.experienceId);
    if (c.transferMinutes !== null && c.transferMinutes !== undefined && c.transferMinutes > 0 && venueZone) {
      // Verified venue: label what we're estimating
      transfer_note = `Approx. ${c.transferMinutes} min drive, ${staying} to ${venueZone} zone centres. Does not include pickup or boat travel.`;
      const ratio = c.durationMinutes ? c.transferMinutes / c.durationMinutes : 0;
      if (ratio >= 1) transfer_note += ' Travel time may exceed activity duration.';
      else if (ratio >= 0.5) transfer_note += ' Significant travel relative to activity.';
    } else {
      // Unknown: explicit explanation
      transfer_note = 'Journey time from your area is not known for this activity. Confirm pickup or meeting-point details at booking.';
    }

    // Duration handling
    let duration = c.durationMinutes && c.durationMinutes < 1440 ? c.durationMinutes : null;
    let durationNote: string | undefined;
    if (c.durationMinutes && c.durationMinutes >= 1440) {
      durationNote = 'Duration varies — ticket valid for the day.';
    }
    // Admission/ticket products: Viator durations are suggested visit times, not fixed activity lengths
    const isAdmissionProduct = /\b(ticket|entry|admission|pass|water\s*park|waterpark|aquarium|museum)\b/i.test(c.title);
    if (isAdmissionProduct && duration !== null) {
      durationNote = 'Duration shown is a suggested visit time, not a fixed activity length. Actual visit duration is flexible.';
    }

    // Surface advance_booking_needed when it signals required
    const attrs = new Map(c.attributes.map((a) => [a.key, a]));
    const advBooking = attrs.get('advance_booking_needed')?.value as string | undefined;
    const advBookingNote = advBooking === 'required' ? 'Advance booking required — not available as a walk-in.'
      : advBooking === 'recommended' ? 'Advance booking recommended.'
      : undefined;

    // Return-by feasibility: warn when any component is unconfirmed
    // Start times are never known — we only have best_time_of_day suggestions
    let returnByNote: string | undefined;
    if (returnBy) {
      if (!venueZone) {
        returnByNote = 'Return-time feasibility is unverified — travel time to/from this activity is unknown. Activity duration alone fits your deadline, but total journey time may not. Start time is not confirmed.';
      } else if (isAdmissionProduct) {
        returnByNote = 'Return-time feasibility is approximate — visit duration at this venue is flexible, not a fixed activity length.';
      } else {
        returnByNote = 'Return-time estimate is based on activity duration and zone-centre driving time. Start time, pickup duration, and any boat travel are not included. Confirm departure time at booking.';
      }
    }

    return {
      experience_id: c.experienceId,
      title: c.title,
      category: c.category,
      duration_minutes: duration,
      duration_note: durationNote,
      price_thb: c.priceThb,
      pricing_basis: basis,
      price_note: PRICE_NOTES[basis],
      fit: c.tier,
      reasons: c.reasons,
      transfer_note,
      return_by_note: returnByNote,
      advance_booking: advBookingNote,
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

  const basis = pricingBasis(attrs);
  const priceThb = exp.basePriceCents ? Math.round(exp.basePriceCents / 100) : null;

  return {
    experience_id: exp.id,
    title: exp.title,
    category: exp.category,
    duration_minutes: exp.durationMinutes,
    price_thb: priceThb,
    pricing_basis: basis,
    price_note: PRICE_NOTES[basis],
    attributes: servedAttrs,
    book_now_url: bookNowUrl,
    booking_note: bookNowUrl ? 'Live availability. Hotel pickup options at checkout.' : null,
  };
}
