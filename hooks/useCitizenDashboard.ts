'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/src/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import type { CivicReport, NotificationItem, Credential, UserCredential } from '@/src/types/database';
import { mockCivicReports, mockNotifications } from '@/src/lib/mockData';

export interface FormattedUserCredential {
  id: string;
  category_name: string;
  title: string;
  description: string;
  icon_name: string;
  current_level: number;
  progress_karma: number;
}

export function useCitizenDashboard() {
  const { user, profile: authProfile } = useAuth();
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
        .maybeSingle();
      if (error) return authProfile;
      return data;
    },
    enabled: !!userId,
  });

  // 2. Unread Notifications
  const notificationsQuery = useQuery({
    queryKey: ['citizen-notifications', userId],
    queryFn: async () => {
      if (!userId) return mockNotifications;
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) return mockNotifications;
      return data as NotificationItem[];
    },
  });

  // 3. User Credentials & Milestones
  const credentialsQuery = useQuery({
    queryKey: ['citizen-credentials', userId],
    queryFn: async (): Promise<FormattedUserCredential[]> => {
      const { data: catalog, error: catErr } = await supabase
        .from('credentials')
        .select('*');

      if (catErr || !catalog || catalog.length === 0) {
        return [
          { id: 'c1', category_name: 'Civic Reporting', title: 'Master Reporter', description: '', icon_name: 'flag', current_level: 2, progress_karma: 150 },
          { id: 'c2', category_name: 'Tree Plantation', title: 'Green Guardian', description: '', icon_name: 'eco', current_level: 1, progress_karma: 75 },
          { id: 'c3', category_name: 'Cleanliness', title: 'Sanitation Hero', description: '', icon_name: 'delete', current_level: 1, progress_karma: 50 },
        ];
      }

      let userCreds: UserCredential[] = [];
      if (userId) {
        const { data } = await supabase
          .from('user_credentials')
          .select('*')
          .eq('user_id', userId);
        userCreds = data || [];
      }

      return catalog.map((cred: Credential) => {
        const userMatch = userCreds.find((uc: UserCredential) => uc.credential_id === cred.id);
        return {
          id: cred.id,
          category_name: cred.category_name,
          title: cred.title,
          description: cred.description || '',
          icon_name: cred.icon_name || 'verified',
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

      if (error || !data || data.length === 0) {
        return [
          { id: 'u1', full_name: 'Aarav Sharma', karma_points: 1450, rank_title: 'Civic Legend', rank_position: 1 },
          { id: 'u2', full_name: 'Priya Patel', karma_points: 1220, rank_title: 'Civic Hero', rank_position: 2 },
          { id: 'u3', full_name: 'Rahul Verma', karma_points: 980, rank_title: 'Civic Champion', rank_position: 3 },
          { id: 'u4', full_name: 'Ananya Gupta', karma_points: 750, rank_title: 'Civic Guardian', rank_position: 4 },
          { id: 'u5', full_name: 'Vikram Singh', karma_points: 620, rank_title: 'Civic Reporter', rank_position: 5 },
        ];
      }

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
      if (!userId) return mockCivicReports;
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('reporter_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error || !data || data.length === 0) return mockCivicReports;
      return data as CivicReport[];
    },
  });

  return {
    profile: profileQuery.data || authProfile,
    isLoadingProfile: profileQuery.isLoading,
    notifications: notificationsQuery.data || [],
    unreadNotificationCount: (notificationsQuery.data || []).filter((n) => !n.is_read).length,
    credentials: credentialsQuery.data || [],
    leaderboard: leaderboardQuery.data || [],
    recentReports: reportsQuery.data || [],
  };
}
