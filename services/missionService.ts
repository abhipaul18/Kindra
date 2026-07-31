import { supabase } from '@/src/lib/supabase';
import type { MissionRecord } from '@/src/types/database';

/**
 * Fetch all active missions from the database.
 * Returns mission records with base_karma values that drive the reward engine.
 */
export async function fetchMissions(): Promise<MissionRecord[]> {
  const { data, error } = await supabase
    .from('missions')
    .select('id, title, description, category, base_karma, expected_subject, is_active, created_at, updated_at')
    .eq('is_active', true)
    .order('category', { ascending: true });

  if (error) {
    console.warn('[missionService] Error fetching missions:', error);
    return [];
  }

  return (data || []) as MissionRecord[];
}

/**
 * Fetch a single mission's karma reward value from the database.
 * Falls back to null if mission not found (lets caller use hardcoded default).
 */
export async function getMissionKarmaReward(missionId: string): Promise<number | null> {
  const { data, error } = await supabase
    .from('missions')
    .select('base_karma')
    .eq('id', missionId)
    .maybeSingle();

  if (error || !data) {
    console.warn('[missionService] Mission not found for id:', missionId);
    return null;
  }

  return data.base_karma;
}

/**
 * Fetch all completed (reward_processed) mission IDs for a user.
 * Used to persist the "completed" state across page loads.
 */
export async function fetchUserCompletedMissions(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('mission_evidence')
    .select('mission_id')
    .eq('user_id', userId)
    .eq('reward_processed', true);

  if (error) {
    console.warn('[missionService] Error fetching completed missions:', error);
    return [];
  }

  // Return unique mission_ids
  const missionIds = (data || []).map((row: any) => row.mission_id);
  return [...new Set(missionIds)];
}

/**
 * Look up mission by title (for mapping from MISSIONS_CATALOG hardcoded IDs
 * to DB UUID-based mission records).
 */
export async function findMissionByTitle(title: string): Promise<MissionRecord | null> {
  const { data, error } = await supabase
    .from('missions')
    .select('id, title, description, category, base_karma, expected_subject, is_active, created_at, updated_at')
    .eq('title', title)
    .eq('is_active', true)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as MissionRecord;
}
