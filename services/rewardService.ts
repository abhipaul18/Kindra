import { supabase } from '@/src/lib/supabase';
import type { Reward } from '@/src/types/database';

export async function fetchRewards(): Promise<Reward[]> {
  const { data, error } = await supabase
    .from('rewards')
    .select('*')
    .gt('remaining', 0)
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('Error fetching rewards from Supabase:', error);
    return [];
  }

  return data as Reward[];
}

export async function redeemRewardVoucher(
  rewardId: string,
  userId: string
): Promise<{ code: string }> {
  const { data: reward, error: rewardErr } = await supabase
    .from('rewards')
    .select('discount_code, remaining')
    .eq('id', rewardId)
    .single();

  if (rewardErr || !reward) {
    throw new Error('Reward not found or unavailable');
  }

  const { error: insertErr } = await supabase.from('redemptions').insert([
    {
      reward_id: rewardId,
      user_id: userId,
      code: reward.discount_code,
    },
  ]);

  if (insertErr) throw insertErr;

  // Decrement remaining reward inventory
  await supabase
    .from('rewards')
    .update({ remaining: Math.max(0, reward.remaining - 1) })
    .eq('id', rewardId);

  return { code: reward.discount_code };
}
