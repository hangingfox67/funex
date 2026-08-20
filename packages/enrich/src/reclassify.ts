/**
 * Category re-classification for enriched products.
 *
 * The original categories came from Viator's taxonomy mapped by keyword
 * matching in the sync connector. This pass audits them against our
 * category enum using the enriched attribute data + title analysis.
 *
 * Categories are load-bearing: exclude, spread, portfolio, intent gate.
 * Misclassifications break the user experience.
 */

// Our category enum
export const CATEGORIES = [
  'snorkeling', 'diving', 'boat_tour', 'water_sport',
  'adventure', 'cooking_class', 'temple_tour', 'sightseeing',
  'wellness', 'wildlife', 'food_tour', 'nightlife',
  'transport', 'activity', 'waterpark', 'indoor_attraction',
] as const;

export type Category = typeof CATEGORIES[number];

interface ClassifyInput {
  id: string;
  title: string;
  currentCategory: string;
  attributes: Record<string, unknown>;
}

interface ClassifyResult {
  id: string;
  title: string;
  currentCategory: string;
  newCategory: Category;
  reason: string;
  changed: boolean;
  /** For combo products: component activity tags */
  activityTags: string[];
}

// Priority order: more specific rules first
const RULES: { match: (t: string, attrs: Record<string, unknown>) => boolean; category: Category; tags?: string[]; reason: string }[] = [
  // ── Specific venues/types ──
  { match: (t) => /water\s*park|waterpark|splash\s*jungle|andamanda/i.test(t), category: 'waterpark', reason: 'title: waterpark/splash jungle/andamanda' },
  { match: (t) => /aquarium|trick\s*eye|museum|illusion|gallery|3d\s*art/i.test(t) && !/tour/i.test(t), category: 'indoor_attraction', reason: 'title: aquarium/museum/trick eye' },
  { match: (t) => /escape\s*(room|game)|vr\s|virtual\s*reality|trampolin|indoor\s*play/i.test(t), category: 'indoor_attraction', reason: 'title: escape room/VR/trampoline/indoor' },
  { match: (t) => /cabaret|show|simon|fantasea|fantasia/i.test(t), category: 'nightlife', reason: 'title: cabaret/show/fantasea' },
  { match: (t) => /scuba|diver?\b|dive\s/i.test(t), category: 'diving', reason: 'title: scuba/diver' },
  { match: (t) => /cooking|culinary/i.test(t) && !/water\s*park/i.test(t), category: 'cooking_class', reason: 'title: cooking/culinary' },
  { match: (t) => /elephant|sanctuary|wildlife/i.test(t) && !/blue\s*elephant/i.test(t), category: 'wildlife', reason: 'title: elephant/sanctuary/wildlife' },
  { match: (t) => /massage|spa\b|yoga|reiki|wellness/i.test(t) && !/golf/i.test(t), category: 'wellness', reason: 'title: massage/spa/yoga' },
  { match: (t) => /food\s*tour|street\s*food|tasting|food\s*market/i.test(t), category: 'food_tour', reason: 'title: food tour/tasting' },
  { match: (t) => /golf/i.test(t), category: 'activity', reason: 'title: golf' },

  // ── Water activities ──
  { match: (t) => /jet\s*ski|jetski|parasail|waverunner|surf\b|paddleboard/i.test(t), category: 'water_sport', reason: 'title: jet ski/parasail/surf' },
  { match: (t) => /snorkel/i.test(t) && !/dive/i.test(t), category: 'snorkeling', reason: 'title: snorkel' },

  // ── Land adventure ──
  { match: (t) => /zipline|atv|muay\s*thai|quad|climbing|bungee|go[\s-]*kart/i.test(t), category: 'adventure', reason: 'title: zipline/ATV/muay thai' },
  { match: (t) => /helicopter|scenic\s*flight|skyline|paraglid/i.test(t), category: 'adventure', reason: 'title: helicopter/scenic flight' },

  // ── Sightseeing / temples ──
  { match: (t) => /temple|buddha|wat\s|chalong/i.test(t) && !/atv|zipline|jet/i.test(t), category: 'temple_tour', reason: 'title: temple/buddha/wat (no combo activity)' },
  { match: (t) => /old\s*town|heritage|culture|cultural/i.test(t), category: 'sightseeing', reason: 'title: old town/heritage/cultural' },
  { match: (t) => /sightseeing|viewpoint|city\s*tour|highlight/i.test(t) && !/atv|zipline/i.test(t), category: 'sightseeing', reason: 'title: sightseeing/viewpoint' },

  // ── Boat tours ──
  { match: (t) => /island|boat|cruise|sailing|catamaran|yacht|longtail|speedboat/i.test(t) && !/jet\s*ski|snorkel|dive|water\s*park/i.test(t), category: 'boat_tour', reason: 'title: island/boat/cruise' },

  // ── Transport (only when transfer/shuttle IS the product, not a feature) ──
  { match: (t) => /transfer|shuttle|airport.*(?:from|to)|private\s*car|taxi/i.test(t) && !/tour|zipline|atv|snorkel|island|temple|museum|park|water\s*park/i.test(t), category: 'transport', reason: 'title: transfer/shuttle/airport (standalone logistics)' },
];

// Combo detection: extract activity tags from title
function extractActivityTags(title: string): string[] {
  const tags: string[] = [];
  const t = title.toLowerCase();
  if (/zipline|zip\s*line|hanuman/i.test(t)) tags.push('zipline');
  if (/atv|quad/i.test(t)) tags.push('atv');
  if (/snorkel/i.test(t)) tags.push('snorkeling');
  if (/kayak|canoe/i.test(t)) tags.push('kayaking');
  if (/temple|buddha|wat\s/i.test(t)) tags.push('temple');
  if (/cooking|culinary/i.test(t)) tags.push('cooking');
  if (/elephant/i.test(t)) tags.push('elephant');
  if (/dive|scuba/i.test(t)) tags.push('diving');
  if (/jet\s*ski|jetski/i.test(t)) tags.push('jet_ski');
  if (/muay\s*thai/i.test(t)) tags.push('muay_thai');
  if (/surf/i.test(t)) tags.push('surfing');
  if (/massage|spa\b/i.test(t)) tags.push('spa');
  if (/water\s*park|waterpark|splash/i.test(t)) tags.push('waterpark');
  if (/aquarium|museum/i.test(t)) tags.push('museum');
  if (/escape\s*room/i.test(t)) tags.push('escape_room');
  if (/trampolin/i.test(t)) tags.push('trampoline');
  if (/golf/i.test(t)) tags.push('golf');
  if (/helicopter|scenic\s*flight/i.test(t)) tags.push('helicopter');
  return tags;
}

export function reclassify(input: ClassifyInput): ClassifyResult {
  const t = input.title;
  const tags = extractActivityTags(t);

  for (const rule of RULES) {
    if (rule.match(t, input.attributes)) {
      return {
        id: input.id,
        title: input.title,
        currentCategory: input.currentCategory,
        newCategory: rule.category,
        reason: rule.reason,
        changed: rule.category !== input.currentCategory,
        activityTags: tags,
      };
    }
  }

  // Fallback: keep current if it's in our enum, else 'activity'
  const fallbackCat = CATEGORIES.includes(input.currentCategory as Category)
    ? input.currentCategory as Category
    : 'activity';

  return {
    id: input.id,
    title: input.title,
    currentCategory: input.currentCategory,
    newCategory: fallbackCat,
    reason: 'no rule matched, kept current',
    changed: fallbackCat !== input.currentCategory,
    activityTags: tags,
  };
}
