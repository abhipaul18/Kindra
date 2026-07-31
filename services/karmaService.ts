import { supabase } from '@/src/lib/supabase';
import type { KarmaTransaction, KarmaRewardResponse } from '@/src/types/database';

export async function fetchKarmaTransactions(userId: string): Promise<KarmaTransaction[]> {
  const { data, error } = await supabase
    .from('karma_transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('Error fetching karma transactions:', error);
    return [];
  }

  return data as KarmaTransaction[];
}

export async function awardKarmaToUser(
  userId: string,
  amount: number,
  actionType: string,
  description: string
): Promise<void> {
  const { error } = await supabase.rpc('award_karma', {
    p_user_id: userId,
    p_amount: amount,
    p_action_type: actionType,
    p_description: description,
  });

  if (error) {
    console.warn('Error executing award_karma RPC function:', error);
  }
}

/**
 * Server-side mission Karma award.
 * Calls POST /api/karma/award which validates all 5 conditions
 * (verified, mission_match, confidence >= 85, no fraud, not double-counted)
 * before atomically awarding Karma via the database RPC.
 */
export async function awardMissionKarma(params: {
  userId: string;
  evidenceId: string;
  missionId: string;
  missionName: string;
  karmaAmount: number;
  verificationId?: string;
}): Promise<KarmaRewardResponse> {
  try {
    const response = await fetch('/api/karma/award', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    const data: KarmaRewardResponse = await response.json();
    return data;
  } catch (error: any) {
    console.error('[awardMissionKarma] Network error:', error);
    return {
      success: false,
      karma_awarded: 0,
      reason: error.message || 'network_error',
    };
  }
}
