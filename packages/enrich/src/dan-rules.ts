import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { parse as parseYaml } from 'yaml';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rulesDir = resolve(__dirname, '..', 'rules');

interface RuleSelector {
  category_contains?: string[];
  title_contains?: string[];
  title_exclude?: string[];
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
  ruleIndex: number;
  specificity: number;
  selectorType: 'title' | 'category';
  selector: string;
}

/**
 * Selector specificity score. Higher = more specific.
 * title_contains rules always outrank category_contains rules.
 * Within each type, more match terms = more specific.
 */
function selectorSpecificity(selector: RuleSelector, matchedVia: 'title' | 'category'): number {
  const TITLE_BASE = 1000; // title rules always beat category rules
  const terms = (selector.title_contains?.length ?? 0) + (selector.category_contains?.length ?? 0);
  return (matchedVia === 'title' ? TITLE_BASE : 0) + terms;
}

function matchesSelector(
  selector: RuleSelector,
  title: string,
  category: string,
): { matched: boolean; via: 'title' | 'category' } {
  const titleLower = title.toLowerCase();
  const catLower = category.toLowerCase();

  // Check exclusions first
  if (selector.title_exclude) {
    const excluded = selector.title_exclude.some((t) =>
      titleLower.includes(t.toLowerCase()),
    );
    if (excluded) return { matched: false, via: 'category' };
  }

  // Title match takes priority
  if (selector.title_contains) {
    const titleMatch = selector.title_contains.some((t) =>
      titleLower.includes(t.toLowerCase()),
    );
    if (titleMatch) return { matched: true, via: 'title' };
  }

  // Category match (also checks title for category keywords)
  if (selector.category_contains) {
    const catMatch = selector.category_contains.some((c) =>
      catLower.includes(c.toLowerCase()) || titleLower.includes(c.toLowerCase()),
    );
    if (catMatch) return { matched: true, via: 'category' };
  }

  return { matched: false, via: 'category' };
}

let cachedRules: RuleGroup[] | null = null;

function loadRules(): RuleGroup[] {
  if (cachedRules) return cachedRules;
  const path = resolve(rulesDir, 'dan-rules.yaml');
  const raw = readFileSync(path, 'utf-8');
  cachedRules = parseYaml(raw) as RuleGroup[];
  return cachedRules;
}

/** Reset cache (for testing). */
export function _resetRulesCache(): void {
  cachedRules = null;
}

/**
 * Apply Dan-rules to a product with explicit precedence.
 *
 * Precedence:
 *   1. title-selector rules beat category-selector rules
 *   2. Among same type, more-specific selector (more terms) wins
 *   3. Ties resolved by YAML order (higher index wins)
 *
 * Returns the winning rule per attribute, with override log entries.
 */
export function applyDanRules(
  title: string,
  category: string,
): { applied: AppliedRule[]; overrideLog: string[] } {
  const rules = loadRules();
  const overrideLog: string[] = [];

  // Collect all matching rules per attribute with specificity
  const candidates = new Map<string, AppliedRule[]>();

  for (const [gi, group] of rules.entries()) {
    const { matched, via } = matchesSelector(group.selector, title, category);
    if (!matched) continue;

    const spec = selectorSpecificity(group.selector, via);
    const selectorDesc = JSON.stringify(group.selector);

    for (const rule of group.rules) {
      const entry: AppliedRule = {
        attribute: rule.attribute,
        value: rule.value,
        confidence: rule.confidence,
        note: rule.note,
        ruleIndex: gi,
        specificity: spec,
        selectorType: via,
        selector: selectorDesc,
      };

      if (!candidates.has(rule.attribute)) candidates.set(rule.attribute, []);
      candidates.get(rule.attribute)!.push(entry);
    }
  }

  // Pick winner per attribute by precedence
  const applied: AppliedRule[] = [];
  for (const [attr, entries] of candidates) {
    if (entries.length === 1) {
      applied.push(entries[0]);
      continue;
    }

    // Sort: highest specificity first, then highest ruleIndex (YAML order) for ties
    entries.sort((a, b) => {
      if (b.specificity !== a.specificity) return b.specificity - a.specificity;
      return b.ruleIndex - a.ruleIndex;
    });

    const winner = entries[0];
    applied.push(winner);

    // Log if there were competing rules
    const losers = entries.slice(1).filter((e) =>
      JSON.stringify(e.value) !== JSON.stringify(winner.value),
    );
    if (losers.length > 0) {
      const loserDesc = losers.map((l) =>
        `rule${l.ruleIndex + 1}(${l.selectorType},spec=${l.specificity})=${JSON.stringify(l.value)}`,
      ).join(', ');
      overrideLog.push(
        `${attr}: rule${winner.ruleIndex + 1}(${winner.selectorType},spec=${winner.specificity})=${JSON.stringify(winner.value)} beats ${loserDesc}`,
      );
    }
  }

  return { applied, overrideLog };
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

  const venueMap = new Map<string, typeof products>();
  for (const p of products) {
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
