import Anthropic from '@anthropic-ai/sdk';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { parse as parseYaml } from 'yaml';
import { eq } from 'drizzle-orm';
import { db as defaultDb, experiences, providerMappings } from '@funex/graph';
import { buildExtractionPrompt, EXTRACT_MODEL, EXTRACT_PROMPT_VERSION } from './prompt.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..', '..', '..');

export interface ExtractedAttribute {
  value: unknown;
  confidence: number;
  evidence: string;
  risk_class: string;
  inference_basis: 'textual' | 'structural' | 'unverified';
}

export interface ExtractionResult {
  experienceId: string;
  title: string;
  attributes: Record<string, ExtractedAttribute>;
  usage: { inputTokens: number; outputTokens: number };
  costUsd: number;
}

export interface BatchMetadata {
  promptVersion: string;
  model: string;
  startedAt: string;
  completedAt?: string;
  productIds: string[];
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCostUsd: number;
  perProductCosts: { experienceId: string; inputTokens: number; outputTokens: number; costUsd: number }[];
}

// Sonnet 4 pricing: $3/MTok input, $15/MTok output
const INPUT_COST_PER_TOKEN = 3 / 1_000_000;
const OUTPUT_COST_PER_TOKEN = 15 / 1_000_000;

function loadOntology(): Record<string, unknown> {
  const raw = readFileSync(resolve(repoRoot, 'ontology', 'attributes.v1.yaml'), 'utf-8');
  const parsed = parseYaml(raw);
  return parsed.attributes;
}

export async function extractOne(
  experienceId: string,
  db: typeof defaultDb = defaultDb,
  anthropic?: Anthropic,
): Promise<ExtractionResult> {
  const client = anthropic ?? new Anthropic();
  const ontology = loadOntology();

  const [exp] = await db
    .select()
    .from(experiences)
    .where(eq(experiences.id, experienceId));

  if (!exp) throw new Error(`Experience not found: ${experienceId}`);

  // Load fixture description (derive-then-discard: used for extraction only, never stored)
  // Resolution is by provider_mapping.providerProductId → fixture.productCode, never array index.
  let description = '';
  let sourceText = '';  // normalized source text for textual evidence validation
  try {
    const [mapping] = await db
      .select()
      .from(providerMappings)
      .where(eq(providerMappings.experienceId, experienceId));
    if (mapping) {
      const fixture: { productCode: string; title: string; description: string }[] = JSON.parse(
        readFileSync(resolve(repoRoot, 'fixtures', 'viator-sample.json'), 'utf-8'),
      );
      const product = fixture.find((p) => p.productCode === mapping.providerProductId);
      if (!product) {
        throw new Error(
          `Fixture product not found for mapping: experienceId=${experienceId}, ` +
          `providerProductId=${mapping.providerProductId}. Resolution must be by productCode, not array index.`,
        );
      }
      description = product.description;
      sourceText = `${product.title} ${product.description}`.toLowerCase();
    }
  } catch (err) {
    if ((err as Error).message.includes('Fixture product not found')) throw err;
    /* fixture may not exist in non-mock mode */
  }

  const prompt = buildExtractionPrompt(
    {
      title: exp.title,
      category: exp.category,
      description,
      durationMinutes: exp.durationMinutes ?? 0,
      priceCents: exp.basePriceCents ?? 0,
      meetingPoints: (exp.meetingPoints ?? []) as { lat: number; lng: number; label: string }[],
    },
    ontology,
  );

  const response = await client.messages.create({
    model: EXTRACT_MODEL,
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('');

  // Strip markdown fencing if present
  const cleaned = text.replace(/^```(?:json)?\s*/m, '').replace(/\s*```\s*$/m, '').trim();

  let attributes: Record<string, ExtractedAttribute>;
  try {
    attributes = JSON.parse(cleaned);
  } catch {
    throw new Error(`Failed to parse extraction response for ${experienceId}:\n${cleaned}`);
  }

  // ── Textual evidence validator ──
  // basis=textual → evidence MUST contain a verbatim span of the source text.
  // Extract spans inside single quotes from the evidence, then substring-check
  // each against the normalized source text (case, dashes, quote marks, whitespace).
  // Failing rows get flagged as "unverified" + confidence capped.
  if (sourceText) {
    for (const [key, attr] of Object.entries(attributes)) {
      if (attr.inference_basis !== 'textual') continue;

      const normalize = (s: string) =>
        s.toLowerCase()
          .replace(/[\u2018\u2019\u201C\u201D]/g, "'")   // smart quotes → straight
          .replace(/[\u2013\u2014]/g, '-')                // em/en dash → hyphen
          .replace(/\s+/g, ' ')                           // collapse whitespace
          .trim();

      const normalizedSource = normalize(sourceText);

      // Strategy 1: extract quoted spans (inside single quotes in the evidence)
      const quotedSpans = attr.evidence.match(/'([^']{3,})'/g)
        ?.map((q) => normalize(q.slice(1, -1))) ?? [];

      // Strategy 2: also check for common citation patterns like "states X" / "says X"
      // Extract spans after "states", "says", "explicitly", "titled", "described as"
      const citationPattern = /(?:states?|says?|explicitly|titled|described as|references?|includes?|branded as|frames? (?:this|it) as)\s+'?([^,.;]{3,}?)'?(?:[,.\s;]|$)/gi;
      let match;
      while ((match = citationPattern.exec(attr.evidence)) !== null) {
        const span = normalize(match[1]);
        if (span.length >= 3 && !quotedSpans.includes(span)) {
          quotedSpans.push(span);
        }
      }

      let foundSpan = false;
      for (const span of quotedSpans) {
        if (normalizedSource.includes(span)) {
          foundSpan = true;
          break;
        }
      }

      // Fallback: if no quoted spans found, check if any 2-word phrase from the
      // evidence appears verbatim in source (handles unquoted references)
      if (!foundSpan && quotedSpans.length === 0) {
        const evidenceNorm = normalize(attr.evidence);
        const words = evidenceNorm.split(' ').filter((w) => w.length > 2);
        for (let i = 0; i <= words.length - 2; i++) {
          const bigram = words.slice(i, i + 2).join(' ');
          if (bigram.length >= 6 && normalizedSource.includes(bigram)) {
            foundSpan = true;
            break;
          }
        }
      }

      if (!foundSpan) {
        console.warn(
          `  EVIDENCE CHECK FAILED: ${experienceId}.${key} claims textual basis but no matching span found in source. Marking as unverified.`,
        );
        attr.inference_basis = 'unverified';
        attr.confidence = Math.min(attr.confidence, 0.7);
      }
    }
  }

  const inputTokens = response.usage.input_tokens;
  const outputTokens = response.usage.output_tokens;
  const costUsd = inputTokens * INPUT_COST_PER_TOKEN + outputTokens * OUTPUT_COST_PER_TOKEN;

  return {
    experienceId,
    title: exp.title,
    attributes,
    usage: { inputTokens, outputTokens },
    costUsd,
  };
}

export async function extractBatch(
  experienceIds: string[],
  db: typeof defaultDb = defaultDb,
): Promise<{ results: ExtractionResult[]; metadata: BatchMetadata }> {
  const client = new Anthropic();
  const results: ExtractionResult[] = [];
  const perProductCosts: BatchMetadata['perProductCosts'] = [];

  const metadata: BatchMetadata = {
    promptVersion: EXTRACT_PROMPT_VERSION,
    model: EXTRACT_MODEL,
    startedAt: new Date().toISOString(),
    productIds: experienceIds,
    totalInputTokens: 0,
    totalOutputTokens: 0,
    totalCostUsd: 0,
    perProductCosts: [],
  };

  for (const expId of experienceIds) {
    console.log(`  Extracting ${expId}...`);
    let retries = 0;
    let result: ExtractionResult | null = null;

    while (retries <= 2) {
      try {
        result = await extractOne(expId, db, client);
        break;
      } catch (err) {
        retries++;
        if (retries > 2) {
          console.error(`  FAILED after ${retries} attempts: ${expId} — flagged for human review`);
          break;
        }
        console.warn(`  Retry ${retries}/2 for ${expId}: ${(err as Error).message}`);
      }
    }

    if (result) {
      results.push(result);
      const cost = {
        experienceId: expId,
        inputTokens: result.usage.inputTokens,
        outputTokens: result.usage.outputTokens,
        costUsd: result.costUsd,
      };
      perProductCosts.push(cost);
      metadata.totalInputTokens += result.usage.inputTokens;
      metadata.totalOutputTokens += result.usage.outputTokens;
      metadata.totalCostUsd += result.costUsd;
      console.log(`    ${result.usage.inputTokens} in / ${result.usage.outputTokens} out — $${result.costUsd.toFixed(4)}`);
    }
  }

  metadata.completedAt = new Date().toISOString();
  metadata.perProductCosts = perProductCosts;

  return { results, metadata };
}
