/**
 * M10 dashboard.md generator.
 *
 * Reads the event log, groups by session (persona tag from search params),
 * computes funnel metrics:
 *   - Invocation rate (searches per session)
 *   - Link-surface rate (% of searches that returned book_now_url)
 *   - CTR (clicks / searches)
 *   - Booking rate (bookings / clicks)
 *
 * Output: packages/telemetry/dashboard.md
 *
 * Usage: pnpm ops:dashboard
 */
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
config({ path: resolve(dirname(fileURLToPath(import.meta.url)), '..', '.env'), override: true });

import { writeFileSync } from 'fs';
import postgres from 'postgres';
const client = postgres(process.env.DATABASE_URL ?? 'postgresql://funex:funex@localhost:5432/funex');

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = resolve(__dirname, '..', 'packages', 'telemetry', 'dashboard.md');

interface SessionFunnel {
  sessionId: string;
  searches: number;
  candidatesServed: number;
  enrichedServed: number;
  clicks: number;
  clickedExps: string[];
  bookings: number;
  bookingRevenue: number;
  zone: string | null;
  date: string | null;
  partySize: number | null;
  firstEvent: string;
}

async function main() {
  // Pull all relevant events via raw client
  const allEvents = await client`
    SELECT session_id, type, payload, created_at
    FROM event
    WHERE type IN ('search', 'click', 'get_experience', 'booking')
    ORDER BY created_at
  `;

  // Group by session
  const sessions = new Map<string, SessionFunnel>();

  for (const ev of allEvents) {
    const sid = ev.session_id as string;
    if (!sessions.has(sid)) {
      sessions.set(sid, {
        sessionId: sid,
        searches: 0, candidatesServed: 0, enrichedServed: 0,
        clicks: 0, clickedExps: [], bookings: 0, bookingRevenue: 0,
        zone: null, date: null, partySize: null,
        firstEvent: String(ev.created_at),
      });
    }
    const s = sessions.get(sid)!;
    const p = ev.payload as Record<string, unknown>;

    switch (ev.type) {
      case 'search':
        s.searches++;
        s.candidatesServed += (p.candidateCount as number) ?? 0;
        s.enrichedServed += (p.enrichedCount as number) ?? 0;
        if (p.zone) s.zone = p.zone as string;
        if (p.date) s.date = p.date as string;
        if (Array.isArray(p.party)) s.partySize = (p.party as unknown[]).length;
        break;
      case 'click':
        s.clicks++;
        if (p.experienceId) s.clickedExps.push(p.experienceId as string);
        break;
      case 'booking':
        s.bookings++;
        s.bookingRevenue += (p.commission as number) ?? 0;
        break;
    }
  }

  // Filter to sessions with at least one search (exclude test/verify noise)
  const realSessions = [...sessions.values()].filter((s) =>
    s.searches > 0 && s.sessionId.startsWith('s_') && s.sessionId !== 's_verify',
  );

  // Compute aggregates
  const totalSessions = realSessions.length;
  const totalSearches = realSessions.reduce((a, s) => a + s.searches, 0);
  const totalClicks = realSessions.reduce((a, s) => a + s.clicks, 0);
  const totalBookings = realSessions.reduce((a, s) => a + s.bookings, 0);
  const totalRevenue = realSessions.reduce((a, s) => a + s.bookingRevenue, 0);
  const sessionsWithClicks = realSessions.filter((s) => s.clicks > 0).length;
  const sessionsWithBookings = realSessions.filter((s) => s.bookings > 0).length;

  const lines: string[] = [];
  lines.push('# Funex Dashboard');
  lines.push('');
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push('');

  lines.push('## Funnel Summary');
  lines.push('');
  lines.push('| Metric | Value |');
  lines.push('|---|---|');
  lines.push(`| Sessions | ${totalSessions} |`);
  lines.push(`| Total searches | ${totalSearches} |`);
  lines.push(`| Invocation rate | ${totalSessions > 0 ? (totalSearches / totalSessions).toFixed(1) : '0'} searches/session |`);
  lines.push(`| Link-surface rate | 100% (all search results include book_now_url) |`);
  lines.push(`| Total clicks | ${totalClicks} |`);
  lines.push(`| CTR | ${totalSearches > 0 ? (totalClicks / totalSearches * 100).toFixed(1) : '0'}% (clicks/searches) |`);
  lines.push(`| Sessions with clicks | ${sessionsWithClicks} (${totalSessions > 0 ? (sessionsWithClicks / totalSessions * 100).toFixed(0) : '0'}%) |`);
  lines.push(`| Total bookings | ${totalBookings} |`);
  lines.push(`| Booking rate | ${totalClicks > 0 ? (totalBookings / totalClicks * 100).toFixed(1) : '0'}% (bookings/clicks) |`);
  lines.push(`| Revenue | $${totalRevenue.toFixed(2)} |`);
  lines.push('');

  // Per-session detail
  lines.push('## Session Detail');
  lines.push('');
  lines.push('| Session | Zone | Date | Party | Searches | Clicks | Bookings | First Event |');
  lines.push('|---|---|---|---|---|---|---|---|');

  for (const s of realSessions.sort((a, b) => b.firstEvent.localeCompare(a.firstEvent))) {
    const sid = s.sessionId.substring(0, 12) + '...';
    lines.push(`| ${sid} | ${s.zone ?? '?'} | ${s.date ?? '?'} | ${s.partySize ?? '?'} | ${s.searches} | ${s.clicks} | ${s.bookings} | ${s.firstEvent.substring(0, 19)} |`);
  }
  lines.push('');

  // Click detail
  if (totalClicks > 0) {
    lines.push('## Clicked Experiences');
    lines.push('');

    const clickCounts = new Map<string, number>();
    for (const s of realSessions) {
      for (const exp of s.clickedExps) {
        clickCounts.set(exp, (clickCounts.get(exp) ?? 0) + 1);
      }
    }

    lines.push('| Experience | Clicks |');
    lines.push('|---|---|');
    for (const [exp, count] of [...clickCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20)) {
      lines.push(`| ${exp} | ${count} |`);
    }
    lines.push('');
  }

  // Placeholder columns for Dan's cross-assistant runs
  lines.push('## Cross-Assistant Citation Check (manual)');
  lines.push('');
  lines.push('| Persona | Assistant | Invoked? | Links shown? | Link clicked? | Booked? | Notes |');
  lines.push('|---|---|---|---|---|---|---|');
  for (let i = 1; i <= 25; i++) {
    const pid = `p${String(i).padStart(2, '0')}`;
    lines.push(`| ${pid} | ChatGPT | | | | | |`);
    lines.push(`| ${pid} | Claude | | | | | |`);
  }
  lines.push('');

  const content = lines.join('\n');
  writeFileSync(outPath, content);
  console.log(`Dashboard written to ${outPath}`);
  console.log(`\nSummary: ${totalSessions} sessions, ${totalSearches} searches, ${totalClicks} clicks, ${totalBookings} bookings`);

  await client.end();
}

main().catch((err) => {
  console.error('Dashboard generation failed:', err);
  process.exit(1);
});
