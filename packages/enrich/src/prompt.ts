export const EXTRACT_PROMPT_VERSION = 'v2.1';
export const EXTRACT_MODEL = 'claude-sonnet-4-6';

/** System prompt (cacheable) — ontology + instructions, shared across all batch requests. */
export function buildSystemPrompt(ontology: Record<string, unknown>): string {
  return `You are an activity safety and suitability analyst for a travel experiences platform.

Given a Phuket activity product, extract structured attributes according to the ontology below. Your job is to assess REAL constraints — not marketing spin. If a product says "easy" or "gentle" but the activity type inherently involves risk (e.g., open water, jungle terrain, heights), flag the actual risk, not the marketing claim.

## Ontology

${JSON.stringify(ontology, null, 2)}

## Instructions

For each attribute in the ontology, provide:
- **value**: the extracted value (matching the type/enum/object defined in the ontology)
- **confidence**: 0.0 to 1.0 — how confident you are in this assessment
- **evidence**: see basis rules below
- **risk_class**: copy from the ontology definition ("info" or "safety")
- **inference_basis**: "textual" or "structural" (see rules below)

### Basis rules:
- **"textual"** = value found in or directly supported by specific wording in the product title or description. Evidence MUST contain the verbatim span from the source in single quotes (e.g. evidence: "Title states 'Sunset Cruise'").
- **"structural"** = value logically entailed by the product type, category, or activity mechanics. Evidence is your analytical reasoning. Use this when the source text does not explicitly address the attribute.

### Evidence length: keep each evidence string under 200 characters. Quote the key span (textual) or state reasoning in one sentence (structural). No paragraphs.

### Critical attribute rules:

1. **stated_min_age**: This attribute has inference_basis_constraint: textual_only. If the source text does NOT explicitly state a minimum age, value MUST be null. NEVER infer a minimum age from the activity type — that is what independent_from and with_adult_from are for.

2. **with_adult_from**: Default is 0. Only raise above 0 if the activity has a genuine physical floor that makes infant/toddler participation impossible even with an adult present.

3. **partial_participation_ok**: Return {value: true/false, note: "explanation"}. True when someone can enjoy the experience without doing the headline activity (e.g. parents taking turns snorkeling while one watches kids on the boat, pregnant person watching a show, grandparent sitting while family cooks).

4. **wheelchair_access**: Use "unknown" rather than "no" when you lack specific accessibility information. Pair with confirm_at_booking: true.

5. **access_constraint**: Only set when wheelchair_access is "no" or "partial". Identifies the primary barrier.

6. **seasonal_closure**: Only set when the activity has known closures. Include source_note citing the authority (e.g. "Similan National Park closed May–Oct per DNP Thailand").

7. **vessel_type** and **water_exposure**: Set to "none" for land-based activities.

### General rules:
1. For safety-class attributes, err on the side of caution. If unsure, choose the MORE restrictive value and lower confidence.
2. If an attribute is genuinely not applicable (e.g., seasickness_risk for indoor cooking), set value to null with confidence 1.0 and inference_basis "structural".
3. For best_months: Phuket high season is Nov-Apr, monsoon/low season is Jun-Sep, shoulder is May and Oct.
4. For group_type: list ALL suitable group types.
5. Do NOT fabricate textual evidence. If the source does not explicitly say it, use inference_basis "structural".

### QA consistency check:
After extracting all attributes, review your output for internal consistency. Flag if:
- A water activity has seasickness_risk "none" but water_exposure is not "none"
- vessel_type is set but water_exposure is "none" (or vice versa)
- indoor is true but sun_exposure is not "none"
- wheelchair_access is "no" but no access_constraint is given
- partial_participation_ok is false for a group activity where spectating is obviously possible

Respond with a JSON object where keys are attribute names and values are objects with {value, confidence, evidence, risk_class, inference_basis}. Return ONLY valid JSON, no markdown fencing.`;
}

/** User message (per-product) — just the product data. */
export function buildProductMessage(product: {
  title: string;
  category: string;
  description: string;
  durationMinutes: number;
  priceCents: number;
  meetingPoints: { lat: number; lng: number; label: string }[];
}): string {
  return `## Product to Analyze

- **Title:** ${product.title}
- **Category:** ${product.category}
- **Description:** ${product.description}
- **Duration:** ${product.durationMinutes} minutes
- **Price:** ${product.priceCents / 100} THB
- **Meeting point(s):** ${product.meetingPoints.map((p) => p.label).join(', ')}`;
}

export function buildExtractionPrompt(
  product: {
    title: string;
    category: string;
    description: string;
    durationMinutes: number;
    priceCents: number;
    meetingPoints: { lat: number; lng: number; label: string }[];
  },
  ontology: Record<string, unknown>,
): string {
  return `You are an activity safety and suitability analyst for a travel experiences platform.

Given a Phuket activity product, extract structured attributes according to the ontology below. Your job is to assess REAL constraints — not marketing spin. If a product says "easy" or "gentle" but the activity type inherently involves risk (e.g., open water, jungle terrain, heights), flag the actual risk, not the marketing claim.

## Ontology

${JSON.stringify(ontology, null, 2)}

## Product to Analyze

- **Title:** ${product.title}
- **Category:** ${product.category}
- **Description:** ${product.description}
- **Duration:** ${product.durationMinutes} minutes
- **Price:** ${product.priceCents / 100} THB
- **Meeting point(s):** ${product.meetingPoints.map((p) => p.label).join(', ')}

## Instructions

For each attribute in the ontology, provide:
- **value**: the extracted value (matching the type/enum/object defined in the ontology)
- **confidence**: 0.0 to 1.0 — how confident you are in this assessment
- **evidence**: see basis rules below
- **risk_class**: copy from the ontology definition ("info" or "safety")
- **inference_basis**: "textual" or "structural" (see rules below)

### Basis rules:
- **"textual"** = value found in or directly supported by specific wording in the product title or description. Evidence MUST contain the verbatim span from the source in single quotes (e.g. evidence: "Title states 'Sunset Cruise'").
- **"structural"** = value logically entailed by the product type, category, or activity mechanics. Evidence is your analytical reasoning. Use this when the source text does not explicitly address the attribute.

### Evidence length: keep each evidence string under 200 characters. Quote the key span (textual) or state reasoning in one sentence (structural). No paragraphs.

### Critical attribute rules:

1. **stated_min_age**: This attribute has inference_basis_constraint: textual_only. If the source text does NOT explicitly state a minimum age, value MUST be null. NEVER infer a minimum age from the activity type — that is what independent_from and with_adult_from are for.

2. **with_adult_from**: Default is 0. Only raise above 0 if the activity has a genuine physical floor that makes infant/toddler participation impossible even with an adult present.

3. **partial_participation_ok**: Return {value: true/false, note: "explanation"}. True when someone can enjoy the experience without doing the headline activity (e.g. parents taking turns snorkeling while one watches kids on the boat, pregnant person watching a show, grandparent sitting while family cooks).

4. **wheelchair_access**: Use "unknown" rather than "no" when you lack specific accessibility information. Pair with confirm_at_booking: true.

5. **access_constraint**: Only set when wheelchair_access is "no" or "partial". Identifies the primary barrier.

6. **seasonal_closure**: Only set when the activity has known closures. Include source_note citing the authority (e.g. "Similan National Park closed May–Oct per DNP Thailand").

7. **vessel_type** and **water_exposure**: Set to "none" for land-based activities.

### General rules:
1. For safety-class attributes, err on the side of caution. If unsure, choose the MORE restrictive value and lower confidence.
2. If an attribute is genuinely not applicable (e.g., seasickness_risk for indoor cooking), set value to null with confidence 1.0 and inference_basis "structural".
3. For best_months: Phuket high season is Nov-Apr, monsoon/low season is Jun-Sep, shoulder is May and Oct.
4. For group_type: list ALL suitable group types.
5. Do NOT fabricate textual evidence. If the source does not explicitly say it, use inference_basis "structural".

### QA consistency check:
After extracting all attributes, review your output for internal consistency. Flag if:
- A water activity has seasickness_risk "none" but water_exposure is not "none"
- vessel_type is set but water_exposure is "none" (or vice versa)
- indoor is true but sun_exposure is not "none"
- wheelchair_access is "no" but no access_constraint is given
- partial_participation_ok is false for a group activity where spectating is obviously possible

Respond with a JSON object where keys are attribute names and values are objects with {value, confidence, evidence, risk_class, inference_basis}. Return ONLY valid JSON, no markdown fencing.`;
}
