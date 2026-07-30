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
  console.log('[Duplicate Detection] Starting check...');
  console.log('  User     :', userId);
  console.log('  Mission  :', missionId);
  console.log('  SHA-256  :', sha256Hash);
  console.log('  pHash    :', perceptualHash);

  try {
    // ── Check 1: Exact SHA-256 match (same user) ────────────────
    const { data: exactMatches, error: exactError } = await supabase
      .from('mission_evidence')
      .select('id, mission_id, user_id, verification_status')
      .eq('image_hash', sha256Hash)
      .eq('user_id', userId)
      .limit(5);

    if (exactError) {
      console.warn('[Duplicate Detection] DB query error:', exactError.message);
      return CLEAN_RESULT; // Fail open — allow verification to proceed
    }

    if (exactMatches && exactMatches.length > 0) {
      const sameMission = exactMatches.find(m => m.mission_id === missionId);

      if (sameMission) {
        console.log('[Duplicate Detection] EXACT DUPLICATE — same user, same mission');
        return {
          isDuplicate: true,
          duplicateType: 'exact',
          reason: 'Exact duplicate image already submitted for this mission.',
          matchedEvidenceId: sameMission.id,
          similarityScore: 100,
          shouldReject: true,
          shouldFlagSuspicious: false,
        };
      }

      // Same image, different mission (cross-mission reuse)
      const crossMission = exactMatches[0];
      console.log('[Duplicate Detection] CROSS-MISSION REUSE — same image used for different mission');
      return {
        isDuplicate: true,
        duplicateType: 'cross_mission',
        reason: `This image was already submitted for a different mission (${crossMission.mission_id}). Karma withheld pending review.`,
        matchedEvidenceId: crossMission.id,
        similarityScore: 100,
        shouldReject: false,
        shouldFlagSuspicious: true,
      };
    }

    // ── Check 2: Same mission exact match (any user) ────────────
    const { data: missionExact } = await supabase
      .from('mission_evidence')
      .select('id, user_id')
      .eq('image_hash', sha256Hash)
      .eq('mission_id', missionId)
      .limit(1);

    if (missionExact && missionExact.length > 0) {
      console.log('[Duplicate Detection] EXACT DUPLICATE — same image already submitted for this mission by another user');
      return {
        isDuplicate: true,
        duplicateType: 'exact',
        reason: 'This image has already been submitted for this mission.',
        matchedEvidenceId: missionExact[0].id,
        similarityScore: 100,
        shouldReject: true,
        shouldFlagSuspicious: false,
      };
    }

    // ── Check 3: Perceptual hash near-duplicate ─────────────────
    if (perceptualHash) {
      // Fetch recent evidence pHashes for comparison
      const { data: recentEvidence } = await supabase
        .from('mission_evidence')
        .select('id, perceptual_hash, mission_id, user_id')
        .not('perceptual_hash', 'is', null)
        .order('created_at', { ascending: false })
        .limit(200);

      if (recentEvidence) {
        for (const existing of recentEvidence) {
          if (!existing.perceptual_hash) continue;

          const similarity = pHashSimilarity(perceptualHash, existing.perceptual_hash);

          if (similarity >= 95) {
            console.log(`[Duplicate Detection] NEAR DUPLICATE — ${similarity.toFixed(1)}% similarity with evidence ${existing.id}`);
            return {
              isDuplicate: true,
              duplicateType: 'near',
              reason: `Near-duplicate image detected (${similarity.toFixed(1)}% similarity). This appears to be a modified version of a previously submitted image.`,
              matchedEvidenceId: existing.id,
              similarityScore: similarity,
              shouldReject: true,
              shouldFlagSuspicious: false,
            };
          }
        }
      }
    }

    console.log('[Duplicate Detection] CLEAN — no duplicates found');
    return CLEAN_RESULT;

  } catch (err) {
    console.error('[Duplicate Detection] Unexpected error:', err);
    return CLEAN_RESULT; // Fail open
  }
}
