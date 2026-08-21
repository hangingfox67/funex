/**
 * Affiliate conversion import.
 *
 * Imports Viator partner conversions from CSV into the event log as
 * `booking` events, joined on campaign=sessionId.
 *
 * CSV format (Viator partner dashboard export):
 *   date,product_code,campaign,commission,currency,booking_ref
 *
 * Usage:
 *   pnpm ops:import-conversions -- /path/to/conversions.csv
 *
 * Idempotent: skips rows where booking_ref already exists in events.
 */
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
config({ path: resolve(dirname(fileURLToPath(import.meta.url)), '..', '.env'), override: true });

import { readFileSync } from 'fs';
import postgres from 'postgres';
const client = postgres(process.env.DATABASE_URL ?? 'postgresql://funex:funex@localhost:5432/funex');

interface ConversionRow {
  date: string;
  product_code: string;
  campaign: string;       // = our session ID
  commission: string;
  currency: string;
  booking_ref: string;
}

function parseCsv(raw: string): ConversionRow[] {
  const lines = raw.trim().split('\n');
  if (lines.length < 2) return [];

  const header = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/\s+/g, '_'));
  const rows: ConversionRow[] = [];

  for (const line of lines.slice(1)) {
    const vals = line.split(',').map((v) => v.trim());
    const row: Record<string, string> = {};
    for (let i = 0; i < header.length; i++) {
      row[header[i]] = vals[i] ?? '';
    }
    rows.push(row as unknown as ConversionRow);
  }

  return rows;
}

async function main() {
  const csvPath = process.argv.slice(2).filter((a) => a !== '--')[0];
  if (!csvPath) {
    console.error('Usage: pnpm ops:import-conversions -- /path/to/conversions.csv');
    console.error('\nExpected CSV columns: date, product_code, campaign, commission, currency, booking_ref');
    process.exit(1);
  }

  const raw = readFileSync(resolve(csvPath), 'utf-8');
  const rows = parseCsv(raw);
  console.log(`Parsed ${rows.length} conversion rows from ${csvPath}\n`);

  // Check for existing booking events to skip duplicates
  const existingRefs = await client`
    SELECT DISTINCT payload->>'booking_ref' as ref
    FROM event
    WHERE type = 'booking'
  `;
  const seenRefs = new Set(existingRefs.map((r: { ref: string }) => r.ref));

  let imported = 0;
  let skipped = 0;
  let noSession = 0;

  for (const row of rows) {
    // Skip duplicates
    if (seenRefs.has(row.booking_ref)) {
      skipped++;
      continue;
    }

    const sessionId = row.campaign;
    if (!sessionId || !sessionId.startsWith('s_')) {
      noSession++;
      continue;
    }

    const experienceId = `exp_${row.product_code}`;

    // Ensure session exists
    await client`
      INSERT INTO session (id) VALUES (${sessionId})
      ON CONFLICT (id) DO NOTHING
    `;

    await client`
      INSERT INTO event (session_id, type, payload)
      VALUES (${sessionId}, 'booking', ${JSON.stringify({
        experienceId,
        productCode: row.product_code,
        bookingRef: row.booking_ref,
        commission: parseFloat(row.commission) || 0,
        currency: row.currency || 'USD',
        bookingDate: row.date,
      })}::jsonb)
    `;

    imported++;
    console.log(`  ${row.booking_ref}: ${experienceId} (session ${sessionId.substring(0, 20)}...) $${row.commission}`);
  }

  console.log(`\nDone. ${imported} imported, ${skipped} duplicates skipped, ${noSession} no session ID.`);
  await client.end();
}

main().catch((err) => {
  console.error('Import failed:', err);
  process.exit(1);
});
