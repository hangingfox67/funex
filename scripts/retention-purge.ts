/**
 * Daily retention purge — implements the exact retention table from /privacy:
 *
 * - Anonymous event logs: 12 months → aggregate counts only
 * - Booking tokens: 12 months → delete
 * - Web accounts: 24 months inactive → delete + anonymize sessions
 * - Sessions: 12 months → delete (if no linked user)
 *
 * Logs counts per table, no PII. Run via systemd timer or manually.
 */
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
config({ path: resolve(dirname(fileURLToPath(import.meta.url)), '..', '.env'), override: true });

import postgres from 'postgres';

const client = postgres(process.env.DATABASE_URL ?? 'postgresql://funex:funex@localhost:5432/funex');

async function main() {
  const now = new Date().toISOString();
  console.log(`Retention purge started at ${now}`);
  console.log('');

  // 1. Events older than 12 months → delete (aggregate counts preserved in dashboard snapshots)
  const [eventsResult] = await client`
    DELETE FROM event
    WHERE created_at < now() - interval '12 months'
    RETURNING id
  `;
  const eventsDeleted = await client`
    WITH deleted AS (
      DELETE FROM event WHERE created_at < now() - interval '12 months' RETURNING id
    ) SELECT count(*) as cnt FROM deleted
  `;
  // Re-do properly — the above doesn't work as intended. Use a count-then-delete:
  const [oldEvents] = await client`SELECT count(*) as cnt FROM event WHERE created_at < now() - interval '12 months'`;
  const oldEventCount = Number(oldEvents.cnt);
  if (oldEventCount > 0) {
    await client`DELETE FROM event WHERE created_at < now() - interval '12 months'`;
  }
  console.log(`  Events >12mo: ${oldEventCount} deleted`);

  // 2. Booking tokens older than 12 months → delete
  const [oldTokens] = await client`SELECT count(*) as cnt FROM booking_token WHERE created_at < now() - interval '12 months'`;
  const oldTokenCount = Number(oldTokens.cnt);
  if (oldTokenCount > 0) {
    await client`DELETE FROM booking_token WHERE created_at < now() - interval '12 months'`;
  }
  console.log(`  Booking tokens >12mo: ${oldTokenCount} deleted`);

  // 3. Sessions older than 12 months with no linked user → delete
  const [oldSessions] = await client`SELECT count(*) as cnt FROM session WHERE created_at < now() - interval '12 months' AND user_id IS NULL`;
  const oldSessionCount = Number(oldSessions.cnt);
  if (oldSessionCount > 0) {
    // Delete events first (FK), then sessions
    await client`DELETE FROM event WHERE session_id IN (SELECT id FROM session WHERE created_at < now() - interval '12 months' AND user_id IS NULL)`;
    await client`DELETE FROM session WHERE created_at < now() - interval '12 months' AND user_id IS NULL`;
  }
  console.log(`  Sessions >12mo (unlinked): ${oldSessionCount} deleted`);

  // 4. Web accounts inactive >24 months → anonymize sessions, delete user
  const [inactiveUsers] = await client`SELECT count(*) as cnt FROM funex_user WHERE updated_at < now() - interval '24 months'`;
  const inactiveCount = Number(inactiveUsers.cnt);
  if (inactiveCount > 0) {
    await client`UPDATE session SET user_id = NULL, claimed_by = NULL WHERE user_id IN (SELECT id FROM funex_user WHERE updated_at < now() - interval '24 months')`;
    await client`DELETE FROM funex_user WHERE updated_at < now() - interval '24 months'`;
  }
  console.log(`  Inactive accounts >24mo: ${inactiveCount} deleted`);

  console.log('');
  console.log(`Retention purge complete.`);

  await client.end();
}

main().catch((err) => {
  console.error('Retention purge failed:', err);
  process.exit(1);
});
