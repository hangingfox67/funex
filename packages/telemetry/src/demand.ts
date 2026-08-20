import type { EventWriter } from './events.js';

/**
 * Log demand for unenriched products served as basic results.
 */
export async function logDemand(
  writer: EventWriter,
  sessionId: string,
  experienceIds: string[],
  context: { query_category?: string; safety_filtered?: boolean },
): Promise<void> {
  if (experienceIds.length === 0) return;
  await writer.log(sessionId, 'demand.unenriched', {
    experienceIds,
    count: experienceIds.length,
    ...context,
  });
}

/**
 * Log suppressed demand — unenriched products that matched a query but were
 * excluded because safety filters were active. These outrank served demand
 * in the weekly enrichment proposal because the user got NO result for them.
 */
export async function logSuppressedDemand(
  writer: EventWriter,
  sessionId: string,
  experienceIds: string[],
  context: { query_category?: string },
): Promise<void> {
  if (experienceIds.length === 0) return;
  await writer.log(sessionId, 'demand.suppressed', {
    experienceIds,
    count: experienceIds.length,
    ...context,
  });
}
