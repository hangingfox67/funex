import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { sql } from 'drizzle-orm';
import { parse as parseYaml } from 'yaml';
import { db as defaultDb, attributes } from '@funex/graph';
import type { ExtractionResult, BatchMetadata } from './extract.js';
import { applyDanRules, checkVenueConsistency } from './dan-rules.js';

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
): Promise<{ applied: number; skipped: number; unconfirmed: number; corrected: number; danRulesApplied: number; textualConflicts: { experienceId: string; attribute: string; extractedValue: unknown; extractedEvidence: string; ruleValue: unknown; ruleNote: string }[] }> {
  const jsonPath = resolve(diffDir, `${batchId}.json`);
  const raw = readFileSync(jsonPath, 'utf-8');
  const { results } = JSON.parse(raw) as {
    results: ExtractionResult[];
    metadata: BatchMetadata;
  };

  const corrections = loadCorrections(batchId);

  let applied = 0;
  let skipped = 0;
  const textualConflicts: { experienceId: string; attribute: string; extractedValue: unknown; extractedEvidence: string; ruleValue: unknown; ruleNote: string }[] = [];
  let unconfirmed = 0;
  let corrected = 0;

  // ── Dan-rules: build per-product rule map with precedence ──
  const danRuleMap = new Map<string, Map<string, { value: unknown; confidence: number; note: string }>>();
  let danRulesApplied = 0;
  for (const result of results) {
    const { applied: ruleApps, overrideLog } = applyDanRules(result.title, result.attributes.group_type ? 'activity' : 'activity');
    if (ruleApps.length > 0) {
      const attrMap = new Map<string, { value: unknown; confidence: number; note: string }>();
      for (const r of ruleApps) {
        attrMap.set(r.attribute, { value: r.value, confidence: r.confidence, note: r.note });
      }
      danRuleMap.set(result.experienceId, attrMap);
    }
    for (const log of overrideLog) {
      console.log(`  RULE PRECEDENCE (${result.experienceId}): ${log}`);
    }
  }

  // ── Venue consistency check ──
  const consistencyWarnings = checkVenueConsistency(results);
  if (consistencyWarnings.length > 0) {
    console.log(`\n  ── Venue Consistency Warnings ──`);
    for (const w of consistencyWarnings) {
      console.warn(`  ${w}`);
    }
    console.log('');
  }

  for (const result of results) {
    for (const [key, attr] of Object.entries(result.attributes)) {
      if (attr.value === null) {
        skipped++;
        continue;
      }

      // Check for human correction
      const correctionKey = `${result.experienceId}.${key}`;
      const correction = corrections.get(correctionKey);

      let value: unknown = attr.value;
      let confidence = attr.confidence;
      let evidenceEntries: { source: string; pointer: string; inference_basis: string; gate_status?: string }[] = [{
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

      // Apply Dan-rules (corroboration layer)
      // Policy: structural-basis extractions overridden silently.
      //         textual-basis conflicts flagged for human review, never auto-resolved.
      const danRules = danRuleMap.get(result.experienceId);
      if (danRules && danRules.has(key) && !correction) {
        const rule = danRules.get(key)!;
        const isConflict = JSON.stringify(attr.value) !== JSON.stringify(rule.value);

        if (isConflict && (attr.inference_basis === 'textual')) {
          // Textual conflict: the LLM found evidence in the text that disagrees with the rule.
          // Flag for human review — do NOT override.
          textualConflicts.push({
            experienceId: result.experienceId,
            attribute: key,
            extractedValue: attr.value,
            extractedEvidence: attr.evidence,
            ruleValue: rule.value,
            ruleNote: rule.note,
          });
          // Still add rule as corroboration source but keep extracted value
          evidenceEntries.push({
            source: 'operator-local-knowledge',
            pointer: `CONFLICT — rule says ${JSON.stringify(rule.value)}: ${rule.note}`,
            inference_basis: 'textual',
          });
        } else {
          // Structural or agreeing: override silently
          value = rule.value;
          confidence = Math.max(confidence, rule.confidence);
          evidenceEntries.push({
            source: 'operator-local-knowledge',
            pointer: rule.note,
            inference_basis: 'textual',
          });
        }
        danRulesApplied++;
      }

      // Gate check: corrections count as a second source
      const evidenceCount = evidenceEntries.length;
      const confirmed = passesSafetyGate(
        { risk_class: attr.risk_class, confidence, inference_basis: attr.inference_basis },
        evidenceCount,
      );
      if (!confirmed) unconfirmed++;

      for (const [i, e] of evidenceEntries.entries()) {
        e.gate_status = i === evidenceEntries.length - 1
          ? (confirmed ? 'confirmed' : 'unconfirmed')
          : undefined;
      }

      await db
        .insert(attributes)
        .values({
          experienceId: result.experienceId,
          key,
          value: JSON.stringify(value),
          confidence,
          evidence: evidenceEntries,
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
      `> **Status:** APPROVED — ${applied} attributes applied (${unconfirmed} unconfirmed, ${corrected} human-corrected, ${danRulesApplied} dan-rules), ${skipped} skipped (null). Applied at ${new Date().toISOString()}.`,
    ),
    'utf-8',
  );

  return { applied, skipped, unconfirmed, corrected, danRulesApplied, textualConflicts };
}
