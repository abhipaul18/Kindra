import { supabase } from '@/src/lib/supabase';

// ── Partner Rewards ──────────────────────────────────────────────
export async function fetchPartnerRewards(partnerId: string) {
  const { data } = await supabase
    .from('rewards')
    .select('*')
    .eq('partner_id', partnerId)
    .order('created_at', { ascending: false });
  return data || [];
}

export async function createPartnerReward(reward: {
  title: string;
  description: string;
  karma_cost: number;
  discount_code: string;
  total_available: number;
  partner_id: string;
  partner_name: string;
  image_url?: string;
}) {
  const { data, error } = await supabase
    .from('rewards')
    .insert({ ...reward, remaining: reward.total_available })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updatePartnerReward(rewardId: string, updates: Record<string, unknown>) {
  const { error } = await supabase
    .from('rewards')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', rewardId);
  if (error) throw error;
}

export async function deletePartnerReward(rewardId: string) {
  const { error } = await supabase.from('rewards').delete().eq('id', rewardId);
  if (error) throw error;
}

// ── Partner Redemptions ──────────────────────────────────────────
export async function fetchPartnerRedemptions(partnerId: string) {
  const { data } = await supabase
    .from('redemptions')
    .select('*, rewards!inner(partner_id, title)')
    .eq('rewards.partner_id', partnerId)
    .order('redeemed_at', { ascending: false })
    .limit(50);
  return data || [];
}

// ── Partner Campaigns ────────────────────────────────────────────
export async function fetchPartnerCampaigns(partnerId: string) {
  const { data } = await supabase
    .from('campaigns')
    .select('*')
    .eq('partner_id', partnerId)
    .order('created_at', { ascending: false });
  return data || [];
}

export async function createPartnerCampaign(campaign: {
  title: string;
  description: string;
  target_amount: number;
  partner_id: string;
  image_url?: string;
}) {
  const { data, error } = await supabase
    .from('campaigns')
    .insert({ ...campaign, status: 'draft' as const, current_amount: 0 })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updatePartnerCampaign(campaignId: string, updates: Record<string, unknown>) {
  const { error } = await supabase
    .from('campaigns')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', campaignId);
  if (error) throw error;
}

// ── Partner Stats ────────────────────────────────────────────────
export async function fetchPartnerStats(partnerId: string) {
  const [rewardsRes, redemptionsRes, campaignsRes] = await Promise.all([
    supabase.from('rewards').select('id', { count: 'exact' }).eq('partner_id', partnerId),
    supabase.from('redemptions').select('id, rewards!inner(partner_id)', { count: 'exact' }).eq('rewards.partner_id', partnerId),
    supabase.from('campaigns').select('id', { count: 'exact' }).eq('partner_id', partnerId).eq('status', 'active'),
  ]);

  return {
    totalRewards: rewardsRes.count || 0,
    totalRedemptions: redemptionsRes.count || 0,
    activeCampaigns: campaignsRes.count || 0,
  };
}
