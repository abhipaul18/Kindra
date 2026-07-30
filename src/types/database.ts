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

export interface Department {
  id: string;
  name: string;
  description?: string;
  officer_count: number;
  created_at: string;
}

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  email: string;
  avatar_url?: string;
  karma_points: number;
  department_id?: string;
  partner_org_name?: string;
  created_at: string;
  updated_at: string;
}

export interface CivicReport {
  id: string;
  title: string;
  description: string;
  category: string;
  status: ReportStatus;
  priority: ReportPriority;
  latitude?: number;
  longitude?: number;
  location_name: string;
  image_url?: string;
  reporter_id?: string;
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
  created_at: string;
  updated_at: string;
}

export interface ReportUpdate {
  id: string;
  report_id: string;
  author_id?: string;
  author_name?: string;
  status_from?: ReportStatus;
  status_to?: ReportStatus;
  comment: string;
  attachment_url?: string;
  created_at: string;
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

export interface TaskApplication {
  id: string;
  task_id: string;
  volunteer_id: string;
  status: 'applied' | 'accepted' | 'completed' | 'declined';
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

export interface RewardRedemption {
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
