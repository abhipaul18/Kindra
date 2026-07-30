import { supabase } from '@/src/lib/supabase';
import type { Reward } from '@/src/types/database';
import { mockRewards } from '@/src/lib/mockData';

export async function fetchRewards(): Promise<Reward[]> {
  try {
    const { data, error } = await supabase
      .from('rewards')
      .select('*')
      .gt('remaining', 0)
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return mockRewards;
    }

    return data as Reward[];
  } catch (err) {
    console.warn('Error fetching rewards from Supabase:', err);
    return mockRewards;
  }
}

export async function redeemRewardVoucher(
  rewardId: string,
  userId: string
): Promise<{ code: string }> {
  try {
    const { data: reward, error: rewardErr } = await supabase
      .from('rewards')
      .select('discount_code, remaining')
      .eq('id', rewardId)
      .single();

    if (rewardErr || !reward) {
      // Fallback for mock rewards
      const mockMatch = mockRewards.find((r) => r.id === rewardId);
      return { code: mockMatch?.discount_code || 'KINDRA-DEFAULT-2026' };
    }

    const { error: insertErr } = await supabase.from('redemptions').insert([
      {
        reward_id: rewardId,
        user_id: userId,
        code: reward.discount_code,
      },
    ]);

    if (insertErr) {
      console.warn('Redemption log warning:', insertErr);
    }

    // Decrement remaining reward inventory
    await supabase
      .from('rewards')
      .update({ remaining: Math.max(0, reward.remaining - 1) })
      .eq('id', rewardId);

    return { code: reward.discount_code };
  } catch (err) {
    console.warn('Reward redemption error fallback:', err);
    return { code: 'KINDRA-REDEEMED-2026' };
  }
}
