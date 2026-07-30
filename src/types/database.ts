export type UserRole = 'citizen' | 'officer' | 'partner' | 'admin';

export type ReportStatus =
  | 'submitted'
  | 'ai_verifying'
  | 'needs_info'
  | 'approved'
  | 'in_progress'
  | 'resolved'
  | 'rejected';

export type ReportPriority = 'low' | 'medium' | 'high' | 'urgent';

export type TaskStatus = 'open' | 'in_progress' | 'completed' | 'cancelled';

export type CampaignStatus = 'draft' | 'active' | 'completed' | 'paused';

export type PartnershipStatus = 'pending' | 'approved' | 'rejected';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  phone?: string;
  karma_points: number;
  rank_title?: string;
  department_id?: string;
  partner_org_name?: string;
  deleted_at?: string;
  created_at: string;
  updated_at: string;
}

export interface UserRoleRecord {
  id: string;
  user_id: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  officer_count: number;
  created_at: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  default_department_id?: string;
  icon_name?: string;
  created_at: string;
}

export interface CivicReport {
  id: string;
  reporter_id?: string;
  title: string;
  description: string;
  category_id?: string;
  category?: string;
  status: ReportStatus;
  priority: ReportPriority;
  latitude?: number;
  longitude?: number;
  location_name: string;
  image_url?: string;
  assigned_department_id?: string;
  assigned_officer_id?: string;
  karma_awarded: number;
  ai_analysis?: {
    suggested_category?: string;
    confidence?: number;
    severity_rating?: string;
    summary?: string;
    tags?: string[];
  };
  deleted_at?: string;
  created_at: string;
  updated_at: string;
}

export interface KarmaTransaction {
  id: string;
  user_id: string;
  amount: number;
  action_type: string;
  reference_id?: string;
  description?: string;
  created_at: string;
}

export interface Credential {
  id: string;
  category_name: string;
  title: string;
  description?: string;
  icon_name?: string;
  created_at: string;
}

export interface CredentialLevel {
  id: string;
  credential_id: string;
  level: number;
  title: string;
  required_karma: number;
  created_at: string;
}

export interface UserCredential {
  id: string;
  user_id: string;
  credential_id: string;
  current_level: number;
  progress_karma: number;
  earned_at: string;
  updated_at: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  image_url?: string;
  icon_name?: string;
  xp_bonus: number;
  created_at: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
}

export interface VolunteerTask {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  required_volunteers: number;
  signed_up_count?: number;
  karma_reward: number;
  date_time: string;
  organizer_id?: string;
  status: TaskStatus;
  created_at: string;
}

export interface Campaign {
  id: string;
  title: string;
  description: string;
  partner_id?: string;
  partner_name?: string;
  target_amount: number;
  current_amount: number;
  category: string;
  status: CampaignStatus;
  image_url?: string;
  created_at: string;
}

export interface Reward {
  id: string;
  category_id?: string;
  title: string;
  description: string;
  partner_name: string;
  karma_cost: number;
  discount_code: string;
  total_available: number;
  remaining: number;
  image_url?: string;
  created_at: string;
}

export interface Redemption {
  id: string;
  reward_id: string;
  user_id: string;
  code: string;
  redeemed_at: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  created_at: string;
}
