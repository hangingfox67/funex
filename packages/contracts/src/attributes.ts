import { z } from 'zod';

/**
 * Served attribute shape.
 *
 * "unconfirmed" flags, never erases. The API response carries the
 * preliminary value alongside status="unconfirmed" so agents see
 * both the lean and the caution.
 *
 * An attribute is "confirmed" only when:
 *   - ≥2 independent sources agree, OR
 *   - inference_basis is "structural" with confidence ≥0.9
 *
 * A "textual" extraction from a single source at ANY confidence
 * (including 1.0) serves as "unconfirmed".
 */
export const ServedAttributeSchema = z.object({
  key: z.string(),
  value: z.unknown(),
  status: z.enum(['confirmed', 'unconfirmed']),
  confidence: z.number().min(0).max(1),
  basis: z.enum(['textual', 'structural', 'unverified']),
  risk_class: z.enum(['info', 'safety']),
});

export type ServedAttribute = z.infer<typeof ServedAttributeSchema>;

/**
 * Build the served attribute from stored data.
 * Gate logic lives here — single source of truth for serve-time status.
 */
export function toServedAttribute(stored: {
  key: string;
  value: unknown;
  confidence: number;
  riskClass: string;
  evidence: { source: string; pointer: string; inference_basis?: string; gate_status?: string }[];
}): ServedAttribute {
  const basis = (stored.evidence[0]?.inference_basis ?? 'structural') as 'textual' | 'structural' | 'unverified';
  const evidenceCount = stored.evidence.length;

  let status: 'confirmed' | 'unconfirmed' = 'confirmed';

  if (stored.riskClass === 'safety') {
    // Unverified basis: never gate-eligible
    if (basis === 'unverified') {
      status = 'unconfirmed';
    } else {
      // Check stored gate_status first (set at approve time)
      const storedGate = stored.evidence[0]?.gate_status;
      if (storedGate === 'unconfirmed') {
        status = 'unconfirmed';
      } else if (!storedGate) {
        // Fallback: recompute gate (for pre-gate data or manual inserts)
        const passesGate =
          evidenceCount >= 2 ||
          (basis === 'structural' && stored.confidence >= 0.9);
        if (!passesGate) status = 'unconfirmed';
      }
    }
  }

  // Parse stored JSON value
  let value = stored.value;
  if (typeof value === 'string') {
    try { value = JSON.parse(value); } catch { /* keep as string */ }
  }

  return {
    key: stored.key,
    value,
    status,
    confidence: stored.confidence,
    basis,
    risk_class: stored.riskClass as 'info' | 'safety',
  };
}
