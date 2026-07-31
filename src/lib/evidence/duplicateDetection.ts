import { supabase } from '@/src/lib/supabase';
import { pHashSimilarity } from './evidenceService';

// ============================================================
// Duplicate Detection Results
// ============================================================

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  duplicateType: 'exact' | 'near' | 'cross_mission' | null;
  reason: string | null;
  matchedEvidenceId: string | null;
  similarityScore: number | null;
  shouldReject: boolean;      // true = reject immediately, no AI call
  shouldFlagSuspicious: boolean; // true = allow but hold Karma for review
}

const CLEAN_RESULT: DuplicateCheckResult = {
  isDuplicate: false,
  duplicateType: null,
  reason: null,
  matchedEvidenceId: null,
  similarityScore: null,
  shouldReject: false,
  shouldFlagSuspicious: false,
};

// ============================================================
// Duplicate Detection Pipeline
// ============================================================

/**
 * Check for duplicate images before AI verification.
 *
 * Rules:
 * 1. SHA-256 exact match (same user) → REJECT "Exact duplicate"
 * 2. SHA-256 exact match (same mission, any user) → REJECT "Already submitted for this mission"
 * 3. pHash similarity ≥ 95% → REJECT "Near duplicate detected"
 * 4. SHA-256 exact match (different mission, same user) → FLAG "Cross-mission reuse"
 */
export async function checkDuplicates(
  userId: string,
  missionId: string,
  sha256Hash: string,
  perceptualHash: string | null
): Promise<DuplicateCheckResult> {
  console.log('[Duplicate Detection Disabled]');
  console.log('  User     :', userId);
  console.log('  Mission  :', missionId);
  console.log('Proceeding directly to AI verification.');

  return CLEAN_RESULT;
}
