/**
 * Types for the ranker. Deliberately avoids importing from router/connectors.
 * Uses the same shapes as graph's ExperienceRow but declared locally to
 * enforce Directive 8.
 */

export interface RankAttribute {
  key: string;
  value: unknown;
  confidence: number;
  evidence: { source: string; pointer: string; inference_basis?: string; gate_status?: string }[];
  riskClass: string;
}

export interface ExperienceRow {
  id: string;
  title: string;
  category: string;
  durationMinutes: number | null;
  basePriceCents: number | null;
  meetingPoints: { lat: number; lng: number; label: string }[];
  enrichmentTier: 'enriched' | 'basic';
  attributes: RankAttribute[];
}

export interface RankedCandidate {
  experienceId: string;
  title: string;
  category: string;
  durationMinutes: number | null;
  priceThb: number | null;
  enrichmentTier: 'enriched' | 'basic';
  tier: 'excellent' | 'good' | 'fair';
  score: number;
  reasons: string[];
  attributes: RankAttribute[];
  mobilityNote: string | null;
  bookingConstraints: string[];
  transferMinutes: number | null;
}
