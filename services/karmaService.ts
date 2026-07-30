import { supabase } from '@/src/lib/supabase';
import type { KarmaTransaction } from '@/src/types/database';

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
