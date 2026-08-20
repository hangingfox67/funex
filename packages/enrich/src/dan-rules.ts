import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { parse as parseYaml } from 'yaml';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rulesDir = resolve(__dirname, '..', 'rules');

interface RuleSelector {
  category_contains?: string[];
  title_contains?: string[];
}

interface RuleEntry {
  attribute: string;
  value: unknown;
  confidence: number;
  note: string;
}

interface RuleGroup {
  selector: RuleSelector;
  rules: RuleEntry[];
}

export interface AppliedRule {
  attribute: string;
  value: unknown;
  confidence: number;
  note: string;
  selector: string;
}

function matchesSelector(
  selector: RuleSelector,
  title: string,
  category: string,
): boolean {
  const titleLower = title.toLowerCase();
  const catLower = category.toLowerCase();

  if (selector.title_contains) {
    const titleMatch = selector.title_contains.some((t) =>
      titleLower.includes(t.toLowerCase()),
    );
    if (titleMatch) return true;
  }

  if (selector.category_contains) {
    const catMatch = selector.category_contains.some((c) =>
      catLower.includes(c.toLowerCase()) || titleLower.includes(c.toLowerCase()),
    );
    if (catMatch) return true;
  }

  return false;
}

let cachedRules: RuleGroup[] | null = null;

function loadRules(): RuleGroup[] {
  if (cachedRules) return cachedRules;
  const path = resolve(rulesDir, 'dan-rules.yaml');
  const raw = readFileSync(path, 'utf-8');
  cachedRules = parseYaml(raw) as RuleGroup[];
  return cachedRules;
}

/**
 * Apply Dan-rules to a product. Returns list of rule applications.
 * Rules act as corroboration — they add an "operator-local knowledge"
 * evidence source, which can upgrade safety gate status.
 */
export function applyDanRules(
  title: string,
  category: string,
): AppliedRule[] {
  const rules = loadRules();
  const applied: AppliedRule[] = [];

  for (const group of rules) {
    if (!matchesSelector(group.selector, title, category)) continue;

    const selectorDesc = JSON.stringify(group.selector);
    for (const rule of group.rules) {
      applied.push({
        attribute: rule.attribute,
        value: rule.value,
        confidence: rule.confidence,
        note: rule.note,
        selector: selectorDesc,
      });
    }
  }

  return applied;
}

/**
 * QA check: same-venue consistency.
 * Products at the same venue (matched by title similarity) should have
 * consistent safety attributes. Returns warnings for inconsistencies.
 */
export function checkVenueConsistency(
  products: { experienceId: string; title: string; attributes: Record<string, { value: unknown; risk_class: string }> }[],
): string[] {
  const warnings: string[] = [];
  const SAFETY_KEYS = ['mobility', 'wheelchair_access', 'non_swimmer_ok', 'pregnant_ok', 'seasickness_risk'];

  // Group by venue (extract venue name from title — first 3 significant words)
  const venueMap = new Map<string, typeof products>();
  for (const p of products) {
    // Normalize: "Simon Cabaret Phuket Night Out..." → "simon cabaret phuket"
    const words = p.title.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter((w) => w.length > 2);
    const venueKey = words.slice(0, 3).join(' ');
    if (!venueMap.has(venueKey)) venueMap.set(venueKey, []);
    venueMap.get(venueKey)!.push(p);
  }

  for (const [venue, group] of venueMap) {
    if (group.length < 2) continue;

    for (const key of SAFETY_KEYS) {
      const values = group
        .filter((p) => p.attributes[key]?.value !== null && p.attributes[key]?.value !== undefined)
        .map((p) => ({ id: p.experienceId, value: JSON.stringify(p.attributes[key].value) }));

      if (values.length < 2) continue;

      const unique = new Set(values.map((v) => v.value));
      if (unique.size > 1) {
        const detail = values.map((v) => `${v.id}=${v.value}`).join(', ');
        warnings.push(`VENUE INCONSISTENCY [${venue}]: ${key} differs — ${detail}`);
      }
    }
  }

  return warnings;
}
