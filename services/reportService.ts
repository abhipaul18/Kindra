import { supabase } from '@/src/lib/supabase';
import type { CivicReport, ReportStatus } from '@/src/types/database';
import { analyzeCivicReport } from '@/src/lib/openrouter';

export async function fetchCivicReports(): Promise<CivicReport[]> {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('Error fetching reports from Supabase, using mock fallback:', error);
    return [];
  }

  return data as CivicReport[];
}

export async function submitCivicReport(
  reportData: Partial<CivicReport>
): Promise<CivicReport> {
  // Trigger OpenRouter AI analysis if title and description exist
  let aiAnalysisResult = null;
  if (reportData.title && reportData.description && reportData.location_name) {
    aiAnalysisResult = await analyzeCivicReport(
      reportData.title,
      reportData.description,
      reportData.location_name
    );
  }

  const newReport = {
    ...reportData,
    status: 'approved' as ReportStatus,
    karma_awarded: 50,
    ai_analysis: aiAnalysisResult
      ? {
          suggested_category: aiAnalysisResult.category,
          confidence: aiAnalysisResult.confidence,
          severity_rating: aiAnalysisResult.priority,
          summary: aiAnalysisResult.summary,
          tags: aiAnalysisResult.tags,
        }
      : undefined,
  };

  const { data, error } = await supabase
    .from('reports')
    .insert([newReport])
    .select()
    .single();

  if (error) {
    console.warn('Error inserting report into Supabase:', error);
    return {
      id: `rep-${Date.now()}`,
      title: reportData.title || '',
      description: reportData.description || '',
      category: reportData.category || 'Roads & Infrastructure',
      status: 'approved',
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
