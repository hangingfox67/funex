import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { sql, eq } from 'drizzle-orm';
import { parse as parseYaml } from 'yaml';
import { db as defaultDb, attributes, providerMappings } from '@funex/graph';
import type { ExtractionResult, BatchMetadata } from './extract.js';
import { applyDanRules, checkVenueConsistency } from './dan-rules.js';
import { getOperatorTerms } from './operator-terms.js';
import { deriveFromViatorMetadata, deriveSeasicknessRisk } from './viator-structured.js';

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
 * Precedence hierarchy (highest wins):
 *   1. human_correction — Dan's per-attribute corrections file
 *   2. operator_terms — verified T&C from specific operators
 *   3. viator_structured — Viator additionalInfo flags (supplier-declared)
 *   4. dan-rules — category/venue-level local knowledge
 *   5. derived — formula-computed (e.g. seasickness from vessel×exposure)
 *   6. extraction — LLM structural/textual inference (base)
 *
 * Conflict policy:
 *   - Higher-precedence sources override lower silently for structural-basis attrs.
 *   - declared-vs-rule head-on conflicts (viator_structured vs dan-rules) get flagged.
 *   - Textual extraction conflicts with any rule get flagged.
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

export interface ApprovalResult {
  applied: number;
  skipped: number;
  unconfirmed: number;
  corrected: number;
  danRulesApplied: number;
  viatorStructuredApplied: number;
  operatorTermsApplied: number;
  derivedApplied: number;
  textualConflicts: { experienceId: string; attribute: string; extractedValue: unknown; extractedEvidence: string; ruleValue: unknown; ruleNote: string; ruleSource: string }[];
  declaredVsRuleConflicts: { experienceId: string; attribute: string; declared: unknown; declaredSource: string; rule: unknown; ruleSource: string }[];
}

export async function approveBatch(
  batchId: string,
  db: typeof defaultDb = defaultDb,
): Promise<ApprovalResult> {
  const jsonPath = resolve(diffDir, `${batchId}.json`);
  const raw = readFileSync(jsonPath, 'utf-8');
  const { results } = JSON.parse(raw) as {
    results: ExtractionResult[];
    metadata: BatchMetadata;
  };

  const corrections = loadCorrections(batchId);

  const stats: ApprovalResult = {
    applied: 0, skipped: 0, unconfirmed: 0, corrected: 0,
    danRulesApplied: 0, viatorStructuredApplied: 0, operatorTermsApplied: 0, derivedApplied: 0,
    textualConflicts: [], declaredVsRuleConflicts: [],
  };

  // ── Pre-compute all source layers ──

  // Resolve product codes for viator_structured lookups
  const expToProduct = new Map<string, string>();
  for (const result of results) {
    const [mapping] = await db
      .select({ code: providerMappings.providerProductId })
      .from(providerMappings)
      .where(eq(providerMappings.experienceId, result.experienceId));
    if (mapping) expToProduct.set(result.experienceId, mapping.code);
  }

  // Dan-rules
  const danRuleMap = new Map<string, Map<string, { value: unknown; confidence: number; note: string }>>();
  for (const result of results) {
    const { applied: ruleApps, overrideLog } = applyDanRules(result.title, result.attributes.group_type ? 'activity' : 'activity');
    if (ruleApps.length > 0) {
      const attrMap = new Map<string, { value: unknown; confidence: number; note: string }>();
      for (const r of ruleApps) attrMap.set(r.attribute, { value: r.value, confidence: r.confidence, note: r.note });
      danRuleMap.set(result.experienceId, attrMap);
    }
    for (const log of overrideLog) console.log(`  RULE PRECEDENCE (${result.experienceId}): ${log}`);
  }

  // Venue consistency
  const consistencyWarnings = checkVenueConsistency(results);
  if (consistencyWarnings.length > 0) {
    console.log(`\n  ── Venue Consistency Warnings ──`);
    for (const w of consistencyWarnings) console.warn(`  ${w}`);
    console.log('');
  }

  // ── Process each attribute ──

  for (const result of results) {
    const productCode = expToProduct.get(result.experienceId);
    const opTerms = getOperatorTerms(result.experienceId);
    const viatorOverrides = productCode ? deriveFromViatorMetadata(productCode) : [];
    const danRules = danRuleMap.get(result.experienceId);

    // Build per-attribute override map from each source
    const opTermMap = new Map(opTerms.map((o) => [o.attribute, o]));
    const viatorMap = new Map(viatorOverrides.map((o) => [o.attribute, o]));

    // Derive seasickness from current vessel_type × water_exposure
    // (after all overrides applied to those attrs)
    const resolveAttr = (key: string): unknown => {
      if (opTermMap.has(key)) return opTermMap.get(key)!.value;
      if (viatorMap.has(key)) return viatorMap.get(key)!.value;
      if (danRules?.has(key)) return danRules.get(key)!.value;
      return result.attributes[key]?.value;
    };

    for (const [key, attr] of Object.entries(result.attributes)) {
      if (attr.value === null) {
        stats.skipped++;
        continue;
      }

      const correctionKey = `${result.experienceId}.${key}`;
      const correction = corrections.get(correctionKey);

      let value: unknown = attr.value;
      let confidence = attr.confidence;
      let evidenceEntries: { source: string; pointer: string; inference_basis: string; gate_status?: string }[] = [{
        source: 'enrichment',
        pointer: (attr.evidence ?? '').substring(0, 200),
        inference_basis: attr.inference_basis ?? 'structural',
      }];
      let overrideSource: string | null = null;

      // ── Layer 6 (base): extraction value already set ──

      // ── Layer 5: derived (seasickness_risk) ──
      if (key === 'seasickness_risk') {
        const vesselVal = resolveAttr('vessel_type') as string | null;
        const waterVal = resolveAttr('water_exposure') as string | null;
        const derived = deriveSeasicknessRisk(vesselVal, waterVal);
        if (derived) {
          value = derived.value;
          confidence = 0.95;
          evidenceEntries.push({ source: 'derived', pointer: derived.evidence, inference_basis: 'structural' });
          overrideSource = 'derived';
          stats.derivedApplied++;
        }
      }

      // ── Layer 4: Dan-rules ──
      if (danRules?.has(key) && !correction) {
        const rule = danRules.get(key)!;
        const isConflict = JSON.stringify(value) !== JSON.stringify(rule.value);

        if (isConflict && attr.inference_basis === 'textual') {
          stats.textualConflicts.push({
            experienceId: result.experienceId, attribute: key,
            extractedValue: attr.value, extractedEvidence: attr.evidence,
            ruleValue: rule.value, ruleNote: rule.note, ruleSource: 'dan-rules',
          });
          evidenceEntries.push({ source: 'operator-local-knowledge', pointer: `CONFLICT — rule says ${JSON.stringify(rule.value)}: ${rule.note}`, inference_basis: 'textual' });
        } else {
          value = rule.value;
          confidence = Math.max(confidence, rule.confidence);
          evidenceEntries.push({ source: 'operator-local-knowledge', pointer: rule.note, inference_basis: 'textual' });
          overrideSource = 'dan-rules';
        }
        stats.danRulesApplied++;
      }

      // ── Layer 3: viator_structured (beats dan-rules) ──
      if (viatorMap.has(key) && !correction) {
        const vs = viatorMap.get(key)!;
        const danRule = danRules?.get(key);

        // Flag declared-vs-rule head-on conflicts
        if (danRule && JSON.stringify(vs.value) !== JSON.stringify(danRule.value)) {
          stats.declaredVsRuleConflicts.push({
            experienceId: result.experienceId, attribute: key,
            declared: vs.value, declaredSource: 'viator_structured',
            rule: danRule.value, ruleSource: 'dan-rules',
          });
          console.log(`  DECLARED-VS-RULE: ${result.experienceId}.${key}: viator=${JSON.stringify(vs.value)} vs dan-rule=${JSON.stringify(danRule.value)}`);
        }

        value = vs.value;
        confidence = Math.max(confidence, vs.confidence);
        evidenceEntries.push({ source: 'viator_structured', pointer: vs.evidence, inference_basis: 'textual' });
        overrideSource = 'viator_structured';
        stats.viatorStructuredApplied++;
      }

      // ── Layer 2: operator_terms (beats viator_structured) ──
      if (opTermMap.has(key) && !correction) {
        const ot = opTermMap.get(key)!;
        value = ot.value;
        confidence = Math.max(confidence, ot.confidence);
        evidenceEntries.push({ source: 'operator_terms', pointer: ot.note, inference_basis: 'textual' });
        overrideSource = 'operator_terms';
        stats.operatorTermsApplied++;
      }

      // ── Layer 1: human_correction (highest) ──
      if (correction) {
        if (correction.value !== undefined) value = correction.value;
        if (correction.confidence !== undefined) confidence = correction.confidence;
        evidenceEntries.push({ source: 'human_correction', pointer: correction.note, inference_basis: 'textual' });
        overrideSource = 'human_correction';
        stats.corrected++;
        console.log(`  Correction applied: ${correctionKey} → ${JSON.stringify(value)} (${correction.note})`);
      }

      // Gate check
      const evidenceCount = evidenceEntries.length;
      const confirmed = passesSafetyGate(
        { risk_class: attr.risk_class, confidence, inference_basis: attr.inference_basis },
        evidenceCount,
      );
      if (!confirmed) stats.unconfirmed++;

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
          evidence: evidenceEntries as { source: string; pointer: string }[],
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

      stats.applied++;
    }

    // ── Inject attributes from higher layers that extraction didn't produce ──
    // (operator_terms or viator_structured may set attrs not in extraction output)
    const extractedKeys = new Set(Object.keys(result.attributes));
    const injected = [
      ...opTerms.filter((o) => !extractedKeys.has(o.attribute)).map((o) => ({ ...o, source: 'operator_terms' as const })),
      ...viatorOverrides.filter((o) => !extractedKeys.has(o.attribute) && !opTermMap.has(o.attribute)).map((o) => ({ ...o, source: 'viator_structured' as const })),
    ];

    for (const extra of injected) {
      const pointer = 'evidence' in extra ? (extra as { evidence: string }).evidence : ('note' in extra ? (extra as { note: string }).note : '');
      await db
        .insert(attributes)
        .values({
          experienceId: result.experienceId,
          key: extra.attribute,
          value: JSON.stringify(extra.value),
          confidence: extra.confidence,
          evidence: [{ source: extra.source, pointer }] as { source: string; pointer: string }[],
          riskClass: 'info',
        })
        .onConflictDoUpdate({
          target: [attributes.experienceId, attributes.key],
          set: {
            value: sql`EXCLUDED.value`,
            confidence: sql`EXCLUDED.confidence`,
            evidence: sql`EXCLUDED.evidence`,
            updatedAt: sql`now()`,
          },
        });
      stats.applied++;
    }
  }

  // ── Dan rulings: specific per-product overrides from Dan ──
  const danRulings: { expId: string; attr: string; value: unknown; note: string }[] = [
    { expId: 'exp_54510P22', attr: 'mobility', value: 'moderate', note: 'Dan personal evidence: short walk from car park to viewpoint, not a hike' },
    { expId: 'exp_105183P3', attr: 'non_swimmer_ok', value: true, note: 'Dan personal evidence: non-swimmer joined, life jackets provided, calm flat water' },
  ];

  for (const ruling of danRulings) {
    await db
      .insert(attributes)
      .values({
        experienceId: ruling.expId,
        key: ruling.attr,
        value: JSON.stringify(ruling.value),
        confidence: 0.95,
        evidence: [{ source: 'human_correction', pointer: ruling.note }] as { source: string; pointer: string }[],
        riskClass: 'safety',
      })
      .onConflictDoUpdate({
        target: [attributes.experienceId, attributes.key],
        set: {
          value: sql`EXCLUDED.value`,
          confidence: sql`EXCLUDED.confidence`,
          evidence: sql`EXCLUDED.evidence`,
          updatedAt: sql`now()`,
        },
      });
    console.log(`  Dan ruling: ${ruling.expId}.${ruling.attr} → ${JSON.stringify(ruling.value)} (${ruling.note})`);
    stats.corrected++;
  }

  // Mark diff as approved
  const mdPath = resolve(diffDir, `${batchId}.md`);
  if (existsSync(mdPath)) {
    const md = readFileSync(mdPath, 'utf-8');
    writeFileSync(
      mdPath,
      md.replace(
        /> \*\*Status:\*\* PENDING APPROVAL.*/,
        `> **Status:** APPROVED — ${stats.applied} attrs (${stats.viatorStructuredApplied} viator_structured, ${stats.danRulesApplied} dan-rules, ${stats.operatorTermsApplied} operator_terms, ${stats.derivedApplied} derived, ${stats.corrected} corrected, ${stats.unconfirmed} unconfirmed), ${stats.skipped} skipped. Applied at ${new Date().toISOString()}.`,
      ),
      'utf-8',
    );
  }

  return stats;
}
