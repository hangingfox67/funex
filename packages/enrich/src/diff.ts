import { writeFileSync, existsSync, mkdirSync, readdirSync, readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import type { ExtractionResult, BatchMetadata } from './extract.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..', '..', '..');
const diffDir = resolve(repoRoot, 'packages', 'enrich', 'diffs');

export function writeDiff(
  results: ExtractionResult[],
  metadata: BatchMetadata,
  batchId: string,
): string {
  if (!existsSync(diffDir)) mkdirSync(diffDir, { recursive: true });

  const lines: string[] = [];

  lines.push(`# Enrichment Diff — Batch ${batchId}`);
  lines.push('');
  lines.push('## Metadata');
  lines.push('');
  lines.push(`- **Prompt version:** ${metadata.promptVersion}`);
  lines.push(`- **Model:** ${metadata.model}`);
  lines.push(`- **Started:** ${metadata.startedAt}`);
  lines.push(`- **Completed:** ${metadata.completedAt ?? 'in progress'}`);
  lines.push(`- **Products:** ${metadata.productIds.length}`);
  lines.push(`- **Total tokens:** ${metadata.totalInputTokens} input / ${metadata.totalOutputTokens} output`);
  lines.push(`- **Total cost:** $${metadata.totalCostUsd.toFixed(4)} USD`);
  lines.push(`- **Avg cost/product:** $${(metadata.totalCostUsd / Math.max(metadata.productIds.length, 1)).toFixed(4)} USD`);
  lines.push('');

  lines.push('## Per-product costs');
  lines.push('');
  lines.push('| Experience | Input tok | Output tok | Cost USD |');
  lines.push('|---|---|---|---|');
  for (const c of metadata.perProductCosts) {
    lines.push(`| ${c.experienceId} | ${c.inputTokens} | ${c.outputTokens} | $${c.costUsd.toFixed(4)} |`);
  }
  lines.push('');

  // ── Alerts: safety attrs with high confidence from single textual source ──
  const alerts: { expId: string; title: string; key: string; value: unknown; confidence: number; evidence: string }[] = [];
  for (const result of results) {
    for (const [key, attr] of Object.entries(result.attributes)) {
      if (
        attr.risk_class === 'safety' &&
        attr.inference_basis === 'textual' &&
        attr.confidence >= 0.9 &&
        attr.value !== null
      ) {
        alerts.push({
          expId: result.experienceId,
          title: result.title,
          key,
          value: attr.value,
          confidence: attr.confidence,
          evidence: attr.evidence,
        });
      }
    }
  }

  if (alerts.length > 0) {
    lines.push('## ⚠ Review Required: High-confidence safety from single textual source');
    lines.push('');
    lines.push('These safety attributes scored ≥0.9 confidence with `inference_basis=textual` but only have one source.');
    lines.push('Per risk gate rules, they will serve as **"unconfirmed"** until a second source corroborates.');
    lines.push('');
    lines.push('| Experience | Attribute | Value | Conf | Evidence |');
    lines.push('|---|---|---|---|---|');
    for (const a of alerts) {
      lines.push(`| ${a.expId} (${a.title}) | ${a.key} | ${JSON.stringify(a.value)} | ${a.confidence.toFixed(2)} | ${a.evidence.replace(/\|/g, '\\|')} |`);
    }
    lines.push('');
  }

  // ── Safety wobble detection: compare against previous batches ──
  const wobbles: { expId: string; key: string; prevValue: unknown; newValue: unknown; prevBatch: string }[] = [];
  try {
    const prevBatches = readdirSync(diffDir)
      .filter((f) => f.endsWith('.json') && f !== `${batchId}.json`)
      .sort()
      .reverse();

    if (prevBatches.length > 0) {
      const prevRaw = readFileSync(resolve(diffDir, prevBatches[0]), 'utf-8');
      const prevData = JSON.parse(prevRaw) as { results: ExtractionResult[] };
      const prevMap = new Map<string, Record<string, unknown>>();
      for (const r of prevData.results) {
        const safetyVals: Record<string, unknown> = {};
        for (const [k, a] of Object.entries(r.attributes)) {
          if (a.risk_class === 'safety') safetyVals[k] = a.value;
        }
        prevMap.set(r.experienceId, safetyVals);
      }

      for (const result of results) {
        const prev = prevMap.get(result.experienceId);
        if (!prev) continue;
        for (const [key, attr] of Object.entries(result.attributes)) {
          if (attr.risk_class !== 'safety') continue;
          if (key in prev && JSON.stringify(prev[key]) !== JSON.stringify(attr.value)) {
            wobbles.push({
              expId: result.experienceId,
              key,
              prevValue: prev[key],
              newValue: attr.value,
              prevBatch: prevBatches[0].replace('.json', ''),
            });
          }
        }
      }
    }
  } catch { /* no previous batches — skip */ }

  if (wobbles.length > 0) {
    lines.push('## Safety Attribute Wobble Report');
    lines.push('');
    lines.push(`Compared against previous batch. **${wobbles.length} safety attribute(s) changed value.**`);
    if (wobbles.length >= 3) {
      lines.push('');
      lines.push('> **WARNING:** ≥3 safety attributes shifted — consider enabling k=2 self-consistency for safety-class attributes in the next run.');
    }
    lines.push('');
    lines.push('| Experience | Attribute | Previous | New | Prev Batch |');
    lines.push('|---|---|---|---|---|');
    for (const w of wobbles) {
      lines.push(`| ${w.expId} | ${w.key} | ${JSON.stringify(w.prevValue)} | ${JSON.stringify(w.newValue)} | ${w.prevBatch} |`);
    }
    lines.push('');
  }

  lines.push('---');
  lines.push('');

  // ── Per-product: grouped by risk class ──
  for (const result of results) {
    lines.push(`## ${result.experienceId}: ${result.title}`);
    lines.push('');

    const safetyAttrs = Object.entries(result.attributes)
      .filter(([, a]) => a.risk_class === 'safety')
      .sort(([a], [b]) => a.localeCompare(b));

    const infoAttrs = Object.entries(result.attributes)
      .filter(([, a]) => a.risk_class !== 'safety')
      .sort(([a], [b]) => a.localeCompare(b));

    if (safetyAttrs.length > 0) {
      lines.push('### Safety attributes');
      lines.push('');
      lines.push('| Attribute | Value | Confidence | Basis | Gate | Evidence |');
      lines.push('|---|---|---|---|---|---|');
      for (const [key, attr] of safetyAttrs) {
        const val = attr.value === null ? '_N/A_' : JSON.stringify(attr.value);
        const conf = attr.confidence.toFixed(2);
        const basis = attr.inference_basis ?? 'structural';
        let gate: string;
        if (attr.value === null) {
          gate = '—';
        } else if (basis === 'unverified') {
          gate = '**UNVERIFIED**';
        } else if (basis === 'structural' && attr.confidence >= 0.9) {
          gate = 'PASS';
        } else {
          gate = '**UNCONFIRMED**';
        }
        const evidence = attr.evidence.replace(/\|/g, '\\|');
        lines.push(`| ${key} | ${val} | ${conf} | ${basis} | ${gate} | ${evidence} |`);
      }
      lines.push('');
    }

    if (infoAttrs.length > 0) {
      lines.push('### Info attributes');
      lines.push('');
      lines.push('| Attribute | Value | Confidence | Basis | Evidence |');
      lines.push('|---|---|---|---|---|');
      for (const [key, attr] of infoAttrs) {
        const val = attr.value === null ? '_N/A_' : JSON.stringify(attr.value);
        const conf = attr.confidence.toFixed(2);
        const basis = attr.inference_basis ?? 'structural';
        const evidence = attr.evidence.replace(/\|/g, '\\|');
        lines.push(`| ${key} | ${val} | ${conf} | ${basis} | ${evidence} |`);
      }
      lines.push('');
    }
  }

  lines.push('---');
  lines.push('');
  lines.push(`> **Status:** PENDING APPROVAL — run \`pnpm enrich:approve ${batchId}\` to apply.`);
  lines.push('');

  const content = lines.join('\n');
  const filePath = resolve(diffDir, `${batchId}.md`);
  writeFileSync(filePath, content, 'utf-8');

  // Also write raw JSON for the approve script
  const jsonPath = resolve(diffDir, `${batchId}.json`);
  writeFileSync(jsonPath, JSON.stringify({ results, metadata }, null, 2), 'utf-8');

  return filePath;
}
