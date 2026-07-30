export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string;
          created_at: string | null;
          entity_id: string | null;
          entity_type: string;
          id: string;
          ip_address: string | null;
          metadata: Json | null;
          user_id: string | null;
        };
        Insert: {
          action: string;
          created_at?: string | null;
          entity_id?: string | null;
          entity_type: string;
          id?: string;
          ip_address?: string | null;
          metadata?: Json | null;
          user_id?: string | null;
        };
        Update: {
          action?: string;
          created_at?: string | null;
          entity_id?: string | null;
          entity_type?: string;
          id?: string;
          ip_address?: string | null;
          metadata?: Json | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
      badges: {
        Row: {
          created_at: string | null;
          description: string;
          icon_name: string | null;
          id: string;
          image_url: string | null;
          name: string;
          xp_bonus: number | null;
        };
        Insert: {
          created_at?: string | null;
          description: string;
          icon_name?: string | null;
          id?: string;
          image_url?: string | null;
          name: string;
          xp_bonus?: number | null;
        };
        Update: {
          created_at?: string | null;
          description?: string;
          icon_name?: string | null;
          id?: string;
          image_url?: string | null;
          name?: string;
          xp_bonus?: number | null;
        };
        Relationships: [];
      };
      campaign_participants: {
        Row: {
          campaign_id: string;
          contribution_amount: number | null;
          id: string;
          joined_at: string | null;
          user_id: string;
        };
        Insert: {
          campaign_id: string;
          contribution_amount?: number | null;
          id?: string;
          joined_at?: string | null;
          user_id: string;
        };
        Update: {
          campaign_id?: string;
          contribution_amount?: number | null;
          id?: string;
          joined_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      campaign_tasks: {
        Row: {
          campaign_id: string | null;
          created_at: string | null;
          description: string;
          event_date: string;
          id: string;
          karma_reward: number;
          required_volunteers: number | null;
          signed_up_count: number | null;
          status: Database["public"]["Enums"]["task_status"] | null;
          title: string;
        };
        Insert: {
          campaign_id?: string | null;
          created_at?: string | null;
          description: string;
          event_date: string;
          id?: string;
          karma_reward?: number;
          required_volunteers?: number | null;
          signed_up_count?: number | null;
          status?: Database["public"]["Enums"]["task_status"] | null;
          title: string;
        };
        Update: {
          campaign_id?: string | null;
          created_at?: string | null;
          description?: string;
          event_date?: string;
          id?: string;
          karma_reward?: number;
          required_volunteers?: number | null;
          signed_up_count?: number | null;
          status?: Database["public"]["Enums"]["task_status"] | null;
          title?: string;
        };
        Relationships: [];
      };
      campaigns: {
        Row: {
          category_id: string | null;
          created_at: string | null;
          current_amount: number | null;
          description: string;
          id: string;
          image_url: string | null;
          partner_id: string | null;
          status: Database["public"]["Enums"]["campaign_status"];
          target_amount: number;
          title: string;
          updated_at: string | null;
        };
        Insert: {
          category_id?: string | null;
          created_at?: string | null;
          current_amount?: number | null;
          description: string;
          id?: string;
          image_url?: string | null;
          partner_id?: string | null;
          status?: Database["public"]["Enums"]["campaign_status"];
          target_amount: number;
          title: string;
          updated_at?: string | null;
        };
        Update: {
          category_id?: string | null;
          created_at?: string | null;
          current_amount?: number | null;
          description?: string;
          id?: string;
          image_url?: string | null;
          partner_id?: string | null;
          status?: Database["public"]["Enums"]["campaign_status"];
          target_amount?: number;
          title?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          created_at: string | null;
          default_department_id: string | null;
          description: string | null;
          icon_name: string | null;
          id: string;
          name: string;
        };
        Insert: {
          created_at?: string | null;
          default_department_id?: string | null;
          description?: string | null;
          icon_name?: string | null;
          id?: string;
          name: string;
        };
        Update: {
          created_at?: string | null;
          default_department_id?: string | null;
          description?: string | null;
          icon_name?: string | null;
          id?: string;
          name?: string;
        };
        Relationships: [];
      };
      credential_levels: {
        Row: {
          created_at: string | null;
          credential_id: string;
          id: string;
          level: number;
          required_karma: number;
          title: string;
        };
        Insert: {
          created_at?: string | null;
          credential_id: string;
          id?: string;
          level: number;
          required_karma: number;
          title: string;
        };
        Update: {
          created_at?: string | null;
          credential_id?: string;
          id?: string;
          level?: number;
          required_karma?: number;
          title?: string;
        };
        Relationships: [];
      };
      credentials: {
        Row: {
          category_name: string;
          created_at: string | null;
          description: string | null;
          icon_name: string | null;
          id: string;
          title: string;
        };
        Insert: {
          category_name: string;
          created_at?: string | null;
          description?: string | null;
          icon_name?: string | null;
          id?: string;
          title: string;
        };
        Update: {
          category_name?: string;
          created_at?: string | null;
          description?: string | null;
          icon_name?: string | null;
          id?: string;
          title?: string;
        };
        Relationships: [];
      };
      departments: {
        Row: {
          created_at: string | null;
          description: string | null;
          id: string;
          name: string;
          officer_count: number | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          id?: string;
          name: string;
          officer_count?: number | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          id?: string;
          name?: string;
          officer_count?: number | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      karma_transactions: {
        Row: {
          action_type: string;
          amount: number;
          created_at: string | null;
          description: string | null;
          id: string;
          reference_id: string | null;
          user_id: string;
        };
        Insert: {
          action_type: string;
          amount: number;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          reference_id?: string | null;
          user_id: string;
        };
        Update: {
          action_type?: string;
          amount?: number;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          reference_id?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      leaderboard_cache: {
        Row: {
          full_name: string;
          id: string;
          karma_points: number;
          rank_position: number;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          full_name: string;
          id?: string;
          karma_points: number;
          rank_position: number;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          full_name?: string;
          id?: string;
          karma_points?: number;
          rank_position?: number;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          created_at: string | null;
          id: string;
          is_read: boolean | null;
          message: string;
          title: string;
          type: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          is_read?: boolean | null;
          message: string;
          title: string;
          type?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          is_read?: boolean | null;
          message?: string;
          title?: string;
          type?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string | null;
          deleted_at: string | null;
          department_id: string | null;
          email: string;
          full_name: string;
          id: string;
          karma_points: number;
          partner_org_name: string | null;
          phone: string | null;
          rank_title: string | null;
          updated_at: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string | null;
          deleted_at?: string | null;
          department_id?: string | null;
          email: string;
          full_name: string;
          id: string;
          karma_points?: number;
          partner_org_name?: string | null;
          phone?: string | null;
          rank_title?: string | null;
          updated_at?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string | null;
          deleted_at?: string | null;
          department_id?: string | null;
          email?: string;
          full_name?: string;
          id?: string;
          karma_points?: number;
          partner_org_name?: string | null;
          phone?: string | null;
          rank_title?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      redemptions: {
        Row: {
          code: string;
          id: string;
          redeemed_at: string | null;
          reward_id: string;
          user_id: string;
        };
        Insert: {
          code: string;
          id?: string;
          redeemed_at?: string | null;
          reward_id: string;
          user_id: string;
        };
        Update: {
          code?: string;
          id?: string;
          redeemed_at?: string | null;
          reward_id?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      report_ai_results: {
        Row: {
          ai_summary: string | null;
          confidence_score: number | null;
          created_at: string | null;
          duplicate_report_id: string | null;
          id: string;
          is_duplicate: boolean | null;
          raw_response: Json | null;
          report_id: string;
          severity_rating: string | null;
          suggested_category: string | null;
        };
        Insert: {
          ai_summary?: string | null;
          confidence_score?: number | null;
          created_at?: string | null;
          duplicate_report_id?: string | null;
          id?: string;
          is_duplicate?: boolean | null;
          raw_response?: Json | null;
          report_id: string;
          severity_rating?: string | null;
          suggested_category?: string | null;
        };
        Update: {
          ai_summary?: string | null;
          confidence_score?: number | null;
          created_at?: string | null;
          duplicate_report_id?: string | null;
          id?: string;
          is_duplicate?: boolean | null;
          raw_response?: Json | null;
          report_id?: string;
          severity_rating?: string | null;
          suggested_category?: string | null;
        };
        Relationships: [];
      };
      report_images: {
        Row: {
          created_at: string | null;
          id: string;
          image_url: string;
          report_id: string;
          storage_path: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          image_url: string;
          report_id: string;
          storage_path?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          image_url?: string;
          report_id?: string;
          storage_path?: string | null;
        };
        Relationships: [];
      };
      reports: {
        Row: {
          assigned_department_id: string | null;
          assigned_officer_id: string | null;
          category_id: string | null;
          created_at: string | null;
          deleted_at: string | null;
          description: string;
          id: string;
          karma_awarded: number | null;
          latitude: number | null;
          location_name: string;
          longitude: number | null;
          priority: Database["public"]["Enums"]["report_priority"];
          reporter_id: string | null;
          status: Database["public"]["Enums"]["report_status"];
          title: string;
          updated_at: string | null;
        };
        Insert: {
          assigned_department_id?: string | null;
          assigned_officer_id?: string | null;
          category_id?: string | null;
          created_at?: string | null;
          deleted_at?: string | null;
          description: string;
          id?: string;
          karma_awarded?: number | null;
          latitude?: number | null;
          location_name: string;
          longitude?: number | null;
          priority?: Database["public"]["Enums"]["report_priority"];
          reporter_id?: string | null;
          status?: Database["public"]["Enums"]["report_status"];
          title: string;
          updated_at?: string | null;
        };
        Update: {
          assigned_department_id?: string | null;
          assigned_officer_id?: string | null;
          category_id?: string | null;
          created_at?: string | null;
          deleted_at?: string | null;
          description?: string;
          id?: string;
          karma_awarded?: number | null;
          latitude?: number | null;
          location_name?: string;
          longitude?: number | null;
          priority?: Database["public"]["Enums"]["report_priority"];
          reporter_id?: string | null;
          status?: Database["public"]["Enums"]["report_status"];
          title?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      reward_categories: {
        Row: {
          created_at: string | null;
          description: string | null;
          id: string;
          name: string;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          id?: string;
          name: string;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          id?: string;
          name?: string;
        };
        Relationships: [];
      };
      rewards: {
        Row: {
          category_id: string | null;
          created_at: string | null;
          description: string;
          discount_code: string;
          id: string;
          image_url: string | null;
          karma_cost: number;
          partner_id: string | null;
          partner_name: string;
          remaining: number;
          title: string;
          total_available: number;
          updated_at: string | null;
        };
        Insert: {
          category_id?: string | null;
          created_at?: string | null;
          description: string;
          discount_code: string;
          id?: string;
          image_url?: string | null;
          karma_cost: number;
          partner_id?: string | null;
          partner_name: string;
          remaining?: number;
          title: string;
          total_available?: number;
          updated_at?: string | null;
        };
        Update: {
          category_id?: string | null;
          created_at?: string | null;
          description?: string;
          discount_code?: string;
          id?: string;
          image_url?: string | null;
          karma_cost?: number;
          partner_id?: string | null;
          partner_name?: string;
          remaining?: number;
          title?: string;
          total_available?: number;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      roles: {
        Row: {
          created_at: string | null;
          description: string | null;
          id: string;
          name: Database["public"]["Enums"]["user_role"];
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          id?: string;
          name: Database["public"]["Enums"]["user_role"];
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          id?: string;
          name?: Database["public"]["Enums"]["user_role"];
        };
        Relationships: [];
      };
      settings: {
        Row: {
          created_at: string | null;
          description: string | null;
          id: string;
          key: string;
          updated_at: string | null;
          value: Json;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          id?: string;
          key: string;
          updated_at?: string | null;
          value?: Json;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          id?: string;
          key?: string;
          updated_at?: string | null;
          value?: Json;
        };
        Relationships: [];
      };
      user_badges: {
        Row: {
          badge_id: string;
          earned_at: string | null;
          id: string;
          user_id: string;
        };
        Insert: {
          badge_id: string;
          earned_at?: string | null;
          id?: string;
          user_id: string;
        };
        Update: {
          badge_id?: string;
          earned_at?: string | null;
          id?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      user_credentials: {
        Row: {
          credential_id: string;
          current_level: number | null;
          earned_at: string | null;
          id: string;
          progress_karma: number | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          credential_id: string;
          current_level?: number | null;
          earned_at?: string | null;
          id?: string;
          progress_karma?: number | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          credential_id?: string;
          current_level?: number | null;
          earned_at?: string | null;
          id?: string;
          progress_karma?: number | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          created_at: string | null;
          id: string;
          role: Database["public"]["Enums"]["user_role"];
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          role?: Database["public"]["Enums"]["user_role"];
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          role?: Database["public"]["Enums"]["user_role"];
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      view_citizen_summary: {
        Row: {
          full_name: string | null;
          karma_points: number | null;
          rank_title: string | null;
          total_badges_earned: number | null;
          total_reports_submitted: number | null;
          user_id: string | null;
        };
        Relationships: [];
      };
      view_leaderboard: {
        Row: {
          avatar_url: string | null;
          full_name: string | null;
          karma_points: number | null;
          rank_position: number | null;
          rank_title: string | null;
          user_id: string | null;
        };
        Relationships: [];
      };
      view_officer_queue: {
        Row: {
          category_name: string | null;
          created_at: string | null;
          department_name: string | null;
          description: string | null;
          location_name: string | null;
          priority: Database["public"]["Enums"]["report_priority"] | null;
          report_id: string | null;
          status: Database["public"]["Enums"]["report_status"] | null;
          title: string | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      award_karma: {
        Args: {
          p_action_type: string;
          p_amount: number;
          p_description: string;
          p_reference_id?: string;
          p_user_id: string;
        };
        Returns: undefined;
      };
    };
    Enums: {
      campaign_status: "draft" | "active" | "completed" | "paused";
      partnership_status: "pending" | "approved" | "rejected";
      report_priority: "low" | "medium" | "high" | "urgent";
      report_status:
        | "submitted"
        | "ai_verifying"
        | "needs_info"
        | "approved"
        | "in_progress"
        | "resolved"
        | "rejected";
      task_status: "open" | "in_progress" | "completed" | "cancelled";
      user_role: "citizen" | "officer" | "partner" | "admin";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

// Aliases for convenience throughout application code
export type UserRole = Database['public']['Enums']['user_role'];
export type ReportStatus = Database['public']['Enums']['report_status'];
export type ReportPriority = Database['public']['Enums']['report_priority'];
export type TaskStatus = Database['public']['Enums']['task_status'];
export type CampaignStatus = Database['public']['Enums']['campaign_status'];
export type PartnershipStatus = Database['public']['Enums']['partnership_status'];

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type UserRoleRecord = Database['public']['Tables']['user_roles']['Row'];
export type Department = Database['public']['Tables']['departments']['Row'];
export type Category = Database['public']['Tables']['categories']['Row'];

export interface CivicReport {
  id: string;
  reporter_id?: string | null;
  title: string;
  description: string;
  category_id?: string | null;
  category?: string;
  status: ReportStatus;
  priority: ReportPriority;
  latitude?: number | null;
  longitude?: number | null;
  location_name: string;
  image_url?: string | null;
  assigned_department_id?: string | null;
  assigned_officer_id?: string | null;
  karma_awarded?: number | null;
  ai_analysis?: {
    suggested_category?: string;
    confidence?: number;
    severity_rating?: string;
    summary?: string;
    tags?: string[];
  };
  deleted_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export type KarmaTransaction = Database['public']['Tables']['karma_transactions']['Row'];
export type Credential = Database['public']['Tables']['credentials']['Row'];
export type CredentialLevel = Database['public']['Tables']['credential_levels']['Row'];
export type UserCredential = Database['public']['Tables']['user_credentials']['Row'];
export type Badge = Database['public']['Tables']['badges']['Row'];
export type UserBadge = Database['public']['Tables']['user_badges']['Row'];

export interface VolunteerTask {
  id: string;
  title: string;
  description: string;
  category?: string;
  location?: string;
  required_volunteers?: number | null;
  signed_up_count?: number | null;
  karma_reward: number;
  date_time: string;
  organizer_id?: string | null;
  status?: TaskStatus | null;
  created_at?: string | null;
}

export interface Campaign {
  id: string;
  title: string;
  description: string;
  partner_id?: string | null;
  partner_name?: string | null;
  target_amount: number;
  current_amount?: number | null;
  category?: string | null;
  status: CampaignStatus;
  image_url?: string | null;
  created_at?: string | null;
}

export type Reward = Database['public']['Tables']['rewards']['Row'];
export type Redemption = Database['public']['Tables']['redemptions']['Row'];
export type NotificationItem = Database['public']['Tables']['notifications']['Row'];
