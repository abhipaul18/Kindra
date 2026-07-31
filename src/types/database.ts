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
          mission_id: string | null;
          mission_name: string | null;
          previous_karma: number | null;
          new_karma: number | null;
          verification_id: string | null;
          reason: string | null;
        };
        Insert: {
          action_type: string;
          amount: number;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          reference_id?: string | null;
          user_id: string;
          mission_id?: string | null;
          mission_name?: string | null;
          previous_karma?: number | null;
          new_karma?: number | null;
          verification_id?: string | null;
          reason?: string | null;
        };
        Update: {
          action_type?: string;
          amount?: number;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          reference_id?: string | null;
          user_id?: string;
          mission_id?: string | null;
          mission_name?: string | null;
          previous_karma?: number | null;
          new_karma?: number | null;
          verification_id?: string | null;
          reason?: string | null;
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
      missions: {
        Row: {
          id: string;
          title: string;
          description: string;
          category: string;
          subcategory: string | null;
          base_karma: number;
          required_proof_type: string | null;
          expected_subject: string;
          geofence_lat: number | null;
          geofence_lng: number | null;
          geofence_radius_meters: number | null;
          is_active: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          category: string;
          subcategory?: string | null;
          base_karma?: number;
          required_proof_type?: string | null;
          expected_subject: string;
          geofence_lat?: number | null;
          geofence_lng?: number | null;
          geofence_radius_meters?: number | null;
          is_active?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          category?: string;
          subcategory?: string | null;
          base_karma?: number;
          required_proof_type?: string | null;
          expected_subject?: string;
          geofence_lat?: number | null;
          geofence_lng?: number | null;
          geofence_radius_meters?: number | null;
          is_active?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      mission_evidence: {
        Row: {
          id: string;
          user_id: string;
          mission_id: string;
          submission_id: string | null;
          storage_path: string;
          public_url: string | null;
          image_hash: string;
          perceptual_hash: string | null;
          verification_status: string;
          mission_match: boolean | null;
          confidence: number | null;
          detected_activity: string | null;
          detected_objects: Json;
          fraud: boolean;
          ai_reasoning: string | null;
          model_used: string | null;
          gps_latitude: number | null;
          gps_longitude: number | null;
          notes: string | null;
          device_metadata: Json;
          duplicate_of_id: string | null;
          duplicate_type: string | null;
          similarity_score: number | null;
          reward_processed: boolean | null;
          created_at: string;
          verified_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          mission_id: string;
          submission_id?: string | null;
          storage_path: string;
          public_url?: string | null;
          image_hash: string;
          perceptual_hash?: string | null;
          verification_status?: string;
          mission_match?: boolean | null;
          confidence?: number | null;
          detected_activity?: string | null;
          detected_objects?: Json;
          fraud?: boolean;
          ai_reasoning?: string | null;
          model_used?: string | null;
          gps_latitude?: number | null;
          gps_longitude?: number | null;
          notes?: string | null;
          device_metadata?: Json;
          duplicate_of_id?: string | null;
          duplicate_type?: string | null;
          similarity_score?: number | null;
          reward_processed?: boolean | null;
          created_at?: string;
          verified_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          mission_id?: string;
          submission_id?: string | null;
          storage_path?: string;
          public_url?: string | null;
          image_hash?: string;
          perceptual_hash?: string | null;
          verification_status?: string;
          mission_match?: boolean | null;
          confidence?: number | null;
          detected_activity?: string | null;
          detected_objects?: Json;
          fraud?: boolean;
          ai_reasoning?: string | null;
          model_used?: string | null;
          gps_latitude?: number | null;
          gps_longitude?: number | null;
          notes?: string | null;
          device_metadata?: Json;
          duplicate_of_id?: string | null;
          duplicate_type?: string | null;
          similarity_score?: number | null;
          reward_processed?: boolean | null;
          created_at?: string;
          verified_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      mission_submissions: {
        Row: {
          id: string;
          mission_id: string | null;
          user_id: string;
          title: string;
          notes: string | null;
          primary_image_url: string | null;
          media_urls: string[] | null;
          video_url: string | null;
          voice_note_url: string | null;
          latitude: number | null;
          longitude: number | null;
          altitude: number | null;
          gps_accuracy: number | null;
          location_address: string;
          device_metadata: Json | null;
          submission_timestamp: string | null;
          status: string;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          mission_id?: string | null;
          user_id: string;
          title: string;
          notes?: string | null;
          primary_image_url?: string | null;
          media_urls?: string[] | null;
          video_url?: string | null;
          voice_note_url?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          altitude?: number | null;
          gps_accuracy?: number | null;
          location_address: string;
          device_metadata?: Json | null;
          submission_timestamp?: string | null;
          status?: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          mission_id?: string | null;
          user_id?: string;
          title?: string;
          notes?: string | null;
          primary_image_url?: string | null;
          media_urls?: string[] | null;
          video_url?: string | null;
          voice_note_url?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          altitude?: number | null;
          gps_accuracy?: number | null;
          location_address?: string;
          device_metadata?: Json | null;
          submission_timestamp?: string | null;
          status?: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      verification_requests: {
        Row: {
          id: string;
          submission_id: string | null;
          report_id: string | null;
          user_id: string;
          current_stage: string | null;
          attempt_count: number | null;
          max_retries: number | null;
          error_log: string | null;
          started_at: string | null;
          completed_at: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          submission_id?: string | null;
          report_id?: string | null;
          user_id: string;
          current_stage?: string | null;
          attempt_count?: number | null;
          max_retries?: number | null;
          error_log?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          submission_id?: string | null;
          report_id?: string | null;
          user_id?: string;
          current_stage?: string | null;
          attempt_count?: number | null;
          max_retries?: number | null;
          error_log?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      verification_results: {
        Row: {
          id: string;
          verification_request_id: string | null;
          submission_id: string | null;
          report_id: string | null;
          overall_status: string;
          confidence_score: number;
          overall_fraud_score: number;
          impact_score: number;
          calculated_karma: number;
          is_karma_awarded: boolean | null;
          routed_department: string | null;
          routing_entity_type: string | null;
          model_version: string | null;
          summary_text: string | null;
          reasoning_text: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          verification_request_id?: string | null;
          submission_id?: string | null;
          report_id?: string | null;
          overall_status: string;
          confidence_score: number;
          overall_fraud_score: number;
          impact_score: number;
          calculated_karma?: number;
          is_karma_awarded?: boolean | null;
          routed_department?: string | null;
          routing_entity_type?: string | null;
          model_version?: string | null;
          summary_text?: string | null;
          reasoning_text?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          verification_request_id?: string | null;
          submission_id?: string | null;
          report_id?: string | null;
          overall_status?: string;
          confidence_score?: number;
          overall_fraud_score?: number;
          impact_score?: number;
          calculated_karma?: number;
          is_karma_awarded?: boolean | null;
          routed_department?: string | null;
          routing_entity_type?: string | null;
          model_version?: string | null;
          summary_text?: string | null;
          reasoning_text?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      fraud_reports: {
        Row: {
          id: string;
          verification_result_id: string | null;
          submission_id: string | null;
          report_id: string | null;
          fraud_score: number;
          is_duplicate: boolean | null;
          perceptual_hash: string | null;
          matched_submission_id: string | null;
          is_ai_generated: boolean | null;
          is_edited_or_tampered: boolean | null;
          is_screenshot: boolean | null;
          is_internet_stock: boolean | null;
          metadata_tamper_flag: boolean | null;
          timestamp_mismatch_flag: boolean | null;
          gps_spoofing_flag: boolean | null;
          spam_score: number | null;
          risk_level: string | null;
          details: Json | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          verification_result_id?: string | null;
          submission_id?: string | null;
          report_id?: string | null;
          fraud_score: number;
          is_duplicate?: boolean | null;
          perceptual_hash?: string | null;
          matched_submission_id?: string | null;
          is_ai_generated?: boolean | null;
          is_edited_or_tampered?: boolean | null;
          is_screenshot?: boolean | null;
          is_internet_stock?: boolean | null;
          metadata_tamper_flag?: boolean | null;
          timestamp_mismatch_flag?: boolean | null;
          gps_spoofing_flag?: boolean | null;
          spam_score?: number | null;
          risk_level?: string | null;
          details?: Json | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          verification_result_id?: string | null;
          submission_id?: string | null;
          report_id?: string | null;
          fraud_score?: number;
          is_duplicate?: boolean | null;
          perceptual_hash?: string | null;
          matched_submission_id?: string | null;
          is_ai_generated?: boolean | null;
          is_edited_or_tampered?: boolean | null;
          is_screenshot?: boolean | null;
          is_internet_stock?: boolean | null;
          metadata_tamper_flag?: boolean | null;
          timestamp_mismatch_flag?: boolean | null;
          gps_spoofing_flag?: boolean | null;
          spam_score?: number | null;
          risk_level?: string | null;
          details?: Json | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      ocr_results: {
        Row: {
          id: string;
          verification_result_id: string | null;
          submission_id: string | null;
          document_type: string | null;
          extracted_text: string | null;
          structured_data: Json | null;
          confidence: number | null;
          is_authentic_document: boolean | null;
          validation_reasoning: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          verification_result_id?: string | null;
          submission_id?: string | null;
          document_type?: string | null;
          extracted_text?: string | null;
          structured_data?: Json | null;
          confidence?: number | null;
          is_authentic_document?: boolean | null;
          validation_reasoning?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          verification_result_id?: string | null;
          submission_id?: string | null;
          document_type?: string | null;
          extracted_text?: string | null;
          structured_data?: Json | null;
          confidence?: number | null;
          is_authentic_document?: boolean | null;
          validation_reasoning?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      gps_logs: {
        Row: {
          id: string;
          verification_result_id: string | null;
          submission_id: string | null;
          current_lat: number | null;
          current_lng: number | null;
          exif_lat: number | null;
          exif_lng: number | null;
          target_lat: number | null;
          target_lng: number | null;
          distance_offset_meters: number | null;
          is_within_geofence: boolean | null;
          travel_path_valid: boolean | null;
          is_spoofed: boolean | null;
          gps_confidence: number | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          verification_result_id?: string | null;
          submission_id?: string | null;
          current_lat?: number | null;
          current_lng?: number | null;
          exif_lat?: number | null;
          exif_lng?: number | null;
          target_lat?: number | null;
          target_lng?: number | null;
          distance_offset_meters?: number | null;
          is_within_geofence?: boolean | null;
          travel_path_valid?: boolean | null;
          is_spoofed?: boolean | null;
          gps_confidence?: number | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          verification_result_id?: string | null;
          submission_id?: string | null;
          current_lat?: number | null;
          current_lng?: number | null;
          exif_lat?: number | null;
          exif_lng?: number | null;
          target_lat?: number | null;
          target_lng?: number | null;
          distance_offset_meters?: number | null;
          is_within_geofence?: boolean | null;
          travel_path_valid?: boolean | null;
          is_spoofed?: boolean | null;
          gps_confidence?: number | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      impact_scores: {
        Row: {
          id: string;
          verification_result_id: string | null;
          submission_id: string | null;
          environmental_score: number | null;
          community_score: number | null;
          urgency_rating: number | null;
          difficulty_rating: number | null;
          volunteer_hours_estimated: number | null;
          beneficiaries_count: number | null;
          social_value_score: number | null;
          total_impact_score: number;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          verification_result_id?: string | null;
          submission_id?: string | null;
          environmental_score?: number | null;
          community_score?: number | null;
          urgency_rating?: number | null;
          difficulty_rating?: number | null;
          volunteer_hours_estimated?: number | null;
          beneficiaries_count?: number | null;
          social_value_score?: number | null;
          total_impact_score: number;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          verification_result_id?: string | null;
          submission_id?: string | null;
          environmental_score?: number | null;
          community_score?: number | null;
          urgency_rating?: number | null;
          difficulty_rating?: number | null;
          volunteer_hours_estimated?: number | null;
          beneficiaries_count?: number | null;
          social_value_score?: number | null;
          total_impact_score?: number;
          created_at?: string | null;
        };
        Relationships: [];
      };
      routing_history: {
        Row: {
          id: string;
          verification_result_id: string | null;
          destination_department: string;
          department_id: string | null;
          assigned_at: string | null;
          routing_reason: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          verification_result_id?: string | null;
          destination_department: string;
          department_id?: string | null;
          assigned_at?: string | null;
          routing_reason?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          verification_result_id?: string | null;
          destination_department?: string;
          department_id?: string | null;
          assigned_at?: string | null;
          routing_reason?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      manual_reviews: {
        Row: {
          id: string;
          verification_result_id: string | null;
          submission_id: string | null;
          report_id: string | null;
          reviewer_id: string | null;
          reviewer_role: string | null;
          status: string | null;
          reviewer_notes: string | null;
          evidence_requested: string | null;
          reviewed_at: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          verification_result_id?: string | null;
          submission_id?: string | null;
          report_id?: string | null;
          reviewer_id?: string | null;
          reviewer_role?: string | null;
          status?: string | null;
          reviewer_notes?: string | null;
          evidence_requested?: string | null;
          reviewed_at?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          verification_result_id?: string | null;
          submission_id?: string | null;
          report_id?: string | null;
          reviewer_id?: string | null;
          reviewer_role?: string | null;
          status?: string | null;
          reviewer_notes?: string | null;
          evidence_requested?: string | null;
          reviewed_at?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      ai_reasoning: {
        Row: {
          id: string;
          verification_result_id: string | null;
          submission_id: string | null;
          category: string;
          subcategory: string | null;
          confidence: number;
          detected_objects: Json | null;
          environment_objects: Json | null;
          human_objects: Json | null;
          animal_objects: Json | null;
          before_after_comparison: Json | null;
          improvement_percentage: number | null;
          citizen_summary: string | null;
          officer_summary: string | null;
          ngo_summary: string | null;
          raw_reasoning: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          verification_result_id?: string | null;
          submission_id?: string | null;
          category: string;
          subcategory?: string | null;
          confidence: number;
          detected_objects?: Json | null;
          environment_objects?: Json | null;
          human_objects?: Json | null;
          animal_objects?: Json | null;
          before_after_comparison?: Json | null;
          improvement_percentage?: number | null;
          citizen_summary?: string | null;
          officer_summary?: string | null;
          ngo_summary?: string | null;
          raw_reasoning?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          verification_result_id?: string | null;
          submission_id?: string | null;
          category?: string;
          subcategory?: string | null;
          confidence?: number;
          detected_objects?: Json | null;
          environment_objects?: Json | null;
          human_objects?: Json | null;
          animal_objects?: Json | null;
          before_after_comparison?: Json | null;
          improvement_percentage?: number | null;
          citizen_summary?: string | null;
          officer_summary?: string | null;
          ngo_summary?: string | null;
          raw_reasoning?: string | null;
          created_at?: string | null;
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
      process_mission_karma_reward: {
        Args: {
          p_user_id: string;
          p_evidence_id: string;
          p_mission_id: string;
          p_mission_name: string;
          p_karma_amount: number;
          p_verification_id?: string;
        };
        Returns: Json;
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

// Karma Reward Engine types
export interface KarmaRewardResponse {
  success: boolean;
  karma_awarded: number;
  previous_karma?: number;
  new_karma?: number;
  transaction_id?: string;
  reason?: string;
}

export interface MissionRecord {
  id: string;
  title: string;
  description: string;
  category: string;
  base_karma: number;
  expected_subject: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}
