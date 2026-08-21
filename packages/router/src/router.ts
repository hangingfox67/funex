import { eq, and } from 'drizzle-orm';
import { rails, providerMappings, experiences, db as defaultDb, isFixture } from '@funex/graph';

export interface BookingUrlResult {
  url: string;
  redirectUrl: string;
  provider: string;
  payoutModel: string;
  rate: number;
}

const PHUKET_DEST_ID = '349';

/**
 * Generate a Viator-compatible URL slug from a product title.
 * E.g. "Twilight Sea Canoe Tour with Sea Cave Kayaking" →
 *      "Twilight-Sea-Canoe-Tour-with-Sea-Cave-Kayaking"
 */
function titleToSlug(title: string): string {
  return title
    .replace(/[^a-zA-Z0-9\s-]/g, '')  // remove special chars
    .replace(/\s+/g, '-')              // spaces → hyphens
    .replace(/-+/g, '-')               // collapse multiple hyphens
    .replace(/^-|-$/g, '')             // trim leading/trailing
    .substring(0, 100);                // cap length
}

/**
 * Build a session-tagged booking URL for a given provider product.
 * V1: Viator only. Uses canonical URL: /tours/Phuket/{Slug}/d{destId}-{productCode}
 */
export function buildBookingUrl(
  rail: { provider: string; payoutModel: string; rate: number },
  providerProductId: string,
  sessionId: string,
  experienceId: string,
  title: string,
): BookingUrlResult {
  const slug = titleToSlug(title);
  const url = `https://www.viator.com/tours/Phuket/${slug}/d${PHUKET_DEST_ID}-${providerProductId}?sid=${sessionId}&pid=P00000000&campaign=${sessionId}`;
  const redirectUrl = `/r/${sessionId}/${experienceId}`;
  return {
    url,
    redirectUrl,
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
  if (isFixture(experienceId)) return null;

  const activeRails = await db
    .select()
    .from(rails)
    .where(and(eq(rails.experienceId, experienceId), eq(rails.health, 'active')))
    .orderBy(rails.priority);

  if (activeRails.length === 0) return null;

  const bestRail = activeRails[activeRails.length - 1];

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

  // Get title for slug generation
  const [exp] = await db
    .select({ title: experiences.title })
    .from(experiences)
    .where(eq(experiences.id, experienceId));

  const title = exp?.title ?? mappings[0].providerProductId;

  return buildBookingUrl(bestRail, mappings[0].providerProductId, sessionId, experienceId, title);
}
