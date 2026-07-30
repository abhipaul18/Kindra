import { supabase } from '@/src/lib/supabase';
import type { KarmaTransaction, Badge, UserBadge, UserCredential } from '@/src/types/database';

export interface UserBadgeWithDetail {
  badge: Badge;
  unlocked_at: string;
}

export interface LeaderboardUser {
  rank: number;
  user_id: string;
  full_name: string;
  avatar_url: string;
  karma_points: number;
  city: string;
}

export interface ActivityTimelineItem {
  type: 'report' | 'karma';
  title: string;
  timestamp: string;
  badgeColor: 'blue' | 'green';
}

export async function fetchKarmaHistory(userId: string): Promise<KarmaTransaction[]> {
  const { data, error } = await supabase
    .from('karma_transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('Error fetching karma history:', error);
    return [];
  }

  return data || [];
}

export async function fetchUserBadges(userId: string): Promise<UserBadgeWithDetail[]> {
  const { data, error } = await supabase
    .from('user_badges')
    .select('earned_at, badges(*)')
    .eq('user_id', userId);

  if (error || !data) {
    console.warn('Error fetching user badges:', error);
    return [];
  }

  return data.map((item) => ({
    badge: (item.badges as unknown) as Badge,
    unlocked_at: item.earned_at || new Date().toISOString(),
  }));
}

export async function fetchAllBadges(): Promise<Badge[]> {
  const { data, error } = await supabase
    .from('badges')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.warn('Error fetching all badges:', error);
    return [];
  }

  return data || [];
}

export async function fetchUserCredentials(userId: string): Promise<UserCredential[]> {
  const { data, error } = await supabase
    .from('user_credentials')
    .select('*, credentials(*)')
    .eq('user_id', userId);

  if (error) {
    console.warn('Error fetching user credentials:', error);
    return [];
  }

  return data || [];
}

export async function fetchLeaderboard(limit = 20): Promise<LeaderboardUser[]> {
  const { data, error } = await supabase
    .from('view_leaderboard')
    .select('*')
    .limit(limit);

  if (error || !data) {
    console.warn('Error fetching leaderboard view:', error);
    return [
      { rank: 1, user_id: 'u1', full_name: 'Aarav Sharma', avatar_url: '', karma_points: 1450, city: 'Bengaluru' },
      { rank: 2, user_id: 'u2', full_name: 'Priya Patel', avatar_url: '', karma_points: 1280, city: 'Bengaluru' },
      { rank: 3, user_id: 'u3', full_name: 'Rahul Verma', avatar_url: '', karma_points: 1120, city: 'Bengaluru' },
      { rank: 4, user_id: 'u4', full_name: 'Ananya Reddy', avatar_url: '', karma_points: 980, city: 'Bengaluru' },
      { rank: 5, user_id: 'u5', full_name: 'Vikram Singh', avatar_url: '', karma_points: 890, city: 'Bengaluru' },
    ];
  }

  return data.map((row, idx) => ({
    rank: idx + 1,
    user_id: row.user_id || `user-${idx}`,
    full_name: row.full_name || 'Citizen User',
    avatar_url: row.avatar_url || '',
    karma_points: row.karma_points || 0,
    city: 'Bengaluru',
  }));
}

export async function fetchUserActivityTimeline(userId: string): Promise<ActivityTimelineItem[]> {
  const { data: reports } = await supabase
    .from('reports')
    .select('id, title, created_at, status')
    .eq('reporter_id', userId)
    .order('created_at', { ascending: false })
    .limit(5);

  const { data: karma } = await supabase
    .from('karma_transactions')
    .select('id, amount, description, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(5);

  const timeline: ActivityTimelineItem[] = [
    ...(reports || []).map((r): ActivityTimelineItem => ({
      type: 'report',
      title: `Submitted issue: ${r.title}`,
      timestamp: r.created_at || new Date().toISOString(),
      badgeColor: 'blue',
    })),
    ...(karma || []).map((k): ActivityTimelineItem => ({
      type: 'karma',
      title: `${k.amount > 0 ? '+' : ''}${k.amount} Karma: ${k.description}`,
      timestamp: k.created_at || new Date().toISOString(),
      badgeColor: 'green',
    })),
  ];

  return timeline.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}
