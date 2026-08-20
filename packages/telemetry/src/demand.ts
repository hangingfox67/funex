import type { EventWriter } from './events.js';

/**
 * Log a demand event when an unenriched product is served as a basic result.
 * The weekly demand-batch proposal script reads these to prioritize enrichment.
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
