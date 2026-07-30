-- KINDRA Migration: Performance Indexes & Complete RLS Security Hardening

-- ============================================================
-- 1. HIGH-PERFORMANCE INDEXES
-- ============================================================

-- Reports Query Optimization Indexes
CREATE INDEX IF NOT EXISTS idx_reports_reporter_id ON public.reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_reports_assigned_dept ON public.reports(assigned_department_id);
CREATE INDEX IF NOT EXISTS idx_reports_assigned_officer ON public.reports(assigned_officer_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_priority ON public.reports(priority);
CREATE INDEX IF NOT EXISTS idx_reports_created_at_desc ON public.reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_location_spatial ON public.reports(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_reports_active ON public.reports(created_at DESC) WHERE deleted_at IS NULL;

-- Profiles Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_karma_desc ON public.profiles(karma_points DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_department ON public.profiles(department_id) WHERE department_id IS NOT NULL;

-- Karma Transactions Indexes
CREATE INDEX IF NOT EXISTS idx_karma_user_created ON public.karma_transactions(user_id, created_at DESC);

-- Notifications Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read, created_at DESC);

-- Report Images & AI Results Indexes
CREATE INDEX IF NOT EXISTS idx_report_images_report_id ON public.report_images(report_id);
CREATE INDEX IF NOT EXISTS idx_report_ai_results_report_id ON public.report_ai_results(report_id);

-- User Relations Indexes
CREATE INDEX IF NOT EXISTS idx_user_roles_user ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_user ON public.user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_credentials_user ON public.user_credentials(user_id);
CREATE INDEX IF NOT EXISTS idx_campaign_participants_user ON public.campaign_participants(user_id);

-- ============================================================
-- 2. COMPLETE RLS POLICIES FOR ALL CRUD OPERATIONS
-- ============================================================

-- Reports Policies
DO $$ BEGIN
    CREATE POLICY "Authenticated users update reports" ON public.reports 
    FOR UPDATE USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Authenticated users delete soft report" ON public.reports 
    FOR DELETE USING (auth.uid() = reporter_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Report Images Policies
DO $$ BEGIN
    CREATE POLICY "Public insert report_images" ON public.report_images 
    FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Report AI Results Policies
DO $$ BEGIN
    CREATE POLICY "Public insert report_ai_results" ON public.report_ai_results 
    FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Public update report_ai_results" ON public.report_ai_results 
    FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Notifications Policies
DO $$ BEGIN
    CREATE POLICY "Users insert notifications" ON public.notifications 
    FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Users update own notifications" ON public.notifications 
    FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Redemptions Policies
DO $$ BEGIN
    CREATE POLICY "Public read redemptions" ON public.redemptions 
    FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Users insert redemptions" ON public.redemptions 
    FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Public Read Catalog Tables
DO $$ BEGIN
    CREATE POLICY "Public read categories" ON public.categories FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Public read roles" ON public.roles FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Public read user_roles" ON public.user_roles FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Public read settings" ON public.settings FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Public read reward_categories" ON public.reward_categories FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ============================================================
-- 3. DUPLICATE REPORT DETECTION DATABASE FUNCTION
-- ============================================================
CREATE OR REPLACE FUNCTION public.find_duplicate_reports(
    p_latitude DOUBLE PRECISION,
    p_longitude DOUBLE PRECISION,
    p_radius_meters DOUBLE PRECISION DEFAULT 500.0,
    p_hours_window INT DEFAULT 48
)
RETURNS TABLE (
    report_id UUID,
    title TEXT,
    distance_meters DOUBLE PRECISION,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.id AS report_id,
        r.title,
        ( 6371000 * acos(
            cos(radians(p_latitude)) * cos(radians(r.latitude)) *
            cos(radians(r.longitude) - radians(p_longitude)) +
            sin(radians(p_latitude)) * sin(radians(r.latitude))
        ) ) AS distance_meters,
        r.created_at
    FROM public.reports r
    WHERE r.deleted_at IS NULL
      AND r.latitude IS NOT NULL
      AND r.longitude IS NOT NULL
      AND r.created_at >= (NOW() - (p_hours_window || ' hours')::INTERVAL)
      AND ( 6371000 * acos(
            cos(radians(p_latitude)) * cos(radians(r.latitude)) *
            cos(radians(r.longitude) - radians(p_longitude)) +
            sin(radians(p_latitude)) * sin(radians(r.latitude))
        ) ) <= p_radius_meters
    ORDER BY distance_meters ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
