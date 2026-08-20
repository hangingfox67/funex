import { sql, eq, and, not, like, inArray } from 'drizzle-orm';
import { db as defaultDb } from './connection.js';
import { experiences, attributes, FIXTURE_ID_PREFIX } from './index.js';

export interface ExperienceRow {
  id: string;
  title: string;
  category: string;
  durationMinutes: number | null;
  basePriceCents: number | null;
  meetingPoints: { lat: number; lng: number; label: string }[];
  enrichmentTier: 'enriched' | 'basic';
  attributes: {
    key: string;
    value: unknown;
    confidence: number;
    evidence: { source: string; pointer: string; inference_basis?: string; gate_status?: string }[];
    riskClass: string;
  }[];
}

export interface CatalogStats {
  totalDestination: number;
  enriched: number;
  basic: number;
}

/**
 * Query experiences with optional attribute enrichment.
 *
 * Returns enriched products first (with full attributes), then basic products
 * (title/category/price only, empty attributes array).
 *
 * When safetyFiltersActive=true, basic products are excluded entirely —
 * unenriched products cannot satisfy safety constraints.
 */
export async function searchExperiences(opts: {
  destinationSlug: string;
  categories?: string[];
  excludeCategories?: string[];
  budgetCents?: number;
  maxDurationMinutes?: number;
  safetyFiltersActive: boolean;
  limit?: number;
  excludeIds?: string[];
  db?: typeof defaultDb;
}): Promise<{ results: ExperienceRow[]; stats: CatalogStats }> {
  const db = opts.db ?? defaultDb;
  const limit = opts.limit ?? 50;

  // Get enriched experience IDs (those with at least one attribute row)
  const enrichedIds = await db
    .selectDistinct({ experienceId: attributes.experienceId })
    .from(attributes)
    .where(not(like(attributes.experienceId, `${FIXTURE_ID_PREFIX}%`)));
  const enrichedSet = new Set(enrichedIds.map((r) => r.experienceId));

  // Build base conditions
  const conditions = [
    eq(experiences.destinationSlug, opts.destinationSlug),
    not(like(experiences.id, `${FIXTURE_ID_PREFIX}%`)),
  ];

  if (opts.categories && opts.categories.length > 0) {
    conditions.push(inArray(experiences.category, opts.categories));
  }
  if (opts.excludeCategories && opts.excludeCategories.length > 0) {
    conditions.push(not(inArray(experiences.category, opts.excludeCategories)));
  }
  if (opts.budgetCents) {
    conditions.push(sql`${experiences.basePriceCents} <= ${opts.budgetCents}`);
  }
  if (opts.maxDurationMinutes) {
    conditions.push(sql`${experiences.durationMinutes} <= ${opts.maxDurationMinutes}`);
  }
  if (opts.excludeIds && opts.excludeIds.length > 0) {
    conditions.push(not(inArray(experiences.id, opts.excludeIds)));
  }

  // Query all matching experiences
  const rows = await db
    .select()
    .from(experiences)
    .where(and(...conditions))
    .orderBy(experiences.id)
    .limit(limit * 3); // overfetch to allow filtering/sorting later

  // Split into enriched and basic
  const enrichedRows: ExperienceRow[] = [];
  const basicRows: ExperienceRow[] = [];

  for (const row of rows) {
    const isEnriched = enrichedSet.has(row.id);
    const entry: ExperienceRow = {
      id: row.id,
      title: row.title,
      category: row.category,
      durationMinutes: row.durationMinutes,
      basePriceCents: row.basePriceCents,
      meetingPoints: (row.meetingPoints ?? []) as { lat: number; lng: number; label: string }[],
      enrichmentTier: isEnriched ? 'enriched' : 'basic',
      attributes: [],
    };

    if (isEnriched) {
      enrichedRows.push(entry);
    } else {
      basicRows.push(entry);
    }
  }

  // Load attributes for enriched products
  if (enrichedRows.length > 0) {
    const enrichedExpIds = enrichedRows.map((r) => r.id);
    const attrRows = await db
      .select()
      .from(attributes)
      .where(inArray(attributes.experienceId, enrichedExpIds));

    const attrMap = new Map<string, ExperienceRow['attributes']>();
    for (const a of attrRows) {
      if (!attrMap.has(a.experienceId)) attrMap.set(a.experienceId, []);
      attrMap.get(a.experienceId)!.push({
        key: a.key,
        value: a.value,
        confidence: a.confidence,
        evidence: a.evidence as ExperienceRow['attributes'][0]['evidence'],
        riskClass: a.riskClass,
      });
    }

    for (const row of enrichedRows) {
      row.attributes = attrMap.get(row.id) ?? [];
    }
  }

  // Assemble: enriched first, then basic (excluded if safety filters active)
  const results: ExperienceRow[] = [...enrichedRows];
  if (!opts.safetyFiltersActive) {
    results.push(...basicRows);
  }

  // Count stats across the full destination (unfiltered)
  const statsRows = await db.execute(sql`
    SELECT
      count(*) FILTER (WHERE id NOT LIKE ${FIXTURE_ID_PREFIX + '%'}) AS total,
      count(*) FILTER (WHERE id NOT LIKE ${FIXTURE_ID_PREFIX + '%'}
        AND id IN (SELECT DISTINCT experience_id FROM attribute
                   WHERE experience_id NOT LIKE ${FIXTURE_ID_PREFIX + '%'})) AS enriched
    FROM experience
    WHERE destination_slug = ${opts.destinationSlug}
  `);

  const total = Number(statsRows[0]?.total ?? 0);
  const enriched = Number(statsRows[0]?.enriched ?? 0);

  return {
    results: results.slice(0, limit),
    stats: {
      totalDestination: total,
      enriched,
      basic: total - enriched,
    },
  };
}
