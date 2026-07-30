-- KINDRA — Mission Evidence Storage & Duplicate Detection
-- Persistent image storage with SHA-256 + perceptual hash duplicate detection

-- ============================================================
-- 1. STORAGE BUCKET
-- ============================================================
-- Note: Create the 'good-deed-evidence' bucket via Supabase Dashboard or CLI:
--   INSERT INTO storage.buckets (id, name, public) VALUES ('good-deed-evidence', 'good-deed-evidence', false);
-- This migration handles the database schema and RLS policies.

-- ============================================================
-- 2. MISSION EVIDENCE TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.mission_evidence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    mission_id TEXT NOT NULL,          -- mission identifier from client
    submission_id UUID REFERENCES public.mission_submissions(id) ON DELETE SET NULL,

    -- Storage
    storage_path TEXT NOT NULL,        -- good-deed-evidence/{userId}/{missionId}/{timestamp}_{uuid}.jpg
    public_url TEXT,                   -- signed or public URL

    -- Hashing (duplicate detection)
    image_hash TEXT NOT NULL,          -- SHA-256 hex digest (exact duplicate detection)
    perceptual_hash TEXT,              -- pHash string (near-duplicate detection)

    -- AI Verification Results
    verification_status TEXT NOT NULL DEFAULT 'pending',
        -- pending, verified, rejected, duplicate_rejected, flagged_suspicious, manual_review
    mission_match BOOLEAN,
    confidence NUMERIC(5, 2),          -- 0.00 - 100.00
    detected_activity TEXT,
    detected_objects JSONB DEFAULT '[]'::jsonb,
    fraud BOOLEAN DEFAULT FALSE,
    ai_reasoning TEXT,
    model_used TEXT,

    -- Location
    gps_latitude DOUBLE PRECISION,
    gps_longitude DOUBLE PRECISION,

    -- Context
    notes TEXT,
    device_metadata JSONB DEFAULT '{}'::jsonb,

    -- Duplicate Detection Metadata
    duplicate_of_id UUID REFERENCES public.mission_evidence(id) ON DELETE SET NULL,
    duplicate_type TEXT,               -- 'exact', 'near', 'cross_mission', null
    similarity_score NUMERIC(5, 2),    -- 0.00 - 100.00

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    verified_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. PERFORMANCE INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_mission_evidence_user_id ON public.mission_evidence(user_id);
CREATE INDEX IF NOT EXISTS idx_mission_evidence_mission_id ON public.mission_evidence(mission_id);
CREATE INDEX IF NOT EXISTS idx_mission_evidence_image_hash ON public.mission_evidence(image_hash);
CREATE INDEX IF NOT EXISTS idx_mission_evidence_perceptual_hash ON public.mission_evidence(perceptual_hash);
CREATE INDEX IF NOT EXISTS idx_mission_evidence_created_at ON public.mission_evidence(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mission_evidence_status ON public.mission_evidence(verification_status);
CREATE INDEX IF NOT EXISTS idx_mission_evidence_user_mission ON public.mission_evidence(user_id, mission_id);

-- ============================================================
-- 4. ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.mission_evidence ENABLE ROW LEVEL SECURITY;

-- Citizens can read their own evidence
CREATE POLICY "Users read own evidence"
    ON public.mission_evidence
    FOR SELECT
    TO authenticated
    USING ((SELECT auth.uid()) = user_id);

-- Citizens can insert their own evidence
CREATE POLICY "Users insert own evidence"
    ON public.mission_evidence
    FOR INSERT
    TO authenticated
    WITH CHECK ((SELECT auth.uid()) = user_id);

-- Citizens can update their own evidence (only before verification completes)
CREATE POLICY "Users update own pending evidence"
    ON public.mission_evidence
    FOR UPDATE
    TO authenticated
    USING ((SELECT auth.uid()) = user_id AND verification_status = 'pending')
    WITH CHECK ((SELECT auth.uid()) = user_id);

-- Citizens CANNOT delete evidence after creation (immutable audit trail)
-- No DELETE policy for authenticated users

-- ============================================================
-- 5. STORAGE POLICIES (for good-deed-evidence bucket)
-- ============================================================
-- These must be applied via Supabase Dashboard or storage.objects policies:
--
-- INSERT: authenticated users can upload to their own folder
--   bucket_id = 'good-deed-evidence'
--   (storage.foldername(name))[1] = auth.uid()::text
--
-- SELECT: authenticated users can read their own uploads
--   bucket_id = 'good-deed-evidence'
--   (storage.foldername(name))[1] = auth.uid()::text
--
-- No UPDATE or DELETE for authenticated users (immutable evidence)

-- ============================================================
-- 6. ADMIN ACCESS FUNCTION
-- ============================================================

-- Admin view: read all evidence for review (called via service role or admin RPC)
CREATE OR REPLACE FUNCTION public.admin_get_all_evidence(
    p_limit INT DEFAULT 50,
    p_offset INT DEFAULT 0,
    p_status TEXT DEFAULT NULL
)
RETURNS SETOF public.mission_evidence
LANGUAGE sql
SECURITY INVOKER
STABLE
AS $$
    SELECT *
    FROM public.mission_evidence
    WHERE (p_status IS NULL OR verification_status = p_status)
    ORDER BY created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
$$;
