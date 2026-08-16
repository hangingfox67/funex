import { randomUUID } from 'crypto';
import { sql } from 'drizzle-orm';
import type { db as Db } from '@funex/graph';

export function createSessionId(): string {
  return `s_${randomUUID()}`;
}

export async function ensureSession(
  db: typeof Db,
  sessionId: string,
  destinationSlug?: string,
): Promise<void> {
  await db.execute(sql`
    INSERT INTO session (id, destination_slug)
    VALUES (${sessionId}, ${destinationSlug ?? null})
    ON CONFLICT (id) DO NOTHING
  `);
}
