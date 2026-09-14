/**
 * W2: Onboarding routes — parse prompt → prefilled form → profile persist.
 *
 * Flow:
 * 1. POST /web/parse — parse free text, return structured params
 * 2. GET /web/onboard — show prefilled form (after OAuth)
 * 3. POST /web/onboard — save profile + process original prompt
 */
import type { FastifyInstance } from 'fastify';
import postgres from 'postgres';
import { getUserIdFromCookie } from './web-auth.js';
import { parsePrompt } from './web-parse.js';
import { handleSearchExperiences } from './tools.js';
import { layout } from './admin-layout.js';

const client = postgres(process.env.DATABASE_URL ?? 'postgresql://funex:funex@localhost:5432/funex');

const ZONES = [
  { slug: 'kata', name: 'Kata' }, { slug: 'karon', name: 'Karon' },
  { slug: 'patong', name: 'Patong' }, { slug: 'kamala', name: 'Kamala' },
  { slug: 'bang_tao', name: 'Bang Tao' }, { slug: 'rawai', name: 'Rawai' },
  { slug: 'panwa', name: 'Cape Panwa' }, { slug: 'old_town', name: 'Phuket Town' },
  { slug: 'mai_khao', name: 'Mai Khao' }, { slug: 'khao_lak', name: 'Khao Lak' },
  { slug: 'ko_yao', name: 'Ko Yao' },
];

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function onboardPage(prefill: Record<string, unknown>, prompt: string): string {
  const party = (prefill.party ?? []) as { role: string; age?: number }[];
  const staying = (prefill.staying ?? '') as string;
  const constraints = (prefill.constraints ?? {}) as Record<string, unknown>;

  const partyRows = party.length > 0 ? party.map((p, i) =>
    `<div style="display:flex;gap:8px;margin-bottom:8px">
      <select name="party_role_${i}" style="flex:1;padding:10px;border:1px solid #ddd;border-radius:8px;font-size:1rem;background:#fff">
        <option value="adult" ${p.role === 'adult' ? 'selected' : ''}>Adult</option>
        <option value="child" ${p.role === 'child' ? 'selected' : ''}>Child</option>
        <option value="senior" ${p.role === 'senior' ? 'selected' : ''}>Senior</option>
      </select>
      <input type="number" name="party_age_${i}" value="${p.age ?? ''}" placeholder="Age" min="0" max="99" style="width:70px;padding:10px;border:1px solid #ddd;border-radius:8px;font-size:1rem">
    </div>`,
  ).join('') : `<div style="display:flex;gap:8px;margin-bottom:8px">
      <select name="party_role_0" style="flex:1;padding:10px;border:1px solid #ddd;border-radius:8px;font-size:1rem;background:#fff">
        <option value="adult" selected>Adult</option><option value="child">Child</option><option value="senior">Senior</option>
      </select>
      <input type="number" name="party_age_0" placeholder="Age" min="0" max="99" style="width:70px;padding:10px;border:1px solid #ddd;border-radius:8px;font-size:1rem">
    </div>`;

  const zoneOptions = ZONES.map((z) =>
    `<option value="${z.slug}" ${staying === z.slug ? 'selected' : ''}>${z.name}</option>`,
  ).join('');

  return `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1">
<title>Plan Your Trip — Thailand Fun Experiences</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'DM Sans',system-ui,-apple-system,sans-serif;background:#f8fafc;color:#1e293b;font-size:16px}
.header{background:#082f49;color:#38bdf8;padding:14px 16px;font-size:1.1rem;font-weight:600;font-family:'DM Sans',sans-serif}
.card{background:#fff;margin:12px;border-radius:12px;padding:20px;box-shadow:0 1px 3px rgba(0,0,0,.06)}
.card h2{font-size:1rem;color:#0c4a6e;margin-bottom:4px;font-weight:600}
.card p{font-size:.85rem;color:#94a3b8;margin-bottom:12px}
label{display:block;font-size:.85rem;font-weight:500;color:#475569;margin-bottom:4px;margin-top:12px}
select,input[type=text],input[type=number],input[type=date]{width:100%;padding:10px;border:1px solid #e2e8f0;border-radius:8px;font-size:1rem;background:#fff;color:#1e293b}
.check-row{display:flex;align-items:center;gap:8px;margin-top:8px}
.check-row input[type=checkbox]{width:20px;height:20px;accent-color:#0d9488}
.check-row label{margin:0;font-size:.9rem;color:#1e293b}
.btn{display:block;width:100%;padding:14px;border:none;border-radius:10px;background:#0d9488;color:#fff;font-size:1rem;font-weight:600;cursor:pointer;margin-top:16px}
.btn:active{background:#0c4a6e}
.parsed{background:#e0f2fe;border:1px solid #7dd3fc;border-radius:8px;padding:12px;margin-bottom:12px;font-size:.9rem;color:#0c4a6e}
</style></head><body>

<div class="header">Thailand Fun Experiences</div>

<form method="POST" action="/web/onboard">
<input type="hidden" name="prompt" value="${esc(prompt)}">

<div class="card">
  <div class="parsed">We got this from what you wrote — fill the gaps and we'll plan it.</div>
  <h2>Your party</h2>
  <p>Who's coming?</p>
  <div id="party-list">${partyRows}</div>
  <button type="button" onclick="addMember()" style="background:none;border:1px dashed #ccc;border-radius:8px;padding:8px;width:100%;color:#888;cursor:pointer;font-size:.85rem">+ Add person</button>
</div>

<div class="card">
  <h2>Where are you staying?</h2>
  <select name="staying">
    <option value="">Select area...</option>
    ${zoneOptions}
  </select>

  <label>Trip date</label>
  <input type="date" name="date" value="${esc(String(prefill.date ?? ''))}">

  <label>Budget per person (THB)</label>
  <input type="number" name="budgetThb" value="${prefill.budgetThb ?? ''}" placeholder="Optional">
</div>

<div class="card">
  <h2>Any special needs?</h2>
  <div class="check-row">
    <input type="checkbox" name="nonSwimmer" id="ns" ${constraints.nonSwimmer ? 'checked' : ''}>
    <label for="ns">Non-swimmer in party</label>
  </div>
  <div class="check-row">
    <input type="checkbox" name="pregnant" id="pg" ${constraints.pregnant ? 'checked' : ''}>
    <label for="pg">Pregnant traveler</label>
  </div>
  <div class="check-row">
    <input type="checkbox" name="motionLow" id="mc" ${constraints.motionComfort === 'low' ? 'checked' : ''}>
    <label for="mc">Sensitive to rough seas / bumpy rides</label>
  </div>

  <label>Mobility</label>
  <select name="mobility">
    <option value="">No limitation</option>
    <option value="moderate" ${constraints.mobility === 'moderate' ? 'selected' : ''}>Some walking difficulty</option>
    <option value="limited" ${constraints.mobility === 'limited' ? 'selected' : ''}>Wheelchair / very limited</option>
  </select>
</div>

<div class="card">
  <button class="btn" type="submit">Find activities</button>
</div>
</form>

<script>
let memberCount = ${party.length || 1};
function addMember() {
  const list = document.getElementById('party-list');
  const div = document.createElement('div');
  div.style = 'display:flex;gap:8px;margin-bottom:8px';
  div.innerHTML = '<select name="party_role_'+memberCount+'" style="flex:1;padding:10px;border:1px solid #ddd;border-radius:8px;font-size:1rem;background:#fff"><option value="adult">Adult</option><option value="child">Child</option><option value="senior">Senior</option></select><input type="number" name="party_age_'+memberCount+'" placeholder="Age" min="0" max="99" style="width:70px;padding:10px;border:1px solid #ddd;border-radius:8px;font-size:1rem">';
  list.appendChild(div);
  memberCount++;
}
</script>
</body></html>`;
}

export function registerOnboarding(app: FastifyInstance): void {

  // Parse a free-text prompt into structured params (API)
  app.post('/web/parse', async (request, reply) => {
    const body = request.body as { text?: string };
    if (!body.text) {
      reply.code(400).send({ error: 'Missing text' });
      return;
    }

    const today = new Date().toISOString().slice(0, 10);
    const parsed = await parsePrompt(body.text, today);
    reply.send(parsed);
  });

  // Show prefilled onboarding form
  app.get('/web/onboard', async (request, reply) => {
    const query = request.query as Record<string, string>;
    const prompt = query.prompt ?? '';

    let prefill: Record<string, unknown> = {};
    if (prompt) {
      const today = new Date().toISOString().slice(0, 10);
      prefill = await parsePrompt(prompt, today) as unknown as Record<string, unknown>;
    }

    reply.type('text/html').send(onboardPage(prefill, prompt));
  });

  // Process onboarding form submission
  app.post('/web/onboard', async (request, reply) => {
    const userId = getUserIdFromCookie(request);
    const body = request.body as Record<string, string>;

    // Collect party members from form
    const party: { role: string; age?: number }[] = [];
    for (let i = 0; i < 20; i++) {
      const role = body[`party_role_${i}`];
      if (!role) break;
      const age = body[`party_age_${i}`] ? parseInt(body[`party_age_${i}`]) : undefined;
      party.push({ role, age: (age && !isNaN(age)) ? age : undefined });
    }

    const profile = {
      party: party.length > 0 ? party : [{ role: 'adult' }],
      staying: body.staying || undefined,
      tripDates: body.date ? { from: body.date, to: body.date } : undefined,
      constraints: {
        nonSwimmer: body.nonSwimmer === 'on' || undefined,
        pregnant: body.pregnant === 'on' || undefined,
        mobility: body.mobility || undefined,
        motionComfort: body.motionLow === 'on' ? 'low' : undefined,
      },
      budgetThb: body.budgetThb ? parseInt(body.budgetThb) : undefined,
    };

    // Save profile if logged in
    if (userId) {
      await client`
        UPDATE funex_user SET profile = ${JSON.stringify(profile)}::jsonb, updated_at = now()
        WHERE id = ${userId}
      `;
    }

    // Process the search
    const searchParams: Record<string, unknown> = {
      destination: 'phuket',
      date: body.date || new Date().toISOString().slice(0, 10),
      staying: body.staying || 'patong',
      party: profile.party,
      constraints: {
        non_swimmer: profile.constraints.nonSwimmer,
        pregnant: profile.constraints.pregnant,
        mobility: profile.constraints.mobility,
        motion_comfort: profile.constraints.motionComfort,
      },
      budget_thb: profile.budgetThb,
      max_results: 4,
    };

    const results = await handleSearchExperiences(searchParams);
    const r = results as Record<string, unknown>;
    const candidates = (r.candidates ?? []) as Record<string, unknown>[];

    // Render results
    const reasonLabels: Record<string, string> = {
      sheltered_from_swell: '🌊 Sheltered bay',
      dry_window_match: '☀️ Dry slot',
      rain_safe: '🏠 Rain-proof',
      rain_risk_afternoon: '🌧 Afternoon rain risk',
      energy_match: '⚡ Energy match',
      age_fit: '👶 Age-appropriate',
      near_you: '📍 Nearby',
      far_for_its_length: '🚕 Long transfer',
      crowd_validated: '⭐ Highly rated',
      group_fit: '👨‍👩‍👧‍👦 Group-friendly',
      smooth_ride: '🛥 Smooth conditions',
    };

    const cards = candidates.map((c: any) => {
      const tags = (c.reasons ?? []).slice(0, 4).map((r: string) =>
        `<span style="display:inline-block;padding:3px 8px;border-radius:6px;font-size:.72rem;font-weight:500;background:#e0f2fe;color:#0c4a6e;margin-right:4px;margin-bottom:4px">${reasonLabels[r] ?? r}</span>`
      ).join('');

      return `
      <div style="background:#fff;margin:12px;border-radius:14px;padding:18px;box-shadow:0 1px 4px rgba(0,0,0,.06)">
        <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:8px">
          <div style="flex:1">
            <div style="font-size:1.05rem;font-weight:600;color:#0c4a6e;margin-bottom:2px">${esc(c.title)}</div>
            <div style="font-size:.82rem;color:#94a3b8">${esc(c.category)} · ${c.durationMinutes ?? '?'} min · ${c.price_per_person_thb ?? '?'} THB/person</div>
          </div>
          <span style="background:${c.tier === 'excellent' ? '#0d9488' : c.tier === 'good' ? '#0369a1' : '#94a3b8'};color:#fff;padding:3px 10px;border-radius:8px;font-size:.72rem;font-weight:600;flex-shrink:0;margin-left:8px">${c.tier}</span>
        </div>
        <div style="margin-bottom:8px">${tags}</div>
        ${c.mobilityNote ? `<div style="font-size:.8rem;color:#475569;background:#f8fafc;padding:8px 10px;border-radius:8px;margin-bottom:8px">Mobility: ${esc(c.mobilityNote).substring(0, 120)}</div>` : ''}
        ${c.book_now_url ? `<a href="${esc(c.book_now_url)}" target="_blank" style="display:block;text-align:center;padding:12px;background:#0d9488;color:#fff;border-radius:10px;font-weight:600;text-decoration:none;font-size:.95rem">Check availability and book</a>` : ''}
        ${c.booking_note ? `<div style="text-align:center;font-size:.75rem;color:#94a3b8;margin-top:4px">${esc(c.booking_note)}</div>` : ''}
      </div>`;
    }).join('');

    const weather = (r.context as any)?.weather?.summary ?? '';
    const sea = (r.context as any)?.seaState?.summary ?? '';
    const season = (r.context as any)?.season ?? '';

    reply.type('text/html').send(`<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1">
<title>Your Activities — Thailand Fun Experiences</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'DM Sans',system-ui,sans-serif;background:#f8fafc;color:#1e293b;font-size:16px}
.header{background:#082f49;color:#38bdf8;padding:14px 16px;font-size:1.1rem;font-weight:600}
</style></head><body>
<div class="header">Thailand Fun Experiences</div>
${weather || sea ? `<div style="background:#e0f2fe;border-bottom:1px solid #bae6fd;padding:12px 16px;display:flex;gap:16px;flex-wrap:wrap;font-size:.82rem;color:#0c4a6e">
  ${weather ? `<span>🌤 ${weather.split('.')[0]}</span>` : ''}
  ${sea ? `<span>🌊 ${sea.split('.')[0]}</span>` : ''}
  ${season ? `<span>📅 ${season} season</span>` : ''}
</div>` : ''}
<div style="padding:8px 0">
  <div style="padding:12px 16px;font-size:.85rem;color:#64748b">${candidates.length} activities matched your party</div>
  ${cards || '<div style="background:#fff;margin:12px;border-radius:14px;padding:24px;text-align:center;color:#94a3b8">No activities match your criteria. Try adjusting your filters.</div>'}
</div>
<a href="/web/onboard" style="display:block;text-align:center;padding:14px;color:#0c4a6e;font-size:.9rem;font-weight:500;text-decoration:none">← Adjust search</a>
</body></html>`);
  });
}
