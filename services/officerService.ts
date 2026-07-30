import { supabase } from '@/src/lib/supabase';
import { ReportStatus, ReportPriority } from '@/src/types/database';

// ── Dashboard Stats ──────────────────────────────────────────────
export async function fetchOfficerStats(departmentId?: string) {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

  let baseQuery = supabase.from('reports').select('id, status, priority, created_at, updated_at', { count: 'exact' });
  if (departmentId) baseQuery = baseQuery.eq('assigned_department_id', departmentId);

  const { data: reports } = await baseQuery;

  const pending = (reports || []).filter(r => ['submitted', 'ai_verifying', 'approved'].includes(r.status));
  const highPriority = pending.filter(r => r.priority === 'high');
  const critical = pending.filter(r => r.priority === 'urgent');
  const resolvedToday = (reports || []).filter(r => r.status === 'resolved' && r.updated_at && r.updated_at >= todayStart);

  return {
    pendingCount: pending.length,
    highPriorityCount: highPriority.length,
    criticalCount: critical.length,
    resolvedTodayCount: resolvedToday.length,
    totalReports: (reports || []).length,
  };
}

// ── Officer Queue ────────────────────────────────────────────────
export interface QueueFilters {
  status?: string;
  priority?: string;
  search?: string;
  sortBy?: 'created_at' | 'priority';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export async function fetchOfficerQueue(filters: QueueFilters = {}) {
  const { status, priority, search, sortBy = 'created_at', sortOrder = 'desc', page = 1, pageSize = 20 } = filters;

  let query = supabase
    .from('view_officer_queue')
    .select('*');

  if (status) query = query.eq('status', status as any);
  if (priority) query = query.eq('priority', priority as any);
  if (search) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);

  query = query.order(sortBy, { ascending: sortOrder === 'asc' });
  query = query.range((page - 1) * pageSize, page * pageSize - 1);

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

// ── Report Detail ────────────────────────────────────────────────
export async function fetchReportDetail(reportId: string) {
  const [reportRes, aiRes, imagesRes] = await Promise.all([
    supabase.from('reports').select('*, categories(name, icon_name), departments(name)').eq('id', reportId).single(),
    supabase.from('report_ai_results').select('*').eq('report_id', reportId).maybeSingle(),
    supabase.from('report_images').select('*').eq('report_id', reportId),
  ]);

  return {
    report: reportRes.data,
    aiResult: aiRes.data,
    images: imagesRes.data || [],
  };
}

// ── Officer Actions ──────────────────────────────────────────────
export async function updateReportStatus(reportId: string, status: ReportStatus | string) {
  const { error } = await supabase
    .from('reports')
    .update({ status: status as ReportStatus, updated_at: new Date().toISOString() })
    .eq('id', reportId);
  if (error) throw error;
}

export async function assignReportDepartment(reportId: string, departmentId: string) {
  const { error } = await supabase
    .from('reports')
    .update({ assigned_department_id: departmentId, updated_at: new Date().toISOString() })
    .eq('id', reportId);
  if (error) throw error;
}

export async function assignReportOfficer(reportId: string, officerId: string) {
  const { error } = await supabase
    .from('reports')
    .update({ assigned_officer_id: officerId, updated_at: new Date().toISOString() })
    .eq('id', reportId);
  if (error) throw error;
}

// ── Recent Activity ──────────────────────────────────────────────
export async function fetchRecentOfficerActivity(limit = 10) {
  const { data } = await supabase
    .from('activity_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  return data || [];
}

// ── Departments List ─────────────────────────────────────────────
export async function fetchDepartments() {
  const { data } = await supabase.from('departments').select('*').order('name');
  return data || [];
}
