import { supabase } from '@/src/lib/supabase';
import type { CivicReport, ReportStatus } from '@/src/types/database';
import { analyzeCivicReport } from '@/src/lib/openrouter';
import { mockCivicReports } from '@/src/lib/mockData';

export async function fetchCivicReports(): Promise<CivicReport[]> {
  try {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return mockCivicReports;
    }

    return data as CivicReport[];
  } catch (err) {
    console.warn('Error fetching reports, using fallback:', err);
    return mockCivicReports;
  }
}

export async function submitCivicReport(
  reportData: Partial<CivicReport>
): Promise<CivicReport> {
  // Trigger OpenRouter AI analysis if title and description exist
  let aiAnalysisResult = null;
  if (reportData.title && reportData.description && reportData.location_name) {
    try {
      aiAnalysisResult = await analyzeCivicReport(
        reportData.title,
        reportData.description,
        reportData.location_name
      );
    } catch (err) {
      console.warn('AI analysis skipped or failed:', err);
    }
  }

  const newReportRow = {
    title: reportData.title || 'Civic Issue Report',
    description: reportData.description || '',
    location_name: reportData.location_name || 'City Location',
    latitude: reportData.latitude ?? 37.7749,
    longitude: reportData.longitude ?? -122.4194,
    priority: reportData.priority || 'medium',
    status: 'approved' as ReportStatus,
    reporter_id: reportData.reporter_id || null,
    karma_awarded: 50,
  };

  const { data, error } = await supabase
    .from('reports')
    .insert([newReportRow])
    .select()
    .single();

  if (error || !data) {
    console.warn('Error inserting report into Supabase:', error);
    return {
      id: `rep-${Date.now()}`,
      title: reportData.title || '',
      description: reportData.description || '',
      category: reportData.category || 'Roads & Infrastructure',
      status: 'approved',
      priority: reportData.priority || 'medium',
      location_name: reportData.location_name || '',
      image_url: reportData.image_url,
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
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  // Save AI analysis result if available
  if (aiAnalysisResult && data.id) {
    await supabase.from('report_ai_results').insert([
      {
        report_id: data.id,
        suggested_category: aiAnalysisResult.category,
        confidence_score: aiAnalysisResult.confidence,
        severity_rating: aiAnalysisResult.priority,
        ai_summary: aiAnalysisResult.summary,
        raw_response: JSON.parse(JSON.stringify(aiAnalysisResult)),
      },
    ]);
  }

  // Save image if image_url provided
  if (reportData.image_url && data.id) {
    await supabase.from('report_images').insert([
      {
        report_id: data.id,
        image_url: reportData.image_url,
      },
    ]);
  }

  return {
    ...data,
    category: reportData.category || 'Roads & Infrastructure',
    image_url: reportData.image_url,
    ai_analysis: aiAnalysisResult
      ? {
          suggested_category: aiAnalysisResult.category,
          confidence: aiAnalysisResult.confidence,
          severity_rating: aiAnalysisResult.priority,
          summary: aiAnalysisResult.summary,
          tags: aiAnalysisResult.tags,
        }
      : undefined,
  } as CivicReport;
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
