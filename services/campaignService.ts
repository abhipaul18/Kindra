import { supabase } from '@/src/lib/supabase';
import type { Campaign, VolunteerTask } from '@/src/types/database';
import { mockCampaigns, mockVolunteerTasks } from '@/src/lib/mockData';

export async function fetchActiveCampaigns(): Promise<Campaign[]> {
  try {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return mockCampaigns;
    }

    return data as Campaign[];
  } catch (err) {
    console.warn('Error fetching campaigns:', err);
    return mockCampaigns;
  }
}

export async function fetchVolunteerTasks(): Promise<VolunteerTask[]> {
  try {
    const { data, error } = await supabase
      .from('campaign_tasks')
      .select('*')
      .eq('status', 'open')
      .order('event_date', { ascending: true });

    if (error || !data || data.length === 0) {
      return mockVolunteerTasks;
    }

    return data.map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      karma_reward: t.karma_reward,
      required_volunteers: t.required_volunteers ?? 10,
      signed_up_count: t.signed_up_count ?? 0,
      date_time: t.event_date,
      status: t.status,
      category: 'Community Support',
      location: 'City Square Entrance',
    })) as VolunteerTask[];
  } catch (err) {
    console.warn('Error fetching volunteer tasks:', err);
    return mockVolunteerTasks;
  }
}

export async function signUpForVolunteerTask(taskId: string, userId: string): Promise<void> {
  try {
    const { error } = await supabase.rpc('award_karma', {
      p_user_id: userId,
      p_amount: 50,
      p_action_type: 'task_completed',
      p_description: 'Signed up for Community Volunteer Task',
      p_reference_id: taskId,
    });
    if (error) console.warn('Error recording task signup:', error);
  } catch (err) {
    console.warn('Volunteer signup fallback:', err);
  }
}

export async function joinCampaign(campaignId: string, userId: string, amount: number = 25): Promise<void> {
  try {
    await supabase.from('campaign_participants').insert([
      {
        campaign_id: campaignId,
        user_id: userId,
        contribution_amount: amount,
      },
    ]);
  } catch (err) {
    console.warn('Join campaign fallback:', err);
  }
}
