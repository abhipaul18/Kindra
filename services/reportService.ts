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

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(reportData.category_id || '');

  const insertPayload = {
    reporter_id: reportData.reporter_id,
    title: reportData.title || 'Civic Issue',
    description: reportData.description || '',
    category_id: isUuid ? reportData.category_id : null,
    status: 'submitted' as ReportStatus,
    priority: reportData.priority || 'medium',
    location_name: reportData.location_name || '',
    latitude: reportData.latitude,
    longitude: reportData.longitude,
    karma_awarded: aiAnalysisResult?.karma || 50,
  };

  const { data, error } = await supabase
    .from('reports')
    .insert([insertPayload])
    .select()
    .single();

  if (data?.id && reportData.image_url) {
    await supabase.from('report_images').insert({
      report_id: data.id,
      image_url: reportData.image_url,
    });
  }

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
      ai_analysis: undefined,
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
