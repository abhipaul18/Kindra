-- KINDRA Phase 1 Complete Backend Migration
-- Enable UUID OS extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. ENUMS & ROLES
-- ============================================================
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('citizen', 'officer', 'partner', 'admin');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE report_status AS ENUM ('submitted', 'ai_verifying', 'needs_info', 'approved', 'in_progress', 'resolved', 'rejected');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE report_priority AS ENUM ('low', 'medium', 'high', 'urgent');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE campaign_status AS ENUM ('draft', 'active', 'completed', 'paused');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE task_status AS ENUM ('open', 'in_progress', 'completed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE partnership_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ============================================================
-- 2. STORAGE BUCKETS SETUP
-- ============================================================
INSERT INTO storage.buckets (id, name, public) VALUES 
('avatars', 'avatars', true),
('reports', 'reports', true),
('campaigns', 'campaigns', true),
('badges', 'badges', true),
('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 3. CORE TABLES
-- ============================================================

-- SYSTEM SETTINGS
CREATE TABLE IF NOT EXISTS public.settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ROLES CATALOG
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name user_role UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- DEPARTMENTS
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    officer_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    default_department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    icon_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    phone TEXT,
    karma_points INT NOT NULL DEFAULT 100,
    rank_title TEXT DEFAULT 'Civic Beginner',
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    partner_org_name TEXT,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- USER ROLES (Mapping 1:1 for current role)
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'citizen',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- REPORTS
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    status report_status NOT NULL DEFAULT 'submitted',
    priority report_priority NOT NULL DEFAULT 'medium',
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    location_name TEXT NOT NULL,
    assigned_department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    assigned_officer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    karma_awarded INT DEFAULT 0,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- REPORT IMAGES
CREATE TABLE IF NOT EXISTS public.report_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    storage_path TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- REPORT AI RESULTS
CREATE TABLE IF NOT EXISTS public.report_ai_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID UNIQUE NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
    suggested_category TEXT,
    confidence_score NUMERIC(3, 2),
    severity_rating TEXT,
    ai_summary TEXT,
    is_duplicate BOOLEAN DEFAULT FALSE,
    duplicate_report_id UUID REFERENCES public.reports(id) ON DELETE SET NULL,
    raw_response JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- KARMA TRANSACTIONS
CREATE TABLE IF NOT EXISTS public.karma_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount INT NOT NULL,
    action_type TEXT NOT NULL, -- 'report_submitted', 'report_approved', 'task_completed', 'reward_redeemed'
    reference_id UUID,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CREDENTIALS
CREATE TABLE IF NOT EXISTS public.credentials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_name TEXT NOT NULL, -- 'Cleanliness', 'Tree Plantation', 'Civic Reporting', 'Water Conservation'
    title TEXT NOT NULL,
    description TEXT,
    icon_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CREDENTIAL LEVELS
CREATE TABLE IF NOT EXISTS public.credential_levels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    credential_id UUID NOT NULL REFERENCES public.credentials(id) ON DELETE CASCADE,
    level INT NOT NULL,
    title TEXT NOT NULL,
    required_karma INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(credential_id, level)
);

-- USER CREDENTIALS
CREATE TABLE IF NOT EXISTS public.user_credentials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    credential_id UUID NOT NULL REFERENCES public.credentials(id) ON DELETE CASCADE,
    current_level INT DEFAULT 1,
    progress_karma INT DEFAULT 0,
    earned_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, credential_id)
);

-- BADGES
CREATE TABLE IF NOT EXISTS public.badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT,
    icon_name TEXT,
    xp_bonus INT DEFAULT 50,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- USER BADGES
CREATE TABLE IF NOT EXISTS public.user_badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, badge_id)
);

-- REWARD CATEGORIES
CREATE TABLE IF NOT EXISTS public.reward_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- REWARDS
CREATE TABLE IF NOT EXISTS public.rewards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES public.reward_categories(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    partner_name TEXT NOT NULL,
    partner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    karma_cost INT NOT NULL,
    discount_code TEXT NOT NULL,
    total_available INT NOT NULL DEFAULT 100,
    remaining INT NOT NULL DEFAULT 100,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- REDEMPTIONS
CREATE TABLE IF NOT EXISTS public.redemptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reward_id UUID NOT NULL REFERENCES public.rewards(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    redeemed_at TIMESTAMPTZ DEFAULT NOW()
);

-- CAMPAIGNS
CREATE TABLE IF NOT EXISTS public.campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    partner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    target_amount NUMERIC(10, 2) NOT NULL,
    current_amount NUMERIC(10, 2) DEFAULT 0,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    status campaign_status NOT NULL DEFAULT 'active',
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CAMPAIGN PARTICIPANTS
CREATE TABLE IF NOT EXISTS public.campaign_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    contribution_amount NUMERIC(10, 2) DEFAULT 0,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(campaign_id, user_id)
);

-- CAMPAIGN TASKS
CREATE TABLE IF NOT EXISTS public.campaign_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    karma_reward INT NOT NULL DEFAULT 50,
    required_volunteers INT DEFAULT 10,
    signed_up_count INT DEFAULT 0,
    status task_status DEFAULT 'open',
    event_date TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- LEADERBOARD CACHE
CREATE TABLE IF NOT EXISTS public.leaderboard_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    karma_points INT NOT NULL,
    rank_position INT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ACTIVITY LOGS (Audit)
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    metadata JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_ai_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.karma_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Public read policies for catalogs & reference data
CREATE POLICY "Public read profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public read reports" ON public.reports FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "Public read report_images" ON public.report_images FOR SELECT USING (true);
CREATE POLICY "Public read report_ai_results" ON public.report_ai_results FOR SELECT USING (true);

-- User specific write policies
CREATE POLICY "User update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Citizen insert own report" ON public.reports FOR INSERT WITH CHECK (auth.uid() = reporter_id OR reporter_id IS NULL);
CREATE POLICY "User read own karma" ON public.karma_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "User read own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);

-- Storage Policies
CREATE POLICY "Public Read Avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Auth Insert Avatars" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');
CREATE POLICY "Public Read Reports Storage" ON storage.objects FOR SELECT USING (bucket_id = 'reports');
CREATE POLICY "Auth Insert Reports Storage" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'reports' AND auth.role() = 'authenticated');

-- ============================================================
-- 5. DATABASE FUNCTIONS & TRIGGERS
-- ============================================================

-- Function: Automatic Profile Creation after Auth Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, karma_points)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
        100
    )
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'citizen')
    ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Auth User Signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function: Award Karma Points
CREATE OR REPLACE FUNCTION public.award_karma(
    p_user_id UUID,
    p_amount INT,
    p_action_type TEXT,
    p_description TEXT,
    p_reference_id UUID DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    -- Record Transaction
    INSERT INTO public.karma_transactions (user_id, amount, action_type, description, reference_id)
    VALUES (p_user_id, p_amount, p_action_type, p_description, p_reference_id);

    -- Update Profile Total Karma
    UPDATE public.profiles
    SET karma_points = karma_points + p_amount,
        updated_at = NOW()
    WHERE id = p_user_id;

    -- Create Notification
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (
        p_user_id,
        'Karma Points Awarded!',
        FORMAT('You earned +%s Karma for: %s', p_amount, p_description),
        'success'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 6. VIEWS
-- ============================================================

-- Leaderboard View
CREATE OR REPLACE VIEW public.view_leaderboard AS
SELECT 
    p.id AS user_id,
    p.full_name,
    p.avatar_url,
    p.karma_points,
    p.rank_title,
    RANK() OVER (ORDER BY p.karma_points DESC) AS rank_position
FROM public.profiles p
WHERE p.deleted_at IS NULL;

-- Officer Queue View
CREATE OR REPLACE VIEW public.view_officer_queue AS
SELECT 
    r.id AS report_id,
    r.title,
    r.description,
    c.name AS category_name,
    r.status,
    r.priority,
    r.location_name,
    d.name AS department_name,
    r.created_at
FROM public.reports r
LEFT JOIN public.categories c ON r.category_id = c.id
LEFT JOIN public.departments d ON r.assigned_department_id = d.id
WHERE r.deleted_at IS NULL;

-- Citizen Summary View
CREATE OR REPLACE VIEW public.view_citizen_summary AS
SELECT 
    p.id AS user_id,
    p.full_name,
    p.karma_points,
    p.rank_title,
    COUNT(DISTINCT r.id) AS total_reports_submitted,
    COUNT(DISTINCT ur.id) AS total_badges_earned
FROM public.profiles p
LEFT JOIN public.reports r ON p.id = r.reporter_id
LEFT JOIN public.user_badges ur ON p.id = ur.user_id
GROUP BY p.id;

-- ============================================================
-- 7. SEED DATA
-- ============================================================

-- Roles Seed
INSERT INTO public.roles (name, description) VALUES
('citizen', 'Standard citizen participant reporting issues and volunteering'),
('officer', 'Municipal officer managing report queues and dispatching crews'),
('partner', 'Corporate partner sponsoring campaigns and offering Karma rewards'),
('admin', 'Platform administrator overseeing system settings and analytics')
ON CONFLICT (name) DO NOTHING;

-- Departments Seed
INSERT INTO public.departments (name, description, officer_count) VALUES
('Roads & Infrastructure', 'Pothole repairs, asphalt paving, street lights', 14),
('Sanitation & Waste', 'Public trash, illegal dumping, recycling collection', 22),
('Public Safety & Utilities', 'Traffic lights, hazard mitigation, utility lines', 18),
('Parks & Recreation', 'Park maintenance, tree pruning, green spaces', 9)
ON CONFLICT (name) DO NOTHING;

-- Categories Seed
INSERT INTO public.categories (name, description, icon_name) VALUES
('Roads & Infrastructure', 'Road cavities, potholes, broken sidewalks', 'engineering'),
('Sanitation & Waste', 'Overflowing dumpsters, garbage pileup', 'delete'),
('Public Safety & Utilities', 'Damaged streetlights, exposed power lines', 'warning'),
('Parks & Recreation', 'Park equipment damage, fallen branches', 'park')
ON CONFLICT (name) DO NOTHING;

-- Badges Seed
INSERT INTO public.badges (name, description, icon_name, xp_bonus) VALUES
('First Reporter', 'Submitted your first verified civic issue report', 'flag', 50),
('Civic Hero', 'Earned over 500 Karma points helping your city', 'military_tech', 100),
('Green Guardian', 'Participated in community tree planting and eco tasks', 'eco', 75)
ON CONFLICT (name) DO NOTHING;

-- Reward Categories & Seed
INSERT INTO public.reward_categories (name, description) VALUES
('Food & Dining', 'Discounts at local cafes, bakeries, and restaurants'),
('Public Transit', 'Subsidized bus and subway commuter passes'),
('Eco Gear', 'Sustainable community products')
ON CONFLICT (name) DO NOTHING;

-- System Settings Seed
INSERT INTO public.settings (key, value, description) VALUES
('karma_config', '{"report_submitted": 50, "report_resolved": 100, "task_completed": 75}'::jsonb, 'Base karma points calculation values')
ON CONFLICT (key) DO NOTHING;
