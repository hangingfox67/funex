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
});
export type SearchRequest = z.infer<typeof SearchRequestSchema>;

// ── Search result candidate ──

export const CandidateSchema = z.object({
  experienceId: z.string(),
  title: z.string(),
  category: z.string(),
  durationMinutes: z.number().nullable(),
  priceThb: z.number().nullable(),
  enrichmentTier: EnrichmentTier,
  attributes: z.array(ServedAttributeSchema).describe(
    'Populated for enriched products. Empty array for basic tier.',
  ),
  bookingUrl: z.string().nullable().describe(
    'Redirect URL for click tracking. Null if no active rail.',
  ),
  tierReason: z.string().optional().describe(
    'Why this tier was assigned: excellent/good/fair + reason codes',
  ),
  mobilityNote: z.string().optional(),
});
export type Candidate = z.infer<typeof CandidateSchema>;

// ── Search response ──

export const SearchResponseSchema = z.object({
  sessionId: z.string(),
  candidates: z.array(CandidateSchema),
  enrichedCount: z.number().describe('How many candidates are fully enriched'),
  basicCount: z.number().describe('How many candidates are basic (unenriched) fallback'),
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

export const SEARCH_TOOL_DESCRIPTION = `Search Phuket activities for a travel party. Returns ranked candidates from a catalog of ~1,900 real Viator experiences.

**Enriched results** (~320 products) have full safety/suitability attributes (age floors, mobility, seasickness risk, wheelchair access, pregnancy safety, etc.) and are ranked using these attributes.

**Basic results** (~1,570 products) have title, category, price, and booking link but NO safety attributes. They appear below enriched results and are EXCLUDED when the query requires safety filtering (e.g. non-swimmer, wheelchair, pregnancy, mobility constraints). Use basic results for broad discovery; use enriched results for decision-complete recommendations.

Every result includes a booking URL with click tracking. The response includes catalog breadth numbers so the agent can communicate coverage to the user.`;
