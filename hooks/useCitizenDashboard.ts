'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/src/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import type { CivicReport, NotificationItem, Credential } from '@/src/types/database';

export function useCitizenDashboard() {
  const { user } = useAuth();
  const userId = user?.id;

  // 1. User Profile Data
  const profileQuery = useQuery({
    queryKey: ['citizen-profile', userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  // 2. Unread Notifications
  const notificationsQuery = useQuery({
    queryKey: ['citizen-notifications', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as NotificationItem[];
    },
    enabled: !!userId,
  });

  // 3. User Credentials & Milestones
  const credentialsQuery = useQuery({
    queryKey: ['citizen-credentials', userId],
    queryFn: async () => {
      const { data: catalog, error: catErr } = await supabase
        .from('credentials')
        .select('*');

      if (catErr || !catalog) return [];

      if (!userId) return catalog;

      const { data: userCreds } = await supabase
        .from('user_credentials')
        .select('*')
        .eq('user_id', userId);

      return catalog.map((cred: Credential) => {
        const userMatch = userCreds?.find((uc: any) => uc.credential_id === cred.id);
        return {
          ...cred,
          current_level: userMatch?.current_level || 1,
          progress_karma: userMatch?.progress_karma || 25,
        };
      });
    },
  });

  // 4. Leaderboard Top 5 Preview
  const leaderboardQuery = useQuery({
    queryKey: ['leaderboard-preview'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, karma_points, rank_title')
        .order('karma_points', { ascending: false })
        .limit(5);

      if (error || !data) return [];
      return data.map((item, index) => ({
        ...item,
        rank_position: index + 1,
      }));
    },
  });

  // 5. User Reports Activity
  const reportsQuery = useQuery({
    queryKey: ['citizen-recent-reports', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('reporter_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) return [];
      return data as CivicReport[];
    },
    enabled: !!userId,
  });

  return {
    profile: profileQuery.data,
    isLoadingProfile: profileQuery.isLoading,
    notifications: notificationsQuery.data || [],
    unreadNotificationCount: (notificationsQuery.data || []).filter((n) => !n.is_read).length,
    credentials: credentialsQuery.data || [],
    leaderboard: leaderboardQuery.data || [],
    recentReports: reportsQuery.data || [],
  };
}
