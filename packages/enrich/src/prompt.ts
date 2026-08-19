export const EXTRACT_PROMPT_VERSION = 'v1.1';
export const EXTRACT_MODEL = 'claude-sonnet-4-6';

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
- **value**: the extracted value (matching the type/enum defined in the ontology)
- **confidence**: 0.0 to 1.0 — how confident you are in this assessment
- **evidence**: a brief phrase explaining WHY you assigned this value. If your basis is "textual", quote the specific words from the description that support it. If your basis is "structural", explain the logical entailment.
- **risk_class**: copy from the ontology definition ("info" or "safety")
- **inference_basis**: either "textual" (value was found in or directly supported by specific wording in the product description/title) or "structural" (value is logically entailed by the product type, category, or activity mechanics — e.g. an indoor cooking class structurally cannot cause seasickness)

Rules:
1. For safety-class attributes, err on the side of caution. If unsure, choose the MORE restrictive value and lower confidence.
2. For info-class attributes, use your best judgment from the product details.
3. If an attribute is genuinely not applicable to this product type (e.g., seasickness_risk for an indoor cooking class), set value to null with confidence 1.0, evidence explaining why, and inference_basis "structural".
4. For best_months: Phuket high season is Nov-Apr, monsoon/low season is Jun-Sep, shoulder is May and Oct. Consider whether the activity is weather-dependent.
5. For group_type: list ALL suitable group types, not just the primary one.
6. "textual" basis means the description or title EXPLICITLY states or strongly implies the value. If you are inferring from activity type rather than stated text, that is "structural" even if your confidence is high.
7. Do NOT fabricate textual evidence. If the description does not explicitly address an attribute, use inference_basis "structural" and explain your reasoning.

Respond with a JSON object where keys are attribute names and values are objects with {value, confidence, evidence, risk_class, inference_basis}. Return ONLY valid JSON, no markdown fencing.`;
}
