import { supabase } from '@/src/lib/supabase';
import type { Campaign, VolunteerTask } from '@/src/types/database';

export async function fetchActiveCampaigns(): Promise<Campaign[]> {
  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('Error fetching campaigns:', error);
    return [];
  }

  return data as Campaign[];
}

export async function fetchVolunteerTasks(): Promise<VolunteerTask[]> {
  const { data, error } = await supabase
    .from('volunteer_tasks')
    .select('*')
    .eq('status', 'open')
    .order('date_time', { ascending: true });

  if (error) {
    console.warn('Error fetching volunteer tasks:', error);
    return [];
  }

  return data as VolunteerTask[];
}
