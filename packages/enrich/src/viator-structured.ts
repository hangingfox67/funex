/**
 * viator_structured evidence source — revised design.
 *
 * 1. STORE all additionalInfo verbatim under viator.* namespaced keys.
 *    Raw provider vocabulary is first-class evidence, never discarded.
 *
 * 2. INFLUENCE our attributes only via explicit directional rules,
 *    each documented with rationale. No silent translation.
 *
 * 3. Precedence: operator_terms > viator_structured > dan-rules > extraction.
 *    Declared-vs-rule head-on conflicts get flagged.
 */
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..', '..', '..');
const metadataPath = resolve(repoRoot, 'packages', 'enrich', 'diffs', 'viator-metadata.json');

interface AdditionalInfo {
  type: string;
  description: string;
}

interface AgeBand {
  ageBand: string;
  startAge: number;
  endAge: number;
}

interface ProductMetadata {
  productCode: string;
  additionalInfo: AdditionalInfo[];
  ageBands: AgeBand[];
}

/** Verbatim storage — written to the attribute table under viator.* keys. */
export interface VerbatimEntry {
  key: string;            // e.g. "viator.physical_level", "viator.flags"
  value: unknown;
  confidence: number;
  evidence: string;
  source: 'viator_verbatim';
}

/** Directional influence — may override an enrichment attribute. */
export interface InfluenceEntry {
  attribute: string;
  value: unknown;
  confidence: number;
  evidence: string;
  direction: 'raise_only' | 'direct_map' | 'declared_blanket';
  source: 'viator_structured';
}

let cachedMetadata: Map<string, ProductMetadata> | null = null;

function loadMetadata(): Map<string, ProductMetadata> {
  if (cachedMetadata) return cachedMetadata;
  if (!existsSync(metadataPath)) return new Map();
  const raw = JSON.parse(readFileSync(metadataPath, 'utf-8')) as ProductMetadata[];
  cachedMetadata = new Map(raw.map((m) => [m.productCode, m]));
  return cachedMetadata;
}

export function resetMetadataCache(): void {
  cachedMetadata = null;
}

/**
 * Extract verbatim storage entries from Viator metadata.
 * These are stored as viator.* attributes — raw provider vocabulary,
 * never discarded, never silently translated.
 */
export function getVerbatimEntries(productCode: string): VerbatimEntry[] {
  const metadata = loadMetadata();
  const product = metadata.get(productCode);
  if (!product) return [];

  const entries: VerbatimEntry[] = [];

  // viator.flags — all additionalInfo types
  const flags = product.additionalInfo.map((i) => ({
    type: i.type,
    description: i.description,
  }));
  if (flags.length > 0) {
    entries.push({
      key: 'viator.flags',
      value: flags,
      confidence: 1.0,
      evidence: 'Viator product detail API additionalInfo, verbatim.',
      source: 'viator_verbatim',
    });
  }

  // viator.physical_level — the specific PHYSICAL_* flag
  const physFlag = product.additionalInfo.find((i) => i.type.startsWith('PHYSICAL_'));
  if (physFlag) {
    entries.push({
      key: 'viator.physical_level',
      value: physFlag.type.replace('PHYSICAL_', '').toLowerCase(),
      confidence: 1.0,
      evidence: `Viator declares ${physFlag.type}: "${physFlag.description}"`,
      source: 'viator_verbatim',
    });
  }

  // viator.age_bands — pricing age structure
  if (product.ageBands.length > 0) {
    entries.push({
      key: 'viator.age_bands',
      value: product.ageBands.map((b) => ({
        band: b.ageBand,
        startAge: b.startAge,
        endAge: b.endAge,
      })),
      confidence: 1.0,
      evidence: 'Viator pricingInfo.ageBands, verbatim.',
      source: 'viator_verbatim',
    });
  }

  return entries;
}

// ── Mobility floor mapping ──
const MOBILITY_VALUES = { limited: 0, moderate: 1, full: 2 } as const;

/**
 * Derive directional influences from Viator metadata.
 *
 * Each rule is documented with rationale. Cross-vocabulary influence
 * is explicit and directional — never silent translation.
 */
export function deriveInfluences(
  productCode: string,
  currentAttrs: Record<string, unknown>,
): InfluenceEntry[] {
  const metadata = loadMetadata();
  const product = metadata.get(productCode);
  if (!product) return [];

  const influences: InfluenceEntry[] = [];
  const types = new Set(product.additionalInfo.map((i) => i.type));
  const otherTexts = product.additionalInfo
    .filter((i) => i.type === 'OTHER' || i.type === 'HEALTH_OTHER')
    .map((i) => i.description);

  // ────────────────────────────────────────────────────
  // Rule: PHYSICAL_HARD → may RAISE mobility floor to full.
  // Rationale: HARD = "high level of physical fitness" — if our
  // extraction says moderate, the supplier knows better about their
  // own activity's demands. EASY/MEDIUM are corroborating evidence
  // only, never lower mobility (exertion ≠ capability floor).
  // A PHYSICAL_EASY seated cruise still needs moderate mobility
  // if boarding requires stairs.
  // ────────────────────────────────────────────────────
  if (types.has('PHYSICAL_HARD')) {
    const currentMobility = currentAttrs.mobility as string | undefined;
    const currentLevel = MOBILITY_VALUES[currentMobility as keyof typeof MOBILITY_VALUES] ?? 0;
    if (currentLevel < MOBILITY_VALUES.full) {
      influences.push({
        attribute: 'mobility',
        value: 'full',
        confidence: 0.85,
        evidence: 'Viator declares PHYSICAL_HARD. Raise-only: supplier says high fitness required.',
        direction: 'raise_only',
        source: 'viator_structured',
      });
    }
  }

  // ────────────────────────────────────────────────────
  // Rule: WHEELCHAIR_ACCESSIBLE → wheelchair_access.
  // Same-meaning direct map. TRANSPORTATION_ upgrades to "yes".
  // Rationale: these are supplier-declared accessibility statements
  // with a direct semantic match to our schema.
  // ────────────────────────────────────────────────────
  if (types.has('WHEELCHAIR_ACCESSIBLE') || types.has('SURFACES_WHEELCHAIR_ACCESSIBLE')) {
    const transport = types.has('TRANSPORTATION_WHEELCHAIR_ACCESSIBLE');
    influences.push({
      attribute: 'wheelchair_access',
      value: transport ? 'yes' : 'partial',
      confidence: 0.95,
      evidence: `Viator declares WHEELCHAIR_ACCESSIBLE${transport ? ' + TRANSPORTATION_WHEELCHAIR_ACCESSIBLE' : ''}. Direct map.`,
      direction: 'direct_map',
      source: 'viator_structured',
    });
  }

  // ────────────────────────────────────────────────────
  // Rule: STROLLER_ACCESSIBLE → stroller_accessible=true.
  // Direct semantic match.
  // ────────────────────────────────────────────────────
  if (types.has('STROLLER_ACCESSIBLE')) {
    influences.push({
      attribute: 'stroller_accessible',
      value: true,
      confidence: 0.9,
      evidence: 'Viator declares STROLLER_ACCESSIBLE. Direct map.',
      direction: 'direct_map',
      source: 'viator_structured',
    });
  }

  // ────────────────────────────────────────────────────
  // Rule: NO_PREGNANT → pregnant_ok=false, tagged declared_blanket.
  // Rationale: supplier's blanket restriction. Sit-aside notes from
  // OTHER fields preserved. operator_terms conditional policies
  // (e.g. "months 2-6 with cert") outrank this.
  // ────────────────────────────────────────────────────
  if (types.has('NO_PREGNANT')) {
    const pregnantNotes = otherTexts
      .filter((t) => t.toLowerCase().includes('pregnant'))
      .map((t) => t.substring(0, 120));
    influences.push({
      attribute: 'pregnant_ok',
      value: false,
      confidence: 0.95,
      evidence: `Viator declares NO_PREGNANT (declared_blanket).${pregnantNotes.length > 0 ? ' Sit-aside: ' + pregnantNotes.join('; ') : ''}`,
      direction: 'declared_blanket',
      source: 'viator_structured',
    });
  }

  // ────────────────────────────────────────────────────
  // Rule: NO_HEART/NO_BACK/HEALTH_OTHER → health_warnings[].
  // Direct semantic match — health restriction flags.
  // ────────────────────────────────────────────────────
  const healthWarnings: string[] = [];
  if (types.has('NO_BACK_PROBLEMS')) healthWarnings.push('Not recommended: spinal injuries');
  if (types.has('NO_HEART_PROBLEMS')) healthWarnings.push('Not recommended: poor cardiovascular health');
  for (const t of otherTexts) {
    const tl = t.toLowerCase();
    if (tl.includes('health') || tl.includes('medical') || tl.includes('condition') || tl.includes('disease')) {
      healthWarnings.push(t.substring(0, 120));
    }
  }
  if (healthWarnings.length > 0) {
    influences.push({
      attribute: 'health_warnings',
      value: healthWarnings,
      confidence: 0.95,
      evidence: 'Viator supplier-declared health restrictions. Direct map.',
      direction: 'direct_map',
      source: 'viator_structured',
    });
  }

  // ────────────────────────────────────────────────────
  // Rule: age_bands → with_adult_from / stated_min_age evidence.
  // - infant/child band present → evidence for with_adult_from=0
  //   (supplier accepts young children with paying adult).
  // - No infant/child bands → floor maps to stated_min_age ONLY
  //   when the lowest band start age > 0.
  // ────────────────────────────────────────────────────
  if (product.ageBands.length > 0) {
    const hasInfant = product.ageBands.some((b) =>
      b.ageBand === 'INFANT' || b.ageBand === 'CHILD',
    );
    const lowestAge = Math.min(...product.ageBands.map((b) => b.startAge));

    if (hasInfant) {
      influences.push({
        attribute: 'with_adult_from',
        value: 0,
        confidence: 0.9,
        evidence: `Viator ageBands include infant/child pricing (from age ${lowestAge}). Supplier accepts young children.`,
        direction: 'direct_map',
        source: 'viator_structured',
      });
    } else if (lowestAge > 0) {
      influences.push({
        attribute: 'stated_min_age',
        value: lowestAge,
        confidence: 0.8,
        evidence: `Viator ageBands: lowest band starts at ${lowestAge}, no infant/child band. Supplier floor.`,
        direction: 'direct_map',
        source: 'viator_structured',
      });
    }
  }

  return influences;
}

// ── Seasickness derivation table (unchanged) ──

const SEASICKNESS_TABLE: Record<string, Record<string, string>> = {
  speedboat: { sheltered_bay: 'low', coastal: 'moderate', open_sea: 'high', none: 'none' },
  longtail: { sheltered_bay: 'low', coastal: 'moderate', open_sea: 'high', none: 'none' },
  catamaran: { sheltered_bay: 'low', coastal: 'low', open_sea: 'moderate', none: 'none' },
  yacht: { sheltered_bay: 'low', coastal: 'low', open_sea: 'moderate', none: 'none' },
  big_boat: { sheltered_bay: 'none', coastal: 'low', open_sea: 'moderate', none: 'none' },
  none: { sheltered_bay: 'none', coastal: 'none', open_sea: 'none', none: 'none' },
};

export function deriveSeasicknessRisk(
  vesselType: string | null | undefined,
  waterExposure: string | null | undefined,
): { value: string; evidence: string } | null {
  if (!vesselType || !waterExposure) return null;
  const row = SEASICKNESS_TABLE[vesselType];
  if (!row) return null;
  const risk = row[waterExposure];
  if (!risk) return null;
  return {
    value: risk,
    evidence: `Derived: ${vesselType} × ${waterExposure} → ${risk} (formula table)`,
  };
}
