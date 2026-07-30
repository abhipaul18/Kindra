import { supabase } from '@/src/lib/supabase';
import type { NotificationItem } from '@/src/types/database';
import { mockNotifications } from '@/src/lib/mockData';

export async function fetchUserNotifications(userId: string): Promise<NotificationItem[]> {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return mockNotifications.map((n) => ({ ...n, user_id: userId }));
    }

    return data.map((n) => ({
      ...n,
      type: (n.type as 'info' | 'success' | 'warning' | 'error') || 'info',
      is_read: n.is_read ?? false,
    })) as NotificationItem[];
  } catch (err) {
    console.warn('Error fetching notifications:', err);
    return mockNotifications.map((n) => ({ ...n, user_id: userId }));
  }
}

export async function markNotificationsAsRead(userId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId);

    if (error) {
      console.warn('Error updating notifications read status:', error);
    }
  } catch (err) {
    console.warn('Mark notification read fallback:', err);
  }
}
