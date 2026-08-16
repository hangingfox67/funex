import { eq, and } from 'drizzle-orm';
import { rails, providerMappings, db as defaultDb } from '@funex/graph';

export interface BookingUrlResult {
  url: string;
  provider: string;
  payoutModel: string;
  rate: number;
}

/**
 * Build a session-tagged booking URL for a given provider product.
 * V1: Viator only. URL format follows Viator deep-link pattern.
 */
export function buildBookingUrl(
  rail: { provider: string; payoutModel: string; rate: number },
  providerProductId: string,
  sessionId: string,
): BookingUrlResult {
  // V1: Viator affiliate deep link
  const url = `https://www.viator.com/tours/Phuket/${providerProductId}?sid=${sessionId}&pid=P00000000`;
  return {
    url,
    provider: rail.provider,
    payoutModel: rail.payoutModel,
    rate: rail.rate,
  };
}

/**
 * Route an experience to its best booking URL.
 * Picks the highest-priority active rail, resolves the provider product ID,
 * and returns a session-tagged URL.
 */
export async function routeExperience(
  experienceId: string,
  sessionId: string,
  db: typeof defaultDb = defaultDb,
): Promise<BookingUrlResult | null> {
  // Find active rails for this experience, ordered by priority desc
  const activeRails = await db
    .select()
    .from(rails)
    .where(and(eq(rails.experienceId, experienceId), eq(rails.health, 'active')))
    .orderBy(rails.priority);

  if (activeRails.length === 0) return null;

  // Pick the best rail (highest priority; V1: there's only one)
  const bestRail = activeRails[activeRails.length - 1];

  // Resolve provider product ID
  const mappings = await db
    .select()
    .from(providerMappings)
    .where(
      and(
        eq(providerMappings.experienceId, experienceId),
        eq(providerMappings.provider, bestRail.provider),
      ),
    );

  if (mappings.length === 0) return null;

  return buildBookingUrl(bestRail, mappings[0].providerProductId, sessionId);
}
