/**
 * Phase 4 enforcement test: every field in tool schemas and responses
 * must be documented in DATA-INVENTORY.md.
 *
 * Fails if any field is missing from the inventory.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..', '..', '..', '..');
const inventory = readFileSync(resolve(repoRoot, 'meta', 'DATA-INVENTORY.md'), 'utf-8').toLowerCase();

// All fields that appear in tool inputs (from the Zod schema)
const SEARCH_INPUT_FIELDS = [
  'destination', 'date', 'staying', 'party', 'role', 'age',
  'non_swimmer', 'pregnant', 'mobility', 'motion_comfort',
  'energy', 'time_slot', 'budget_thb', 'max_duration_minutes',
  'return_by', 'max_results', 'exclude', 'seen', 'experience_id',
];

// All fields that appear in search_experiences response
const SEARCH_RESPONSE_FIELDS = [
  'experience_id', 'title', 'category', 'duration_minutes',
  'price_per_person_thb', 'price_note', 'fit', 'reasons',
  'book_now_url', 'booking_note', 'mobility_note',
  'booking_constraints', 'alternatives',
  'resultquality', 'conditions', 'weather', 'sea', 'season',
  'refine', 'totalmatch', 'cannarrowby', 'catalog',
];

// All fields that appear in get_experience response
const GET_EXPERIENCE_RESPONSE_FIELDS = [
  'experience_id', 'title', 'category', 'duration_minutes',
  'price_per_person_thb', 'price_note', 'attributes',
  'book_now_url', 'booking_note',
];

// Fields that must NOT appear in responses (privacy)
const BANNED_RESPONSE_FIELDS = [
  'sessionid', 'session_id', 'as_of', 'generated_at',
  'enrichmenttier', 'portfoliorole', 'excludedunverified',
  'basiccount', 'enrichedcount', 'rain_buckets',
];

describe('DATA-INVENTORY.md coverage', () => {
  it('every search input field is documented', () => {
    const missing: string[] = [];
    for (const field of SEARCH_INPUT_FIELDS) {
      if (!inventory.includes(field.toLowerCase())) {
        missing.push(field);
      }
    }
    expect(missing, `Undocumented input fields: ${missing.join(', ')}`).toEqual([]);
  });

  it('every search response field is documented', () => {
    const missing: string[] = [];
    for (const field of SEARCH_RESPONSE_FIELDS) {
      if (!inventory.includes(field.toLowerCase())) {
        missing.push(field);
      }
    }
    expect(missing, `Undocumented response fields: ${missing.join(', ')}`).toEqual([]);
  });

  it('every get_experience response field is documented', () => {
    const missing: string[] = [];
    for (const field of GET_EXPERIENCE_RESPONSE_FIELDS) {
      if (!inventory.includes(field.toLowerCase())) {
        missing.push(field);
      }
    }
    expect(missing, `Undocumented response fields: ${missing.join(', ')}`).toEqual([]);
  });

  it('banned fields are NOT in responses (privacy)', () => {
    // This test reads the actual tools.ts response construction
    const toolsCode = readFileSync(resolve(__dirname, '..', 'tools.ts'), 'utf-8');

    // Extract the response object construction
    for (const banned of BANNED_RESPONSE_FIELDS) {
      // Check if the banned field name appears as a key in response objects
      const asKey = new RegExp(`\\b${banned}\\b\\s*:`, 'i');
      const inResponse = asKey.test(toolsCode);
      // Allow if it's in a comment or the event log (not in response objects)
      if (inResponse) {
        // Check it's not in the return statement
        const returnBlocks = toolsCode.match(/return \{[\s\S]*?\};/g) ?? [];
        for (const block of returnBlocks) {
          expect(
            asKey.test(block),
            `Banned field "${banned}" found in a return statement`,
          ).toBe(false);
        }
      }
    }
  });

  it('event log does not store constraint values', () => {
    const toolsCode = readFileSync(resolve(__dirname, '..', 'tools.ts'), 'utf-8');
    // Find eventWriter.log calls and check none contain constraint values
    const logCalls = toolsCode.match(/eventWriter\.log\([^)]+\{[\s\S]*?\}\)/g) ?? [];
    for (const call of logCalls) {
      expect(call).not.toContain('pregnant');
      expect(call).not.toContain('nonSwimmer');
      expect(call).not.toContain('motionComfort');
      // 'mobility' might appear in other contexts, check specifically for the constraint
      expect(call).not.toMatch(/mobility['"]\s*:/);
    }
  });
});
