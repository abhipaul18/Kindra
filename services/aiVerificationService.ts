import { supabase } from '@/src/lib/supabase';
import { analyzeCivicReportWithGemma, type AIVerificationResult } from '@/src/lib/openrouter';
import type { ReportPriority } from '@/src/types/database';

export async function verifyCivicReport(reportId: string): Promise<{
  aiResult: AIVerificationResult;
  isDuplicate: boolean;
  duplicateCount: number;
  finalKarma: number;
}> {
  // 1. Fetch report details from database
  const { data: report, error } = await supabase
    .from('reports')
    .select('*')
    .eq('id', reportId)
    .single();

  if (error || !report) {
    throw new Error(`Report ${reportId} not found in database`);
  }

  // 2. Call OpenRouter Gemma Vision AI Analysis
  const aiResult = await analyzeCivicReportWithGemma(
    report.title,
    report.description,
    report.location_name,
    (report as any).image_url
  );

  // 3. Duplicate Detection Check (Within ~500m radius and 48 hours window)
  let isDuplicate = false;
  let duplicateCount = 0;

  if (report.latitude && report.longitude) {
    const latMin = report.latitude - 0.005;
    const latMax = report.latitude + 0.005;
    const lngMin = report.longitude - 0.005;
    const lngMax = report.longitude + 0.005;
    const timeThreshold = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

    const { data: nearbyReports } = await supabase
      .from('reports')
      .select('id')
      .neq('id', reportId)
      .gte('latitude', latMin)
      .lte('latitude', latMax)
      .gte('longitude', lngMin)
      .lte('longitude', lngMax)
      .gte('created_at', timeThreshold);

    if (nearbyReports && nearbyReports.length > 0) {
      isDuplicate = true;
      duplicateCount = nearbyReports.length;
    }
  }

  // 4. Calculate Final Karma Award based on Severity & Duplicate Flag
  let finalKarma = aiResult.karma;
  let mappedPriority: ReportPriority = 'medium';

  if (aiResult.severity === 'Critical') {
    finalKarma = 100;
    mappedPriority = 'urgent';
  } else if (aiResult.severity === 'High') {
    finalKarma = 70;
    mappedPriority = 'high';
  } else if (aiResult.severity === 'Medium') {
    finalKarma = 40;
    mappedPriority = 'medium';
  } else if (aiResult.severity === 'Low') {
    finalKarma = 20;
    mappedPriority = 'low';
  }

  if (isDuplicate) {
    finalKarma = 10; // Reduced Karma for duplicate report submission
  }

  // 5. Query Department ID for matching department name
  let assignedDepartmentId = report.assigned_department_id;
  if (aiResult.department) {
    const { data: dept } = await supabase
      .from('departments')
      .select('id')
      .ilike('name', `%${aiResult.department}%`)
      .single();

    if (dept) {
      assignedDepartmentId = dept.id;
    }
  }

  // 6. Update Reports PostgreSQL Table
  const newStatus = aiResult.is_valid ? 'approved' : 'rejected';
  await supabase
    .from('reports')
    .update({
      status: newStatus,
      priority: mappedPriority,
      assigned_department_id: assignedDepartmentId,
      karma_awarded: finalKarma,
      updated_at: new Date().toISOString(),
    })
    .eq('id', reportId);

  // 7. Insert into report_ai_results table
  await supabase.from('report_ai_results').upsert({
    report_id: reportId,
    suggested_category: aiResult.category,
    confidence_score: aiResult.confidence,
    severity_rating: aiResult.severity,
    ai_summary: aiResult.summary,
    is_duplicate: isDuplicate,
    raw_response: aiResult as any,
  });

  // 8. Award Karma & Create Notification for Citizen
  if (report.reporter_id && aiResult.is_valid) {
    await supabase.rpc('award_karma', {
      p_user_id: report.reporter_id,
      p_amount: finalKarma,
      p_action_type: 'report_approved',
      p_description: `Verified civic report: ${report.title}`,
      p_reference_id: reportId,
    });
  }

  return {
    aiResult,
    isDuplicate,
    duplicateCount,
    finalKarma,
  };
}
