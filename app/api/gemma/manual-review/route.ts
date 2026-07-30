import { NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabase';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { reviewId, reviewerId, action, reviewerNotes, karmaOverride } = body;

    if (!reviewId || !reviewerId || !action) {
      return NextResponse.json(
        { error: 'Missing reviewId, reviewerId, or action parameters.' },
        { status: 400 }
      );
    }

    // 1. Fetch manual review record
    const { data: reviewRecord, error } = await supabase
      .from('manual_reviews')
      .select('*')
      .eq('id', reviewId)
      .single();

    if (error || !reviewRecord) {
      return NextResponse.json({ error: 'Manual review record not found' }, { status: 404 });
    }

    let verificationResultData: any = null;
    if (reviewRecord.verification_result_id) {
      const { data: vRes } = await supabase
        .from('verification_results')
        .select('*')
        .eq('id', reviewRecord.verification_result_id)
        .maybeSingle();
      verificationResultData = vRes;
    }

    let newStatus: 'manual_approved' | 'manual_rejected' | 'pending' = 'pending';
    let reviewStatusText: 'approved' | 'rejected' | 'more_info_requested' = 'approved';

    if (action === 'approve') {
      newStatus = 'manual_approved';
      reviewStatusText = 'approved';
    } else if (action === 'reject') {
      newStatus = 'manual_rejected';
      reviewStatusText = 'rejected';
    } else if (action === 'request_info') {
      reviewStatusText = 'more_info_requested';
    }

    // 2. Update manual_reviews table
    await supabase
      .from('manual_reviews')
      .update({
        reviewer_id: reviewerId,
        status: reviewStatusText,
        reviewer_notes: reviewerNotes || `Reviewer action: ${action}`,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', reviewId);

    // 3. Update verification_results & submission status
    if (reviewRecord.verification_result_id) {
      await supabase
        .from('verification_results')
        .update({
          overall_status: newStatus,
          reasoning_text: `Manual Review Completed by Reviewer #${reviewerId}. Action: ${action.toUpperCase()}. Notes: ${reviewerNotes || 'Approved'}`,
        })
        .eq('id', reviewRecord.verification_result_id);
    }

    if (reviewRecord.submission_id) {
      await supabase
        .from('mission_submissions')
        .update({
          status: newStatus,
        })
        .eq('id', reviewRecord.submission_id);

      // Award Karma if approved by manual reviewer
      if (action === 'approve') {
        const { data: sub } = await supabase
          .from('mission_submissions')
          .select('user_id')
          .eq('id', reviewRecord.submission_id)
          .single();

        if (sub?.user_id) {
          const karmaToAward = karmaOverride || verificationResultData?.calculated_karma || 100;
          await supabase.rpc('award_karma', {
            p_user_id: sub.user_id,
            p_amount: karmaToAward,
            p_action_type: 'manual_review_approved',
            p_description: 'Karma awarded after manual reviewer verification',
            p_reference_id: reviewRecord.submission_id,
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      reviewId,
      action,
      updatedStatus: newStatus,
    });
  } catch (error: any) {
    console.error('[API /api/gemma/manual-review Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Manual Review Action Error' },
      { status: 500 }
    );
  }
}
