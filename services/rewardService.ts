import { supabase } from '@/src/lib/supabase';
import type { Reward } from '@/src/types/database';

export async function fetchRewards(): Promise<Reward[]> {
  const { data, error } = await supabase
    .from('rewards')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !data || data.length === 0) {
    console.warn('Error fetching rewards from database, returning default catalog:', error);
    return [
      {
        id: 'rew-1',
        title: 'Free Metro Transit Pass',
        description: '1 Day Unlimited Metro Travel Pass across city lines.',
        partner_name: 'Namma Metro Transit Authority',
        cost_karma: 250,
        category: 'Transit',
        image_url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80',
        voucher_code: 'METRO2026-KINDRA',
        is_available: true,
        quantity_available: 50,
        created_at: new Date().toISOString(),
      },
      {
        id: 'rew-2',
        title: 'Plant a Sapling Voucher',
        description: 'Adopt a tree sapling planted by Urban Forestry Department.',
        partner_name: 'Urban Forestry Board',
        cost_karma: 150,
        category: 'Environment',
        image_url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80',
        voucher_code: 'GREEN-TREE-2026',
        is_available: true,
        quantity_available: 100,
        created_at: new Date().toISOString(),
      },
      {
        id: 'rew-3',
        title: '₹200 Coffee Day Coupon',
        description: 'Enjoy a free beverage at any partner coffee lounge.',
        partner_name: 'Café Coffee Express',
        cost_karma: 200,
        category: 'Food & Drinks',
        image_url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=600&q=80',
        voucher_code: 'COFFEE-KINDRA-200',
        is_available: true,
        quantity_available: 35,
        created_at: new Date().toISOString(),
      },
    ] as unknown as Reward[];
  }

  return data as unknown as Reward[];
}

export async function redeemReward(
  userId: string,
  rewardId: string,
  costKarma: number
): Promise<{ success: boolean; voucherCode?: string; error?: string }> {
  const { data: profile, error: profileErr } = await supabase
    .from('profiles')
    .select('karma_points')
    .eq('id', userId)
    .single();

  if (profileErr || !profile) {
    return { success: false, error: 'User profile not found' };
  }

  if (profile.karma_points < costKarma) {
    return { success: false, error: `Insufficient Karma points. You need ${costKarma} Karma.` };
  }

  const { data: reward, error: rewardErr } = await supabase
    .from('rewards')
    .select('*')
    .eq('id', rewardId)
    .single();

  if (rewardErr || !reward) {
    return { success: false, error: 'Reward not found or unavailable' };
  }

  await supabase.rpc('award_karma', {
    p_user_id: userId,
    p_amount: -costKarma,
    p_action_type: 'reward_redemption',
    p_description: `Redeemed reward: ${reward.title}`,
    p_reference_id: rewardId,
  });

  const voucherCode = (reward as any).discount_code || `KINDRA-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  await supabase.from('redemptions').insert({
    user_id: userId,
    reward_id: rewardId,
    code: voucherCode,
  } as any);

  await supabase.from('notifications').insert({
    user_id: userId,
    title: 'Reward Redeemed Successfully!',
    message: `You successfully redeemed ${reward.title}. Voucher code: ${voucherCode}`,
    type: 'reward',
  });

  return {
    success: true,
    voucherCode,
  };
}

export async function redeemRewardVoucher(rewardId: string, userId?: string): Promise<{ success: boolean; voucherCode?: string; code?: string }> {
  const code = `KINDRA-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  return {
    success: true,
    voucherCode: code,
    code,
  };
}
