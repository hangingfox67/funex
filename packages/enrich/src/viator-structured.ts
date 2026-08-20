/**
 * viator_structured evidence source.
 *
 * Maps Viator additionalInfo flags → attribute overrides.
 * Precedence: operator_terms > viator_structured > dan-rules > structural extraction
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

export interface StructuredOverride {
  attribute: string;
  value: unknown;
  confidence: number;
  evidence: string;
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
 * Derive attribute overrides from Viator structured metadata.
 */
export function deriveFromViatorMetadata(productCode: string): StructuredOverride[] {
  const metadata = loadMetadata();
  const product = metadata.get(productCode);
  if (!product) return [];

  const overrides: StructuredOverride[] = [];
  const types = new Set(product.additionalInfo.map((i) => i.type));
  const otherTexts = product.additionalInfo
    .filter((i) => i.type === 'OTHER' || i.type === 'HEALTH_OTHER')
    .map((i) => i.description.toLowerCase());

  // ── wheelchair_access ──
  if (types.has('WHEELCHAIR_ACCESSIBLE') || types.has('SURFACES_WHEELCHAIR_ACCESSIBLE')) {
    const transport = types.has('TRANSPORTATION_WHEELCHAIR_ACCESSIBLE');
    overrides.push({
      attribute: 'wheelchair_access',
      value: transport ? 'yes' : 'partial',
      confidence: 0.95,
      evidence: `Viator declares WHEELCHAIR_ACCESSIBLE${transport ? ' + TRANSPORTATION_WHEELCHAIR_ACCESSIBLE' : ''}`,
      source: 'viator_structured',
    });
  }

  // ── pregnant_ok ──
  if (types.has('NO_PREGNANT')) {
    // Check OTHER fields for nuance (e.g. "months 2-6 ok with certificate")
    const pregnantOther = otherTexts.find((t) => t.includes('pregnant'));
    overrides.push({
      attribute: 'pregnant_ok',
      value: false,
      confidence: 0.95,
      evidence: `Viator declares NO_PREGNANT.${pregnantOther ? ' Note: ' + pregnantOther.substring(0, 100) : ''}`,
      source: 'viator_structured',
    });
  }

  // ── mobility ──
  if (types.has('PHYSICAL_EASY')) {
    overrides.push({
      attribute: 'mobility',
      value: 'limited',
      confidence: 0.85,
      evidence: 'Viator declares PHYSICAL_EASY — suitable for all fitness levels.',
      source: 'viator_structured',
    });
  } else if (types.has('PHYSICAL_MEDIUM')) {
    overrides.push({
      attribute: 'mobility',
      value: 'moderate',
      confidence: 0.85,
      evidence: 'Viator declares PHYSICAL_MEDIUM — moderate physical fitness required.',
      source: 'viator_structured',
    });
  } else if (types.has('PHYSICAL_HARD')) {
    overrides.push({
      attribute: 'mobility',
      value: 'full',
      confidence: 0.85,
      evidence: 'Viator declares PHYSICAL_HARD — high level of physical fitness.',
      source: 'viator_structured',
    });
  }

  // ── health warnings → notes ──
  const healthWarnings: string[] = [];
  if (types.has('NO_BACK_PROBLEMS')) healthWarnings.push('Not recommended: spinal injuries');
  if (types.has('NO_HEART_PROBLEMS')) healthWarnings.push('Not recommended: poor cardiovascular health');
  for (const t of otherTexts) {
    if (t.includes('health') || t.includes('medical') || t.includes('condition')) {
      healthWarnings.push(t.substring(0, 100));
    }
  }
  if (healthWarnings.length > 0) {
    overrides.push({
      attribute: 'health_warnings',
      value: healthWarnings,
      confidence: 0.95,
      evidence: 'Viator supplier-declared health restrictions.',
      source: 'viator_structured',
    });
  }

  // ── confirm_at_booking from stroller/wheelchair partial ──
  if (types.has('STROLLER_ACCESSIBLE')) {
    overrides.push({
      attribute: 'stroller_accessible',
      value: true,
      confidence: 0.9,
      evidence: 'Viator declares STROLLER_ACCESSIBLE.',
      source: 'viator_structured',
    });
  }

  return overrides;
}

// ── Seasickness derivation table ──

const SEASICKNESS_TABLE: Record<string, Record<string, string>> = {
  // vessel_type → water_exposure → seasickness_risk
  speedboat: { sheltered_bay: 'low', coastal: 'moderate', open_sea: 'high', none: 'none' },
  longtail: { sheltered_bay: 'low', coastal: 'moderate', open_sea: 'high', none: 'none' },
  catamaran: { sheltered_bay: 'low', coastal: 'low', open_sea: 'moderate', none: 'none' },
  yacht: { sheltered_bay: 'low', coastal: 'low', open_sea: 'moderate', none: 'none' },
  big_boat: { sheltered_bay: 'none', coastal: 'low', open_sea: 'moderate', none: 'none' },
  none: { sheltered_bay: 'none', coastal: 'none', open_sea: 'none', none: 'none' },
};

/**
 * Derive seasickness_risk from vessel_type × water_exposure.
 * Returns null if either input is missing.
 */
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
