/**
 * Admin dashboard pages — server-rendered HTML, mobile-first.
 */
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import postgres from 'postgres';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { isAuthenticated, registerAdminAuth } from './admin-auth.js';
import { layout } from './admin-layout.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const client = postgres(process.env.DATABASE_URL ?? 'postgresql://funex:funex@localhost:5432/funex');

function guard(request: FastifyRequest, reply: FastifyReply): boolean {
  if (!isAuthenticated(request)) {
    reply.redirect('/admin/login');
    return false;
  }
  return true;
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function registerAdminPages(app: FastifyInstance): void {
  registerAdminAuth(app);

  // ── PAGE 1: Funnel ──
  app.get('/admin', async (request, reply) => {
    if (!guard(request, reply)) return;

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const weekStart = new Date(now.getTime() - 7 * 86400000).toISOString();

    const [allTime] = await client`SELECT count(DISTINCT session_id) as sessions, count(*) FILTER (WHERE type='search') as searches, count(*) FILTER (WHERE type='click') as clicks, count(*) FILTER (WHERE type='booking') as bookings, coalesce(sum((payload->>'commission')::numeric) FILTER (WHERE type='booking'), 0) as revenue FROM event WHERE type IN ('search','click','booking')`;
    const [today] = await client`SELECT count(DISTINCT session_id) as sessions, count(*) FILTER (WHERE type='search') as searches, count(*) FILTER (WHERE type='click') as clicks FROM event WHERE type IN ('search','click') AND created_at >= ${todayStart}`;
    const [week] = await client`SELECT count(DISTINCT session_id) as sessions, count(*) FILTER (WHERE type='search') as searches, count(*) FILTER (WHERE type='click') as clicks FROM event WHERE type IN ('search','click') AND created_at >= ${weekStart}`;

    const events = await client`SELECT session_id, type, payload, created_at FROM event WHERE type IN ('search','click','get_experience','booking') ORDER BY created_at DESC LIMIT 30`;

    const products = await client`
      SELECT payload->>'experienceId' as exp_id,
        count(*) FILTER (WHERE type='search') as appearances,
        count(*) FILTER (WHERE type='click') as clicks,
        count(*) FILTER (WHERE type='booking') as bookings
      FROM event WHERE type IN ('click','booking') AND payload->>'experienceId' IS NOT NULL
      GROUP BY payload->>'experienceId' ORDER BY clicks DESC LIMIT 20`;

    const ctr = (s: number, c: number) => s > 0 ? (c / s * 100).toFixed(1) + '%' : '0%';

    const cardsHtml = `
<div class="cards">
  <div class="card"><div class="val">${today.sessions}</div><div class="lbl">Sessions today</div></div>
  <div class="card"><div class="val">${today.searches}</div><div class="lbl">Searches today</div></div>
  <div class="card"><div class="val">${today.clicks}</div><div class="lbl">Clicks today</div></div>
  <div class="card"><div class="val">${week.sessions}</div><div class="lbl">Sessions 7d</div></div>
  <div class="card"><div class="val">${ctr(Number(week.searches), Number(week.clicks))}</div><div class="lbl">CTR 7d</div></div>
  <div class="card"><div class="val">$${Number(allTime.revenue).toFixed(0)}</div><div class="lbl">Revenue all-time</div></div>
</div>`;

    const eventRows = events.map((e: any) => {
      const p = e.payload ?? {};
      const t = new Date(e.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
      const sid = String(e.session_id).substring(2, 10);
      let detail = '';
      if (e.type === 'search') detail = `${p.zone ?? '?'} ${p.date ?? ''} party:${Array.isArray(p.party) ? p.party.length : '?'}`;
      else if (e.type === 'click') detail = p.experienceId ?? '';
      else if (e.type === 'booking') detail = `${p.experienceId} $${p.commission}`;
      else detail = p.experienceId ?? '';

      const badge = e.type === 'click' ? 'badge-blue' : e.type === 'booking' ? 'badge-green' : e.type === 'search' ? 'badge-yellow' : '';
      return `<tr><td class="mono">${t}</td><td class="mono">${sid}</td><td><span class="badge ${badge}">${e.type}</span></td><td class="text-sm">${esc(detail)}</td></tr>`;
    }).join('');

    const productRows = products.map((p: any) =>
      `<tr><td class="mono">${esc(p.exp_id ?? '')}</td><td>${p.clicks}</td><td>${p.bookings}</td></tr>`,
    ).join('');

    const body = `
${cardsHtml}
<h2 class="text-sm text-muted mb">Live Events</h2>
<table><tr><th>Time</th><th>Session</th><th>Type</th><th>Detail</th></tr>${eventRows}</table>
<h2 class="text-sm text-muted mt mb">Product Performance</h2>
<table><tr><th>Experience</th><th>Clicks</th><th>Bookings</th></tr>${productRows}</table>
<script>setTimeout(()=>location.reload(),30000)</script>`;

    reply.type('text/html').send(layout('/admin', 'Funnel', body));
  });

  // ── PAGE 2: Baseline Tracker ──
  app.get('/admin/baseline', async (request, reply) => {
    if (!guard(request, reply)) return;

    let personas: any[] = [];
    try {
      personas = JSON.parse(readFileSync(resolve(__dirname, '..', '..', '..', 'fixtures', 'personas', 'personas.json'), 'utf-8'));
    } catch { /* empty */ }

    const rows = personas.map((p: any) => {
      const prompt = p.description;
      return `<tr>
<td class="mono">${p.id}</td>
<td class="text-sm">${esc(prompt)}<button class="copy-btn" onclick="navigator.clipboard.writeText('${esc(prompt).replace(/'/g, "\\'")}')">Copy</button></td>
<td><span class="toggle" onclick="this.classList.toggle('on')"></span></td>
<td><span class="toggle" onclick="this.classList.toggle('on')"></span></td>
<td><span class="toggle" onclick="this.classList.toggle('on')"></span></td>
<td><span class="toggle" onclick="this.classList.toggle('on')"></span></td>
</tr>`;
    }).join('');

    const body = `
<h2 class="text-sm text-muted mb">Persona Baseline (tap toggles — local state only)</h2>
<table>
<tr><th>ID</th><th>Prompt</th><th>Invoked</th><th>Link</th><th>Click</th><th>Claude</th></tr>
${rows}
</table>`;

    reply.type('text/html').send(layout('/admin/baseline', 'Baseline', body));
  });

  // ── PAGE 3: Conversions ──
  app.get('/admin/conversions', async (request, reply) => {
    if (!guard(request, reply)) return;

    const bookings = await client`
      SELECT session_id, payload->>'experienceId' as exp_id, payload->>'bookingRef' as ref,
        (payload->>'commission')::numeric as commission, payload->>'bookingDate' as dt, created_at
      FROM event WHERE type='booking' ORDER BY created_at DESC LIMIT 50`;

    const bookingRows = bookings.map((b: any) =>
      `<tr><td class="mono">${String(b.session_id).substring(2, 10)}</td><td class="mono">${b.exp_id}</td><td>${b.ref}</td><td>$${Number(b.commission).toFixed(2)}</td><td>${b.dt ?? ''}</td></tr>`,
    ).join('') || '<tr><td colspan="5" class="text-muted">No bookings yet</td></tr>';

    const body = `
<h2 class="text-sm text-muted mb">Upload Viator Partner CSV</h2>
<form method="POST" action="/admin/conversions/upload" enctype="multipart/form-data">
<div class="upload-box">
  <p class="text-muted">CSV: date, product_code, campaign, commission, currency, booking_ref</p>
  <input type="file" name="csv" accept=".csv">
  <br><button class="btn mt" type="submit">Import</button>
</div>
</form>
<h2 class="text-sm text-muted mt mb">Recent Bookings</h2>
<table><tr><th>Session</th><th>Experience</th><th>Ref</th><th>Commission</th><th>Date</th></tr>${bookingRows}</table>`;

    reply.type('text/html').send(layout('/admin/conversions', 'Conversions', body));
  });

  // Conversion CSV upload handler
  app.post('/admin/conversions/upload', async (request, reply) => {
    if (!guard(request, reply)) return;

    try {
      const data = await request.file();
      if (!data) {
        reply.redirect('/admin/conversions');
        return;
      }

      const buf = await data.toBuffer();
      const csv = buf.toString('utf-8');
      const lines = csv.trim().split('\n');
      if (lines.length < 2) { reply.redirect('/admin/conversions'); return; }

      const header = lines[0].split(',').map((h: string) => h.trim().toLowerCase().replace(/\s+/g, '_'));
      let imported = 0;

      for (const line of lines.slice(1)) {
        const vals = line.split(',').map((v: string) => v.trim());
        const row: Record<string, string> = {};
        for (let i = 0; i < header.length; i++) row[header[i]] = vals[i] ?? '';

        const sessionId = row.campaign;
        if (!sessionId?.startsWith('s_')) continue;

        const existingRef = await client`SELECT 1 FROM event WHERE type='booking' AND payload->>'bookingRef' = ${row.booking_ref} LIMIT 1`;
        if (existingRef.length > 0) continue;

        await client`INSERT INTO session (id) VALUES (${sessionId}) ON CONFLICT (id) DO NOTHING`;
        await client`INSERT INTO event (session_id, type, payload) VALUES (${sessionId}, 'booking', ${JSON.stringify({
          experienceId: 'exp_' + row.product_code,
          productCode: row.product_code,
          bookingRef: row.booking_ref,
          commission: parseFloat(row.commission) || 0,
          currency: row.currency || 'USD',
          bookingDate: row.date,
        })}::jsonb)`;
        imported++;
      }

      reply.redirect('/admin/conversions');
    } catch (err) {
      reply.type('text/html').send(layout('/admin/conversions', 'Error', `<p class="badge badge-red">Upload failed: ${esc(String(err))}</p><a href="/admin/conversions" class="btn mt">Back</a>`));
    }
  });

  // ── PAGE 4: Catalog Health ──
  app.get('/admin/catalog', async (request, reply) => {
    if (!guard(request, reply)) return;

    const [counts] = await client`
      SELECT
        count(*) FILTER (WHERE id NOT LIKE 'exp_phuket_%') as total_real,
        count(*) FILTER (WHERE id NOT LIKE 'exp_phuket_%' AND id IN (SELECT DISTINCT experience_id FROM attribute WHERE experience_id NOT LIKE 'exp_phuket_%')) as enriched
      FROM experience`;

    const enriched = Number(counts.enriched);
    const total = Number(counts.total_real);
    const basic = total - enriched;

    const demand = await client`
      SELECT payload->>'experienceIds' as ids, type, count(*) as cnt
      FROM event WHERE type IN ('demand.unenriched','demand.suppressed')
      GROUP BY payload->>'experienceIds', type ORDER BY cnt DESC LIMIT 10`;

    const [deadRails] = await client`SELECT count(*) as c FROM rail WHERE health = 'dead'`;

    const [zoneCount] = await client`SELECT count(*) as c FROM zone`;

    const body = `
<div class="cards">
  <div class="card"><div class="val">${enriched}</div><div class="lbl">Enriched</div></div>
  <div class="card"><div class="val">${basic}</div><div class="lbl">Basic</div></div>
  <div class="card"><div class="val">${total}</div><div class="lbl">Total</div></div>
  <div class="card"><div class="val">${zoneCount.c}</div><div class="lbl">Zones</div></div>
  <div class="card"><div class="val">${deadRails.c}</div><div class="lbl">Dead Rails</div></div>
  <div class="card"><div class="val">${Math.round(enriched / total * 100)}%</div><div class="lbl">Coverage</div></div>
</div>
<h2 class="text-sm text-muted mt mb">Demand Queue</h2>
<table><tr><th>Type</th><th>Count</th><th>IDs (sample)</th></tr>
${demand.map((d: any) => `<tr><td><span class="badge ${d.type === 'demand.suppressed' ? 'badge-red' : 'badge-yellow'}">${d.type.replace('demand.','')}</span></td><td>${d.cnt}</td><td class="mono text-sm">${esc(String(d.ids).substring(0, 60))}</td></tr>`).join('')}
</table>
<h2 class="text-sm text-muted mt mb">Schema Gap Queue</h2>
<p class="text-muted text-sm">Entries from TESTING-LOG.md with action=queued appear here.</p>
`;

    reply.type('text/html').send(layout('/admin/catalog', 'Catalog', body));
  });
}
