import { supabase } from '@/src/lib/supabase';
import type { NotificationItem } from '@/src/types/database';

export async function fetchUserNotifications(userId: string): Promise<NotificationItem[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('Error fetching notifications:', error);
    return [];
  }

  return data as NotificationItem[];
}

export async function markNotificationsAsRead(userId: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId);

  if (error) {
    console.warn('Error updating notifications read status:', error);
  }
}
