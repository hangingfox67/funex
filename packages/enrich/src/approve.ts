import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { sql } from 'drizzle-orm';
import { parse as parseYaml } from 'yaml';
import { db as defaultDb, attributes } from '@funex/graph';
import type { ExtractionResult, BatchMetadata } from './extract.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const diffDir = resolve(__dirname, '..', 'diffs');

interface Correction {
  experience_id: string;
  attribute: string;
  value?: unknown;
  confidence?: number;
  note: string;
}

/**
 * Risk gate: determines whether a safety-class attribute serves as confirmed or unconfirmed.
 *
 * A safety attribute is CONFIRMED only if:
 *   - It has >=2 independent sources (V1: we only have one source, so this never passes), OR
 *   - inference_basis is "structural" AND confidence >= 0.9
 *   - A human correction was applied (gate_status forced to "confirmed")
 *
 * "unverified" basis (failed evidence check) — never gate-eligible.
 * A textual extraction from a single source with confidence 1.0 still serves as "unconfirmed".
 */
function passesSafetyGate(attr: {
  risk_class: string;
  confidence: number;
  inference_basis?: 'textual' | 'structural' | 'unverified';
}, evidenceCount: number): boolean {
  if (attr.risk_class !== 'safety') return true;
  if (attr.inference_basis === 'unverified') return false;
  if (evidenceCount >= 2) return true;
  if (attr.inference_basis === 'structural' && attr.confidence >= 0.9) return true;
  return false;
}

function loadCorrections(batchId: string): Map<string, Correction> {
  const correctionsPath = resolve(diffDir, `corrections-${batchId}.yaml`);
  if (!existsSync(correctionsPath)) return new Map();

  const raw = readFileSync(correctionsPath, 'utf-8');
  const parsed = parseYaml(raw) as Correction[];

  const map = new Map<string, Correction>();
  for (const c of parsed) {
    map.set(`${c.experience_id}.${c.attribute}`, c);
  }

  console.log(`Loaded ${map.size} correction(s) from corrections-${batchId}.yaml`);
  return map;
}

export async function approveBatch(
  batchId: string,
  db: typeof defaultDb = defaultDb,
): Promise<{ applied: number; skipped: number; unconfirmed: number; corrected: number }> {
  const jsonPath = resolve(diffDir, `${batchId}.json`);
  const raw = readFileSync(jsonPath, 'utf-8');
  const { results } = JSON.parse(raw) as {
    results: ExtractionResult[];
    metadata: BatchMetadata;
  };

  const corrections = loadCorrections(batchId);

  let applied = 0;
  let skipped = 0;
  let unconfirmed = 0;
  let corrected = 0;

  for (const result of results) {
    for (const [key, attr] of Object.entries(result.attributes)) {
      if (attr.value === null) {
        skipped++;
        continue;
      }

      // Check for human correction
      const correctionKey = `${result.experienceId}.${key}`;
      const correction = corrections.get(correctionKey);

      let value = attr.value;
      let confidence = attr.confidence;
      let evidenceEntries: Record<string, unknown>[] = [{
        source: 'enrichment',
        pointer: attr.evidence,
        inference_basis: attr.inference_basis ?? 'structural',
      }];

      if (correction) {
        if (correction.value !== undefined) value = correction.value;
        if (correction.confidence !== undefined) confidence = correction.confidence;
        evidenceEntries.push({
          source: 'human_correction',
          pointer: correction.note,
          inference_basis: 'textual',
        });
        corrected++;
        console.log(`  Correction applied: ${correctionKey} → ${JSON.stringify(value)} (${correction.note})`);
      }

      // Gate check: corrections count as a second source
      const evidenceCount = evidenceEntries.length;
      const confirmed = passesSafetyGate(
        { risk_class: attr.risk_class, confidence, inference_basis: attr.inference_basis },
        evidenceCount,
      );
      if (!confirmed) unconfirmed++;

      const storedEvidence = evidenceEntries.map((e, i) => ({
        ...e,
        gate_status: i === evidenceEntries.length - 1
          ? (confirmed ? 'confirmed' : 'unconfirmed')
          : undefined,
      }));

      await db
        .insert(attributes)
        .values({
          experienceId: result.experienceId,
          key,
          value: JSON.stringify(value),
          confidence,
          evidence: storedEvidence,
          riskClass: attr.risk_class,
        })
        .onConflictDoUpdate({
          target: [attributes.experienceId, attributes.key],
          set: {
            value: sql`EXCLUDED.value`,
            confidence: sql`EXCLUDED.confidence`,
            evidence: sql`EXCLUDED.evidence`,
            riskClass: sql`EXCLUDED.risk_class`,
            updatedAt: sql`now()`,
          },
        });

      applied++;
    }
  }

  // Mark diff as approved
  const mdPath = resolve(diffDir, `${batchId}.md`);
  const md = readFileSync(mdPath, 'utf-8');
  writeFileSync(
    mdPath,
    md.replace(
      /> \*\*Status:\*\* PENDING APPROVAL.*/,
      `> **Status:** APPROVED — ${applied} attributes applied (${unconfirmed} unconfirmed, ${corrected} human-corrected), ${skipped} skipped (null). Applied at ${new Date().toISOString()}.`,
    ),
    'utf-8',
  );

  return { applied, skipped, unconfirmed, corrected };
}
