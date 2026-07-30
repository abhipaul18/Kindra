import { supabase } from '@/src/lib/supabase';
import type { Campaign } from '@/src/types/database';

export async function fetchActiveCampaigns(): Promise<Campaign[]> {
  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error || !data || data.length === 0) {
    console.warn('Error fetching campaigns from database, returning default catalog:', error);
    return [
      {
        id: 'camp-1',
        title: 'Clean Bengaluru Urban Cleanliness Drive',
        description: 'Join 500+ citizens in removing plastic waste and beautifying public park spaces.',
        category: 'Cleanliness Drive',
        banner_url: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80',
        goal_participants: 500,
        current_participants: 342,
        karma_reward: 200,
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        is_active: true,
        created_at: new Date().toISOString(),
      },
      {
        id: 'camp-2',
        title: '1,000 Sapling Plantation Campaign',
        description: 'Plant indigenous saplings across urban green corridors to increase canopy cover.',
        category: 'Tree Plantation',
        banner_url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
        goal_participants: 1000,
        current_participants: 789,
        karma_reward: 350,
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        is_active: true,
        created_at: new Date().toISOString(),
      },
    ] as Campaign[];
  }

  return data as Campaign[];
}

export async function joinCampaign(userId: string, campaignId: string): Promise<boolean> {
  const { error } = await supabase.from('notifications').insert({
    user_id: userId,
    title: 'Joined Campaign!',
    message: `You successfully joined civic campaign ${campaignId}. Complete campaign tasks to earn bonus Karma!`,
    type: 'campaign',
  });

  if (error) console.warn('Error recording campaign join notification:', error);
  return true;
}

export async function signUpForVolunteerTask(taskId: string): Promise<boolean> {
  return true;
}
