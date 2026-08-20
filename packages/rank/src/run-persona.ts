import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
config({ path: resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '.env'), override: true });

import { readFileSync } from 'fs';
import { rank } from './rank.js';
import { context } from '@funex/context';
import { db, client, searchExperiences } from '@funex/graph';

const __dirname = dirname(fileURLToPath(import.meta.url));
const personas = JSON.parse(readFileSync(resolve(__dirname, '..', '..', '..', 'fixtures', 'personas', 'personas.json'), 'utf-8'));

async function main() {
  const personaId = process.argv[2] ?? 'p01';
  const persona = personas.find((p: any) => p.id === personaId);
  if (!persona) { console.error('Unknown persona:', personaId); process.exit(1); }

  console.log(`\n=== ${persona.id}: ${persona.name} ===`);
  console.log(persona.description);
  console.log('');

  const ctx = await context('phuket', persona.request.stayingZone, persona.request.date ?? '2026-08-20');
  const safetyActive = !!(persona.request.requireNonSwimmerOk || persona.request.requirePregnantOk || persona.request.maxMobility);
  const { results } = await searchExperiences({ destinationSlug: 'phuket', safetyFiltersActive: safetyActive, limit: 2000, db });

  const result = rank(results, ctx, { ...persona.request, stayingZone: persona.request.stayingZone, date: persona.request.date ?? '2026-08-20', limit: 10 });

  console.log(`Context: ${ctx.weather.summary} | Sea: ${ctx.seaState.classification} | Season: ${ctx.season.season}`);
  console.log(`Input: ${result.totalInput} | Filtered: ${result.filtered.length} | Showing: ${result.candidates.length}`);
  console.log('');

  for (const [i, c] of result.candidates.entries()) {
    const mob = c.attributes.find(a => a.key === 'mobility')?.value ?? '?';
    const swim = c.attributes.find(a => a.key === 'non_swimmer_ok')?.value ?? '?';
    const preg = c.attributes.find(a => a.key === 'pregnant_ok')?.value ?? '?';
    const water = c.attributes.find(a => a.key === 'water_exposure')?.value ?? '?';
    const vessel = c.attributes.find(a => a.key === 'vessel_type')?.value ?? '?';

    console.log(`${String(i + 1).padStart(2)}. [${c.tier.toUpperCase().padEnd(9)}] ${c.title.substring(0, 55)}`);
    console.log(`    ${c.category} | ${c.priceThb ?? '?'} THB | ${c.durationMinutes ?? '?'} min | score=${c.score}`);
    console.log(`    mob=${mob} swim=${swim} preg=${preg} water=${water} vessel=${vessel}`);
    console.log(`    reasons: ${c.reasons.join(', ')}`);
    if (c.mobilityNote) console.log(`    note: ${c.mobilityNote.substring(0, 80)}`);
    if (c.bookingConstraints.length > 0) console.log(`    booking: ${c.bookingConstraints.join('; ').substring(0, 80)}`);
    console.log('');
  }

  await client.end();
}

main().catch(console.error);
