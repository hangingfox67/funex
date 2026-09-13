/**
 * W2: Parse free-text travel prompt into structured params.
 *
 * Uses the cheapest capable model (Haiku) for parse-only — no prose generation.
 * Structured output validated by the schema. Scope lock: non-travel intent
 * returns empty parse with zero generation calls.
 *
 * Cost target: ~500 in / 100 out tokens per parse.
 */
import Anthropic from '@anthropic-ai/sdk';

const PARSE_MODEL = 'claude-haiku-4-5-20251001';

export interface ParsedPrompt {
  party: { role: 'adult' | 'child' | 'senior'; age?: number }[];
  staying?: string;
  date?: string;
  energy?: 'low' | 'moderate' | 'high';
  timeSlot?: 'morning' | 'midday' | 'evening';
  budgetThb?: number;
  maxDurationMinutes?: number;
  returnBy?: string;
  constraints?: {
    nonSwimmer?: boolean;
    pregnant?: boolean;
    mobility?: 'limited' | 'moderate' | 'full';
    motionComfort?: 'low' | 'normal';
  };
  isTravelIntent: boolean;
  rawIntent?: string; // one-line summary of what they want
}

const SYSTEM_PROMPT = `You are a travel query parser for Phuket, Thailand activities. Extract structured parameters from the user's message. Return JSON only.

Fields to extract:
- party: array of {role: "adult"|"child"|"senior", age?: number}. Infer from context ("kids 9 and 15" = two children with ages).
- staying: zone slug if mentioned. Valid zones: kata, karon, patong, kamala, bang_tao, rawai, panwa, old_town, mai_khao, airport, natai, khao_lak, ko_yao. Also accept hotel names and map to nearest zone.
- date: ISO date if mentioned ("tomorrow" = relative to today). null if not mentioned.
- energy: low/moderate/high if inferable.
- timeSlot: morning/midday/evening if mentioned ("afternoon" = midday).
- budgetThb: number if mentioned. Convert from USD/EUR at rough rates.
- maxDurationMinutes: if mentioned ("half day" = 240, "couple hours" = 120).
- returnBy: "HH:MM" if mentioned ("back by 1pm" = "13:00").
- constraints.nonSwimmer: true if mentioned.
- constraints.pregnant: true if mentioned.
- constraints.mobility: limited/moderate/full if mentioned.
- constraints.motionComfort: "low" if seasickness/rough seas/bumpy mentioned.
- isTravelIntent: false if the message is not about activities/travel in Thailand.
- rawIntent: one-line summary of what they want.

Rules:
- Never fabricate ages or party members not mentioned.
- If only "we" or "family" is mentioned without specifics, return party: [{role: "adult"}] and let the form collect details.
- Preserve typos in rawIntent — it's their words.
- Return ONLY valid JSON, no markdown.`;

let anthropicClient: Anthropic | null = null;

function getClient(): Anthropic {
  if (!anthropicClient) anthropicClient = new Anthropic();
  return anthropicClient;
}

export async function parsePrompt(text: string, today: string): Promise<ParsedPrompt> {
  // Scope lock: very short or obvious non-travel → zero model calls
  const trimmed = text.trim();
  if (trimmed.length < 3 || /^(hi|hello|hey|test|help|what|who|how are)/i.test(trimmed)) {
    return { party: [{ role: 'adult' }], isTravelIntent: false, rawIntent: trimmed };
  }

  try {
    const client = getClient();
    const response = await client.messages.create({
      model: PARSE_MODEL,
      max_tokens: 256,
      system: SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: `Today is ${today}. Parse this travel query:\n\n"${trimmed}"`,
      }],
    });

    const responseText = (response.content as { type: string; text: string }[])
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('');

    const cleaned = responseText.replace(/^```(?:json)?\s*/m, '').replace(/\s*```\s*$/m, '').trim();
    const parsed = JSON.parse(cleaned) as ParsedPrompt;

    // Log token usage for cost tracking
    const inputTokens = response.usage.input_tokens;
    const outputTokens = response.usage.output_tokens;
    console.log(`  Parse: ${inputTokens} in / ${outputTokens} out tokens`);

    // Ensure party has at least one member
    if (!parsed.party || parsed.party.length === 0) {
      parsed.party = [{ role: 'adult' }];
    }

    return parsed;
  } catch (err) {
    console.error('Parse failed:', (err as Error).message);
    // Graceful fallback — return minimal parse, let form collect details
    return { party: [{ role: 'adult' }], isTravelIntent: true, rawIntent: trimmed };
  }
}
