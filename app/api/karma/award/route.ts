import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database, KarmaRewardResponse } from '@/src/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

function getServerSupabase() {
  return createClient<Database>(supabaseUrl, supabaseKey);
}

/**
 * POST /api/karma/award
 * 
 * Secure server-side Karma reward endpoint.
 * Calls atomic SECURITY DEFINER RPC `process_mission_karma_reward` which validates
 * all 5 verification conditions inside PostgreSQL before awarding Karma.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, evidenceId, missionId, missionName, karmaAmount, verificationId } = body;

    // ─── Input Validation ────────────────────────────────────
    if (!userId || !evidenceId || !missionId || !missionName || !karmaAmount) {
      return NextResponse.json(
        {
          success: false,
          karma_awarded: 0,
          reason: 'missing_fields',
        } satisfies KarmaRewardResponse,
        { status: 400 }
      );
    }

    if (typeof karmaAmount !== 'number' || karmaAmount <= 0 || karmaAmount > 10000) {
      return NextResponse.json(
        {
          success: false,
          karma_awarded: 0,
          reason: 'invalid_karma_amount',
        } satisfies KarmaRewardResponse,
        { status: 400 }
      );
    }

    const supabase = getServerSupabase();

    // ─── Call Atomic RPC (SECURITY DEFINER handles 5-condition check & RLS bypass) ─────
    const { data: rpcResult, error: rpcError } = await supabase.rpc(
      'process_mission_karma_reward',
      {
        p_user_id: userId,
        p_evidence_id: evidenceId,
        p_mission_id: missionId,
        p_mission_name: missionName,
        p_karma_amount: karmaAmount,
        ...(verificationId ? { p_verification_id: verificationId } : {}),
      }
    );

    if (rpcError) {
      console.error('[Karma Award API] RPC Error:', rpcError);
      return NextResponse.json(
        {
          success: false,
          karma_awarded: 0,
          reason: `rpc_error: ${rpcError.message}`,
        } satisfies KarmaRewardResponse,
        { status: 500 }
      );
    }

    const result = rpcResult as unknown as KarmaRewardResponse;

    if (!result?.success) {
      const statusCode = result?.reason === 'already_processed' ? 409 : 403;
      return NextResponse.json(
        {
          success: false,
          karma_awarded: 0,
          reason: result?.reason || 'rpc_returned_failure',
        } satisfies KarmaRewardResponse,
        { status: statusCode }
      );
    }

    // ─── Audit Log ───────────────────────────────────────────
    try {
      await supabase.from('activity_logs').insert({
        user_id: userId,
        action: 'karma_reward_awarded',
        entity_type: 'mission_evidence',
        entity_id: evidenceId,
        metadata: {
          mission_id: missionId,
          mission_name: missionName,
          karma_awarded: result.karma_awarded,
          previous_karma: result.previous_karma,
          new_karma: result.new_karma,
          transaction_id: result.transaction_id,
        },
      });
    } catch (auditErr) {
      console.warn('[Karma Award API] Audit log write failed:', auditErr);
    }

    // ─── Success Response ────────────────────────────────────
    return NextResponse.json({
      success: true,
      karma_awarded: result.karma_awarded,
      previous_karma: result.previous_karma,
      new_karma: result.new_karma,
      transaction_id: result.transaction_id,
    } satisfies KarmaRewardResponse);
  } catch (error: any) {
    console.error('[Karma Award API] Unexpected error:', error);
    return NextResponse.json(
      {
        success: false,
        karma_awarded: 0,
        reason: error.message || 'internal_server_error',
      } satisfies KarmaRewardResponse,
      { status: 500 }
    );
  }
}
