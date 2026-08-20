/**
 * operator_terms: per-product overrides from verified operator T&C.
 * Highest precedence source after human corrections.
 */
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { parse as parseYaml } from 'yaml';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rulesDir = resolve(__dirname, '..', 'rules');

interface TermRule {
  attribute: string;
  value: unknown;
  confidence: number;
  note: string;
}

interface TermGroup {
  products: string[];
  rules: TermRule[];
}

export interface OperatorTermOverride {
  attribute: string;
  value: unknown;
  confidence: number;
  note: string;
  source: 'operator_terms';
}

let cached: Map<string, OperatorTermOverride[]> | null = null;

function loadTerms(): Map<string, OperatorTermOverride[]> {
  if (cached) return cached;
  const path = resolve(rulesDir, 'operator-terms.yaml');
  if (!existsSync(path)) return new Map();
  const raw = readFileSync(path, 'utf-8');
  const groups = parseYaml(raw) as TermGroup[];

  cached = new Map();
  for (const group of groups) {
    const overrides: OperatorTermOverride[] = group.rules.map((r) => ({
      attribute: r.attribute,
      value: r.value,
      confidence: r.confidence,
      note: r.note,
      source: 'operator_terms',
    }));
    for (const productId of group.products) {
      cached.set(productId, [...(cached.get(productId) ?? []), ...overrides]);
    }
  }
  return cached;
}

export function getOperatorTerms(experienceId: string): OperatorTermOverride[] {
  return loadTerms().get(experienceId) ?? [];
}

export function resetTermsCache(): void {
  cached = null;
}
