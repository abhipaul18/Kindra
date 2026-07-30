import { supabase } from '@/src/lib/supabase';
import { executeGemmaVerificationPipeline } from '@/src/lib/gemma/verificationPipeline';
import type { AIVerificationResult } from '@/src/lib/openrouter';
import type { ReportPriority } from '@/src/types/database';

export async function verifyCivicReport(reportId: string): Promise<{
  aiResult: AIVerificationResult;
  isDuplicate: boolean;
  duplicateCount: number;
  finalKarma: number;
  pipelineOutput?: any;
}> {
  // 1. Fetch report details & image from database
  const { data: report, error } = await supabase
    .from('reports')
    .select('*')
    .eq('id', reportId)
    .single();

  if (error || !report) {
    throw new Error(`Report ${reportId} not found in database`);
  }

  const { data: imageRecords } = await supabase
    .from('report_images')
    .select('image_url')
    .eq('report_id', reportId);

  const images = imageRecords && imageRecords.length > 0
    ? imageRecords.map(r => r.image_url)
    : ['https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=60'];

  // 2. Execute Full Gemma AI Verification Production Pipeline
  const pipelineOutput = await executeGemmaVerificationPipeline({
    userId: report.reporter_id || '00000000-0000-0000-0000-000000000000',
    reportId: report.id,
    title: report.title,
    notes: report.description,
    images,
    latitude: report.latitude || 28.6139,
    longitude: report.longitude || 77.2090,
    locationAddress: report.location_name,
  });

  const isDuplicate = pipelineOutput.fraud.isDuplicate;
  const finalKarma = pipelineOutput.karma.finalKarmaAwarded;

  let mappedPriority: ReportPriority = 'medium';
  if (pipelineOutput.impact.urgencyRating > 80) mappedPriority = 'urgent';
  else if (pipelineOutput.impact.urgencyRating > 60) mappedPriority = 'high';
  else if (pipelineOutput.impact.urgencyRating < 30) mappedPriority = 'low';

  // 3. Query Department ID for matching department name
  let assignedDepartmentId = report.assigned_department_id;
  if (pipelineOutput.routing.destinationDepartment) {
    const { data: dept } = await supabase
      .from('departments')
      .select('id')
      .ilike('name', `%${pipelineOutput.routing.routingTargetEntity}%`)
      .maybeSingle();

    if (dept) {
      assignedDepartmentId = dept.id;
    }
  }

  // 4. Update Reports PostgreSQL Table with verified state
  const isApproved = pipelineOutput.decision.status === 'auto_verified' || pipelineOutput.decision.status === 'verified_low_confidence';
  const newStatus = isApproved ? 'approved' : pipelineOutput.decision.requiresManualReview ? 'ai_verifying' : 'rejected';

  await supabase
    .from('reports')
    .update({
      status: newStatus,
      priority: mappedPriority,
      assigned_department_id: assignedDepartmentId,
      karma_awarded: isApproved ? finalKarma : 0,
      updated_at: new Date().toISOString(),
    })
    .eq('id', reportId);

  // 5. Insert into report_ai_results table for backwards compatibility
  await supabase.from('report_ai_results').upsert({
    report_id: reportId,
    suggested_category: pipelineOutput.classification.category,
    confidence_score: pipelineOutput.decision.confidenceScore,
    severity_rating: mappedPriority.toUpperCase(),
    ai_summary: pipelineOutput.summaries.executiveSummary,
    is_duplicate: isDuplicate,
    raw_response: JSON.parse(JSON.stringify(pipelineOutput)),
  });

  const aiResult: AIVerificationResult = {
    is_valid: isApproved,
    category: pipelineOutput.classification.category,
    confidence: pipelineOutput.decision.confidenceScore,
    severity: mappedPriority === 'urgent' ? 'Critical' : mappedPriority === 'high' ? 'High' : 'Medium',
    urgency: mappedPriority === 'urgent' ? 'Urgent' : mappedPriority === 'high' ? 'High' : 'Medium',
    department: pipelineOutput.routing.destinationDepartment,
    summary: pipelineOutput.summaries.executiveSummary,
    reasoning: pipelineOutput.decision.decisionReasoning,
    environment_score: pipelineOutput.impact.environmentalScore,
    public_safety_score: pipelineOutput.impact.communityScore,
    karma: finalKarma,
    model_used: 'gemma-4-26b-a4b-it:free',
    prompt_version: 'v2.4-enterprise',
  };

  return {
    aiResult,
    isDuplicate,
    duplicateCount: isDuplicate ? 1 : 0,
    finalKarma,
    pipelineOutput,
  };
}
