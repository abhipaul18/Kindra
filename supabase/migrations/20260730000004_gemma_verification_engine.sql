-- KINDRA Gemma AI Verification Engine Production Migration
-- Normalized schemas for multimodal verification pipeline, fraud scoring, OCR, impact engine, and audit logging

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. ENUMS FOR VERIFICATION PIPELINE
-- ============================================================
DO $$ BEGIN
    CREATE TYPE verification_stage AS ENUM (
        'queued', 'multimodal_ingest', 'classification', 'vision_analysis', 
        'gps_validation', 'ocr_processing', 'fraud_detection', 'impact_calculation', 
        'karma_evaluation', 'smart_routing', 'summary_generation', 'decision_complete'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE verification_decision_status AS ENUM (
        'pending', 'auto_verified', 'verified_low_confidence', 'manual_review_required', 'auto_rejected', 'manual_approved', 'manual_rejected'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE document_ocr_type AS ENUM (
        'donation_receipt', 'blood_card', 'govt_document', 'certificate', 'hospital_document', 'qr_code', 'unknown'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE manual_review_status AS ENUM ('pending', 'approved', 'rejected', 'more_info_requested');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ============================================================
-- 2. MISSIONS & MISSION SUBMISSIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.missions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    subcategory TEXT,
    base_karma INT NOT NULL DEFAULT 100,
    required_proof_type TEXT DEFAULT 'photo', -- 'photo', 'multi_photo', 'video', 'document'
    expected_subject TEXT NOT NULL,
    geofence_lat DOUBLE PRECISION,
    geofence_lng DOUBLE PRECISION,
    geofence_radius_meters INT DEFAULT 500,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.mission_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mission_id UUID REFERENCES public.missions(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    notes TEXT,
    primary_image_url TEXT,
    media_urls TEXT[] DEFAULT ARRAY[]::TEXT[],
    video_url TEXT,
    voice_note_url TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    altitude DOUBLE PRECISION,
    gps_accuracy NUMERIC(8,2),
    location_address TEXT NOT NULL,
    device_metadata JSONB DEFAULT '{}'::jsonb,
    submission_timestamp TIMESTAMPTZ DEFAULT NOW(),
    status verification_decision_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. VERIFICATION PIPELINE QUEUE & RESULTS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.verification_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id UUID UNIQUE REFERENCES public.mission_submissions(id) ON DELETE CASCADE,
    report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    current_stage verification_stage DEFAULT 'queued',
    attempt_count INT DEFAULT 0,
    max_retries INT DEFAULT 3,
    error_log TEXT,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.verification_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    verification_request_id UUID UNIQUE REFERENCES public.verification_requests(id) ON DELETE CASCADE,
    submission_id UUID REFERENCES public.mission_submissions(id) ON DELETE CASCADE,
    report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE,
    overall_status verification_decision_status NOT NULL,
    confidence_score NUMERIC(3, 2) NOT NULL, -- 0.00 - 1.00
    overall_fraud_score NUMERIC(5, 2) NOT NULL, -- 0.00 - 100.00
    impact_score NUMERIC(5, 2) NOT NULL, -- 0.00 - 100.00
    calculated_karma INT NOT NULL DEFAULT 0,
    is_karma_awarded BOOLEAN DEFAULT FALSE,
    routed_department TEXT,
    routing_entity_type TEXT, -- 'PWD', 'Municipality', 'NGO', 'Hospital', 'Water Board', 'Electricity'
    model_version TEXT DEFAULT 'gemma-4-26b-a4b-it:free',
    summary_text TEXT,
    reasoning_text TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 4. FRAUD REPORTS & METRICS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.fraud_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    verification_result_id UUID REFERENCES public.verification_results(id) ON DELETE CASCADE,
    submission_id UUID REFERENCES public.mission_submissions(id) ON DELETE CASCADE,
    report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE,
    fraud_score NUMERIC(5, 2) NOT NULL, -- 0-100
    is_duplicate BOOLEAN DEFAULT FALSE,
    perceptual_hash TEXT,
    matched_submission_id UUID REFERENCES public.mission_submissions(id) ON DELETE SET NULL,
    is_ai_generated BOOLEAN DEFAULT FALSE,
    is_edited_or_tampered BOOLEAN DEFAULT FALSE,
    is_screenshot BOOLEAN DEFAULT FALSE,
    is_internet_stock BOOLEAN DEFAULT FALSE,
    metadata_tamper_flag BOOLEAN DEFAULT FALSE,
    timestamp_mismatch_flag BOOLEAN DEFAULT FALSE,
    gps_spoofing_flag BOOLEAN DEFAULT FALSE,
    spam_score NUMERIC(5, 2) DEFAULT 0,
    risk_level TEXT DEFAULT 'Low', -- 'Low', 'Medium', 'High', 'Critical'
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 5. OCR RESULTS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.ocr_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    verification_result_id UUID REFERENCES public.verification_results(id) ON DELETE CASCADE,
    submission_id UUID REFERENCES public.mission_submissions(id) ON DELETE CASCADE,
    document_type document_ocr_type DEFAULT 'unknown',
    extracted_text TEXT,
    structured_data JSONB DEFAULT '{}'::jsonb,
    confidence NUMERIC(3, 2) DEFAULT 0.90,
    is_authentic_document BOOLEAN DEFAULT TRUE,
    validation_reasoning TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 6. GPS LOGS & VALIDATION
-- ============================================================

CREATE TABLE IF NOT EXISTS public.gps_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    verification_result_id UUID REFERENCES public.verification_results(id) ON DELETE CASCADE,
    submission_id UUID REFERENCES public.mission_submissions(id) ON DELETE CASCADE,
    current_lat DOUBLE PRECISION,
    current_lng DOUBLE PRECISION,
    exif_lat DOUBLE PRECISION,
    exif_lng DOUBLE PRECISION,
    target_lat DOUBLE PRECISION,
    target_lng DOUBLE PRECISION,
    distance_offset_meters NUMERIC(10, 2),
    is_within_geofence BOOLEAN DEFAULT TRUE,
    travel_path_valid BOOLEAN DEFAULT TRUE,
    is_spoofed BOOLEAN DEFAULT FALSE,
    gps_confidence NUMERIC(3,2) DEFAULT 0.95,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 7. IMPACT SCORES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.impact_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    verification_result_id UUID REFERENCES public.verification_results(id) ON DELETE CASCADE,
    submission_id UUID REFERENCES public.mission_submissions(id) ON DELETE CASCADE,
    environmental_score NUMERIC(5,2) DEFAULT 0,
    community_score NUMERIC(5,2) DEFAULT 0,
    urgency_rating NUMERIC(5,2) DEFAULT 0,
    difficulty_rating NUMERIC(5,2) DEFAULT 0,
    volunteer_hours_estimated NUMERIC(5,1) DEFAULT 1.0,
    beneficiaries_count INT DEFAULT 1,
    social_value_score NUMERIC(5,2) DEFAULT 0,
    total_impact_score NUMERIC(5,2) NOT NULL, -- 0-100
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 8. ROUTING HISTORY & MANUAL REVIEWS & AI REASONING
-- ============================================================

CREATE TABLE IF NOT EXISTS public.routing_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    verification_result_id UUID REFERENCES public.verification_results(id) ON DELETE CASCADE,
    destination_department TEXT NOT NULL,
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    routing_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.manual_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    verification_result_id UUID REFERENCES public.verification_results(id) ON DELETE CASCADE,
    submission_id UUID REFERENCES public.mission_submissions(id) ON DELETE CASCADE,
    report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reviewer_role TEXT, -- 'ngo', 'government', 'moderator'
    status manual_review_status DEFAULT 'pending',
    reviewer_notes TEXT,
    evidence_requested TEXT,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ai_reasoning (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    verification_result_id UUID REFERENCES public.verification_results(id) ON DELETE CASCADE,
    submission_id UUID REFERENCES public.mission_submissions(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    subcategory TEXT,
    confidence NUMERIC(3, 2) NOT NULL,
    detected_objects JSONB DEFAULT '[]'::jsonb,
    environment_objects JSONB DEFAULT '[]'::jsonb,
    human_objects JSONB DEFAULT '[]'::jsonb,
    animal_objects JSONB DEFAULT '[]'::jsonb,
    before_after_comparison JSONB DEFAULT '{}'::jsonb,
    improvement_percentage NUMERIC(5, 2) DEFAULT 0,
    citizen_summary TEXT,
    officer_summary TEXT,
    ngo_summary TEXT,
    raw_reasoning TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 9. INDEXES FOR PERFORMANCE
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_mission_submissions_user ON public.mission_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_mission_submissions_status ON public.mission_submissions(status);
CREATE INDEX IF NOT EXISTS idx_verification_requests_stage ON public.verification_requests(current_stage);
CREATE INDEX IF NOT EXISTS idx_fraud_reports_p_hash ON public.fraud_reports(perceptual_hash);
CREATE INDEX IF NOT EXISTS idx_manual_reviews_status ON public.manual_reviews(status);
CREATE INDEX IF NOT EXISTS idx_verification_results_status ON public.verification_results(overall_status);

-- ============================================================
-- 10. ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fraud_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ocr_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gps_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.impact_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routing_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manual_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_reasoning ENABLE ROW LEVEL SECURITY;

-- Read policies
CREATE POLICY "Public read active missions" ON public.missions FOR SELECT USING (is_active = true);
CREATE POLICY "User read own submissions" ON public.mission_submissions FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'authenticated');
CREATE POLICY "User insert own submission" ON public.mission_submissions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth read verification requests" ON public.verification_requests FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Auth read verification results" ON public.verification_results FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Auth read fraud reports" ON public.fraud_reports FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Auth read ocr results" ON public.ocr_results FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Auth read gps logs" ON public.gps_logs FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Auth read impact scores" ON public.impact_scores FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Auth read routing history" ON public.routing_history FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Auth read manual reviews" ON public.manual_reviews FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Reviewers update manual reviews" ON public.manual_reviews FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth read ai reasoning" ON public.ai_reasoning FOR SELECT USING (auth.role() = 'authenticated');
