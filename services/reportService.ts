import { supabase } from '@/src/lib/supabase';
import type { CivicReport, ReportStatus } from '@/src/types/database';
import { analyzeCivicReportWithGemma } from '@/src/lib/openrouter';

export async function fetchCivicReports(): Promise<CivicReport[]> {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('Error fetching reports from Supabase:', error);
    return [];
  }

  return data as CivicReport[];
}

export async function submitCivicReport(
  reportData: Partial<CivicReport>
): Promise<CivicReport> {
  let aiAnalysisResult = null;
  if (reportData.title && reportData.description && reportData.location_name) {
    aiAnalysisResult = await analyzeCivicReportWithGemma(
      reportData.title,
      reportData.description,
      reportData.location_name,
      reportData.image_url || undefined
    );
  }

  const newReport = {
    reporter_id: reportData.reporter_id,
    title: reportData.title || 'Civic Issue',
    description: reportData.description || '',
    category_id: reportData.category_id,
    status: 'submitted' as ReportStatus,
    priority: reportData.priority || 'medium',
    location_name: reportData.location_name || '',
    latitude: reportData.latitude,
    longitude: reportData.longitude,
    image_url: reportData.image_url,
    karma_awarded: aiAnalysisResult?.karma || 50,
    ai_analysis: aiAnalysisResult
      ? {
          suggested_category: aiAnalysisResult.category,
          confidence: aiAnalysisResult.confidence,
          severity_rating: aiAnalysisResult.severity,
          summary: aiAnalysisResult.summary,
          tags: [aiAnalysisResult.category, aiAnalysisResult.severity],
        }
      : undefined,
  };

  const { data, error } = await supabase
    .from('reports')
    .insert([newReport as any])
    .select()
    .single();

  if (error) {
    console.warn('Error inserting report into Supabase:', error);
    return {
      id: `rep-${Date.now()}`,
      title: reportData.title || '',
      description: reportData.description || '',
      category: reportData.category || 'Roads & Infrastructure',
      status: 'submitted',
      priority: 'medium',
      location_name: reportData.location_name || '',
      image_url: reportData.image_url,
      karma_awarded: 50,
      ai_analysis: newReport.ai_analysis,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  return data as CivicReport;
}

export async function updateReportStatus(
  reportId: string,
  newStatus: ReportStatus
): Promise<void> {
  const { error } = await supabase
    .from('reports')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', reportId);

  if (error) {
    console.warn('Error updating report status:', error);
  }
}
