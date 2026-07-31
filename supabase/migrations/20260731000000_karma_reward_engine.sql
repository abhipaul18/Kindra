-- KINDRA — Karma Reward Engine Migration
-- Adds double-reward prevention, mission karma tracking, and atomic reward RPC

-- ============================================================
-- 1. ADD reward_processed TO mission_evidence
-- ============================================================
ALTER TABLE public.mission_evidence
  ADD COLUMN IF NOT EXISTS reward_processed BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_mission_evidence_reward_processed
  ON public.mission_evidence(user_id, mission_id)
  WHERE reward_processed = TRUE;

-- ============================================================
-- 2. ADD reward_processed TO verification_results
-- ============================================================
ALTER TABLE public.verification_results
  ADD COLUMN IF NOT EXISTS reward_processed BOOLEAN NOT NULL DEFAULT FALSE;

-- ============================================================
-- 3. ADD mission_id, mission_name TO karma_transactions
-- ============================================================
ALTER TABLE public.karma_transactions
  ADD COLUMN IF NOT EXISTS mission_id TEXT,
  ADD COLUMN IF NOT EXISTS mission_name TEXT,
  ADD COLUMN IF NOT EXISTS previous_karma INT,
  ADD COLUMN IF NOT EXISTS new_karma INT,
  ADD COLUMN IF NOT EXISTS verification_id UUID,
  ADD COLUMN IF NOT EXISTS reason TEXT;

CREATE INDEX IF NOT EXISTS idx_karma_transactions_mission_id
  ON public.karma_transactions(mission_id);

-- ============================================================
-- 4. SEED / UPSERT MISSIONS TABLE WITH SPEC KARMA VALUES
-- ============================================================
INSERT INTO public.missions (id, title, description, category, base_karma, expected_subject, is_active)
VALUES
  ('7ce5d47a-47c7-4217-982d-a71d6db550d4', 'Plant a Tree', 'Help restore the local canopy, improve air quality, and build a greener future.', 'Environment', 250, 'planted sapling, green plant, leaves, flora, or tree in soil', TRUE),
  ('ea7054c5-2ddb-48a0-8364-21ff7581ca0e', 'Support Orphanage & Elderly', 'Assist with supply kits and companionship for senior & childcare centers.', 'Social Welfare', 180, 'donated books, toys, sponsored meal receipts, or care home support', TRUE),
  ('bf2227bf-0dfd-4bbc-a2f9-f16305954da9', 'Report Road Potholes', 'Help keep our streets safe. Document and report damaged roads.', 'Civic Action', 50, 'damaged road asphalt, pothole, or street infrastructure hazard', TRUE),
  ('d0b00000-0001-4000-8000-000000000001', 'Donate Books', 'Stock the community learning library. Share the gift of knowledge.', 'Education', 120, 'educational books, novels, or library donation drop-off counter', TRUE),
  ('d0b00000-0002-4000-8000-000000000002', 'Feed Stray Animals', 'Support local animal welfare with clean water and food bowls.', 'Animal Welfare', 80, 'water bowl, animal food bowl, or stray dog/cat feeding station', TRUE),
  ('d0b00000-0003-4000-8000-000000000003', 'Blood Donation Drive', 'Participate in the hospital blood drive. Save up to 3 lives.', 'Healthcare', 300, 'official blood donor certificate, hospital donor card, or blood drive tag', TRUE),
  ('d0b00000-0004-4000-8000-000000000004', 'Garbage Cleanup', 'Organize and execute community garbage cleanup drives.', 'Environment', 100, 'garbage bags, trash pickup, cleanup area', TRUE),
  ('d0b00000-0005-4000-8000-000000000005', 'Water Conservation', 'Implement water-saving solutions in your neighborhood.', 'Environment', 150, 'rain barrel, water harvesting, fixed leak, conservation activity', TRUE),
  ('d0b00000-0006-4000-8000-000000000006', 'Tree Watering', 'Water community planted trees regularly for healthy growth.', 'Environment', 60, 'watering can, hose, tree being watered, wet soil around tree', TRUE),
  ('d0b00000-0007-4000-8000-000000000007', 'Plastic Recycling', 'Collect and deliver plastic waste to certified recycling centers.', 'Environment', 90, 'plastic bottles, recycling bin, recycling center, sorted waste', TRUE),
  ('d0b00000-0008-4000-8000-000000000008', 'Medicine Donation', 'Donate unexpired medicines to community health centers.', 'Healthcare', 200, 'medicine packets, pharmacy donation, health center drop-off', TRUE),
  ('d0b00000-0009-4000-8000-000000000009', 'Food Donation', 'Donate cooked or packaged food to those in need.', 'Social Welfare', 150, 'food packages, cooked meal distribution, food bank donation', TRUE),
  ('d0b00000-000a-4000-8000-00000000000a', 'Volunteer Teaching', 'Teach underprivileged children in community learning centers.', 'Education', 170, 'classroom, whiteboard, students, teaching session, books', TRUE),
  ('d0b00000-000b-4000-8000-00000000000b', 'Clothes Donation', 'Donate clean, gently used clothing to community shelters.', 'Social Welfare', 130, 'folded clothes, donation box, shelter drop-off, clothing bags', TRUE),
  ('d0b00000-000c-4000-8000-00000000000c', 'Animal Rescue', 'Rescue injured or stranded animals and connect with shelters.', 'Animal Welfare', 220, 'rescued animal, animal shelter, veterinary care, animal transport', TRUE)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  base_karma = EXCLUDED.base_karma,
  expected_subject = EXCLUDED.expected_subject,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- ============================================================
-- 5. ATOMIC KARMA REWARD RPC FUNCTION
-- ============================================================
CREATE OR REPLACE FUNCTION public.process_mission_karma_reward(
  p_user_id UUID,
  p_evidence_id UUID,
  p_mission_id TEXT,
  p_mission_name TEXT,
  p_karma_amount INT,
  p_verification_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_already_processed BOOLEAN;
  v_previous_karma INT;
  v_new_karma INT;
  v_transaction_id UUID;
BEGIN
  -- 1. Check double-reward prevention
  SELECT reward_processed INTO v_already_processed
  FROM public.mission_evidence
  WHERE id = p_evidence_id AND user_id = p_user_id;

  IF v_already_processed IS NULL THEN
    RETURN jsonb_build_object('success', FALSE, 'reason', 'evidence_not_found', 'karma_awarded', 0);
  END IF;

  IF v_already_processed = TRUE THEN
    RETURN jsonb_build_object('success', FALSE, 'reason', 'already_processed', 'karma_awarded', 0);
  END IF;

  -- 2. Get current karma
  SELECT karma_points INTO v_previous_karma
  FROM public.profiles WHERE id = p_user_id;

  IF v_previous_karma IS NULL THEN
    RETURN jsonb_build_object('success', FALSE, 'reason', 'user_not_found', 'karma_awarded', 0);
  END IF;

  v_new_karma := v_previous_karma + p_karma_amount;

  -- 3. Update profile karma
  UPDATE public.profiles SET karma_points = v_new_karma, updated_at = NOW() WHERE id = p_user_id;

  -- 4. Insert karma transaction with full audit trail
  INSERT INTO public.karma_transactions (
    user_id, amount, action_type, description, reference_id,
    mission_id, mission_name, previous_karma, new_karma, verification_id, reason
  ) VALUES (
    p_user_id, p_karma_amount, 'mission_completed',
    FORMAT('Mission Completed: %s (+%s Karma)', p_mission_name, p_karma_amount),
    p_evidence_id, p_mission_id, p_mission_name, v_previous_karma, v_new_karma,
    p_verification_id, 'Mission Completed'
  ) RETURNING id INTO v_transaction_id;

  -- 5. Mark evidence as processed
  UPDATE public.mission_evidence SET reward_processed = TRUE, updated_at = NOW()
  WHERE id = p_evidence_id AND user_id = p_user_id;

  -- 6. Mark verification result if provided
  IF p_verification_id IS NOT NULL THEN
    UPDATE public.verification_results SET reward_processed = TRUE, is_karma_awarded = TRUE
    WHERE id = p_verification_id;
  END IF;

  -- 7. Notification
  INSERT INTO public.notifications (user_id, title, message, type) VALUES (
    p_user_id, '🎉 Mission Karma Awarded!',
    FORMAT('You earned +%s Karma for completing "%s"! Your total is now %s Karma.', p_karma_amount, p_mission_name, v_new_karma),
    'karma_reward'
  );

  RETURN jsonb_build_object(
    'success', TRUE, 'karma_awarded', p_karma_amount,
    'previous_karma', v_previous_karma, 'new_karma', v_new_karma,
    'transaction_id', v_transaction_id
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.process_mission_karma_reward TO authenticated;
GRANT EXECUTE ON FUNCTION public.process_mission_karma_reward TO service_role;
