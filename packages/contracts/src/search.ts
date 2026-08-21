import { z } from 'zod';
import { ServedAttributeSchema } from './attributes.js';

// ── Enrichment tier ──

export const EnrichmentTier = z.enum(['enriched', 'basic']);
export type EnrichmentTier = z.infer<typeof EnrichmentTier>;

// ── Search request ──

export const SearchRequestSchema = z.object({
  destination: z.string(),
  date: z.string().describe('ISO date, e.g. 2026-08-20'),
  staying: z.string().describe('Zone slug where the party is staying'),
  party: z
    .array(z.object({
      role: z.string().describe('e.g. adult, child, senior'),
      age: z.number().optional(),
      notes: z.string().optional().describe('e.g. non-swimmer, limited-walking'),
    }))
    .min(1),
  constraints: z
    .object({
      budget_thb: z.number().optional(),
      max_duration_minutes: z.number().optional(),
      categories: z.array(z.string()).optional().describe('Include only these categories'),
      exclude_categories: z.array(z.string()).optional(),
      require_rain_viable: z.boolean().optional(),
      require_non_swimmer_ok: z.boolean().optional(),
      require_wheelchair: z.boolean().optional(),
      max_mobility: z.enum(['limited', 'moderate', 'full']).optional()
        .describe('Maximum mobility the party can handle — filters OUT activities above this level'),
    })
    .optional(),
  past_activities: z.array(z.string()).optional()
    .describe('Experience IDs done previously — ranker deprioritizes repeats'),
  energy: z.enum(['low', 'moderate', 'high']).optional()
    .describe('Party energy level — maps to intensity preference'),
  max_results: z.number().min(1).max(8).optional()
    .describe('Number of results to return (default 4, max 8). Results are a portfolio, not top-k.'),
  exclude: z.object({
    categories: z.array(z.string()).optional(),
    venues: z.array(z.string()).optional(),
    exp_ids: z.array(z.string()).optional(),
  }).optional().describe('Exclusions for conversational follow-up turns'),
  seen: z.array(z.string()).optional()
    .describe('Experience IDs already shown — follow-up returns fresh set, zero overlap'),
});
export type SearchRequest = z.infer<typeof SearchRequestSchema>;

// ── Search result candidate ──

export const VariantSchema = z.object({
  experienceId: z.string(),
  title: z.string(),
  priceThb: z.number().nullable(),
  durationMinutes: z.number().nullable(),
});

export const CandidateSchema = z.object({
  experienceId: z.string(),
  title: z.string(),
  category: z.string(),
  durationMinutes: z.number().nullable(),
  priceThb: z.number().nullable(),
  enrichmentTier: EnrichmentTier,
  portfolioRole: z.enum(['best_overall', 'alternative_category', 'wildcard', 'value']).describe(
    'Why this candidate was selected for the portfolio.',
  ),
  attributes: z.array(ServedAttributeSchema).describe(
    'Populated for enriched products. Empty array for basic tier.',
  ),
  bookingUrl: z.string().nullable().describe(
    'Redirect URL for click tracking. Null if no active rail.',
  ),
  reasons: z.array(z.string()).describe(
    'Reason codes: sheltered_from_swell, rain_safe, dry_window_match, energy_match, etc.',
  ),
  mobilityNote: z.string().optional(),
  bookingConstraints: z.array(z.string()).optional(),
  alternatives: z.array(VariantSchema).describe(
    'Same-venue variants (different package/duration/price). Agent can mention these.',
  ),
});
export type Candidate = z.infer<typeof CandidateSchema>;

// ── Search response ──

export const ResultQualitySchema = z.enum(['enriched', 'mixed', 'basic_only', 'out_of_scope', 'unsupported_destination']);
export type ResultQuality = z.infer<typeof ResultQualitySchema>;

export const SearchResponseSchema = z.object({
  sessionId: z.string(),
  candidates: z.array(CandidateSchema),
  resultQuality: ResultQualitySchema.describe(
    'enriched = all candidates have safety attributes. mixed = some enriched, some basic. basic_only = no enriched candidates (agent should caveat recommendations).',
  ),
  resultQualityReason: z.string().nullable().describe(
    'When basic_only, explains why and suggests alternatives.',
  ),
  enrichedCount: z.number().describe('How many candidates are fully enriched'),
  basicCount: z.number().describe('How many candidates are basic (unenriched) fallback'),
  excludedUnverifiedCount: z.number().describe(
    'Products that matched the query but were excluded because safety filters are active and they lack enrichment. High numbers signal demand for enriching these products.',
  ),
  context: z
    .object({
      weather: z.unknown().optional(),
      seaState: z.unknown().optional(),
      season: z.string().optional(),
    })
    .optional(),
  refine: z
    .object({
      canNarrowBy: z.array(z.string()).optional()
        .describe('Attributes the agent could ask about to narrow results'),
      totalMatches: z.number().optional()
        .describe('Total matching experiences before limit'),
    })
    .optional(),
  catalogBreadth: z.object({
    totalDestination: z.number().describe('Total real experiences in destination'),
    enriched: z.number().describe('Fully enriched with safety/suitability attributes'),
    basic: z.number().describe('Available as basic results (title, category, price, booking only)'),
  }),
});
export type SearchResponse = z.infer<typeof SearchResponseSchema>;

// ── Tool description for MCP ──

export const SEARCH_TOOL_DESCRIPTION = `Search Phuket activities for a travel party. Returns a portfolio of ~4 diverse recommendations (max 8 via max_results) from ~1,900 real experiences.

**Portfolio, not top-k.** Each response contains one best-overall pick, alternative categories, and a wildcard/value option — all from distinct venues. Same-venue variants (different packages) appear as alternatives[] on each row.

**Conversational loop.** Return few, refine on reaction. Use \`seen\` or \`exclude\` to get fresh results on follow-up turns — zero overlap guaranteed. Example: user says "no adventure" → re-query with exclude.categories=["adventure"].

**Enriched results** (~350 products) have safety/suitability attributes (age floors, mobility, seasickness, wheelchair, pregnancy) and are ranked by context fit. **Basic results** (~1,550) have title/category/price only — excluded when safety filters are active.

**Weather-aware.** Rain forecasts are slot-aware (morning/midday/evening). Outdoor activities get dry_window_match or rain_risk based on the requested time slot. Sea state penalizes open-sea activities when swell is moderate/rough.

**Structured constraints, not free text.** Translate traveler health and comfort needs into the structured constraints object: \`motion_comfort: "low"\` (avoid rough seas/bumpy rides), \`mobility: "limited"\` (wheelchair/walking difficulty), \`pregnant: true\`, \`non_swimmer: true\`. Do NOT pass medical language or health details as free text in any field.

Each result includes a direct booking link (book_now_url) with live availability. When presenting options, include the booking link for each recommendation — users can check availability and book immediately. Prices are per person in THB, confirmed at checkout.`;
