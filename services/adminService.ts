import { supabase } from '@/src/lib/supabase';
import { UserRole, ReportStatus, ReportPriority, Json } from '@/src/types/database';

// ── System-wide Stats ────────────────────────────────────────────
export async function fetchAdminStats() {
  const [usersRes, reportsRes, karmaRes] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact' }),
    supabase.from('reports').select('id, status, priority', { count: 'exact' }),
    supabase.from('karma_transactions').select('amount'),
  ]);

  const reports = reportsRes.data || [];
  const totalKarma = (karmaRes.data || []).reduce((sum, t) => sum + (t.amount > 0 ? t.amount : 0), 0);

  const statusBreakdown: Record<string, number> = {};
  const priorityBreakdown: Record<string, number> = {};
  reports.forEach(r => {
    statusBreakdown[r.status] = (statusBreakdown[r.status] || 0) + 1;
    priorityBreakdown[r.priority] = (priorityBreakdown[r.priority] || 0) + 1;
  });

  return {
    totalUsers: usersRes.count || 0,
    totalReports: reportsRes.count || 0,
    totalKarmaDistributed: totalKarma,
    statusBreakdown,
    priorityBreakdown,
  };
}

// ── User Management ──────────────────────────────────────────────
export async function fetchUsers(page = 1, pageSize = 20, search?: string) {
  let query = supabase
    .from('profiles')
    .select('*, user_roles(role)')
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
  }

  query = query.range((page - 1) * pageSize, page * pageSize - 1);

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function updateUserRole(userId: string, newRole: UserRole) {
  const { error } = await supabase
    .from('user_roles')
    .update({ role: newRole, updated_at: new Date().toISOString() })
    .eq('user_id', userId);
  if (error) throw error;
}

export async function softDeleteUser(userId: string) {
  const { error } = await supabase
    .from('profiles')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', userId);
  if (error) throw error;
}

// ── Department Management ────────────────────────────────────────
export async function fetchAllDepartments() {
  const { data } = await supabase.from('departments').select('*').order('name');
  return data || [];
}

export async function createDepartment(name: string, description: string) {
  const { data, error } = await supabase
    .from('departments')
    .insert({ name, description })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateDepartment(id: string, updates: { name?: string; description?: string }) {
  const { error } = await supabase
    .from('departments')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

// ── All Reports (Admin view - no department filter) ──────────────
export async function fetchAllReports(page = 1, pageSize = 20, filters: { status?: ReportStatus; priority?: ReportPriority; search?: string } = {}) {
  let query = supabase
    .from('reports')
    .select('*, categories(name), departments(name)')
    .order('created_at', { ascending: false });

  if (filters.status) query = query.eq('status', filters.status);
  if (filters.priority) query = query.eq('priority', filters.priority);
  if (filters.search) query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);

  query = query.range((page - 1) * pageSize, page * pageSize - 1);

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

// ── Settings ─────────────────────────────────────────────────────
export async function fetchSettings() {
  const { data } = await supabase.from('settings').select('*').order('key');
  return data || [];
}

export async function updateSetting(key: string, value: Json) {
  const { error } = await supabase
    .from('settings')
    .update({ value, updated_at: new Date().toISOString() })
    .eq('key', key);
  if (error) throw error;
}

// ── Audit Logs ───────────────────────────────────────────────────
export async function fetchAuditLogs(page = 1, pageSize = 30, actionFilter?: string) {
  let query = supabase
    .from('activity_logs')
    .select('*')
    .order('created_at', { ascending: false });

  if (actionFilter) query = query.eq('action', actionFilter);

  query = query.range((page - 1) * pageSize, page * pageSize - 1);

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

// ── Analytics Aggregation ────────────────────────────────────────
export async function fetchAnalyticsData() {
  const [reportsRes, categoriesRes, departmentsRes, aiRes] = await Promise.all([
    supabase.from('reports').select('id, status, priority, category_id, assigned_department_id, created_at'),
    supabase.from('categories').select('id, name'),
    supabase.from('departments').select('id, name'),
    supabase.from('report_ai_results').select('confidence_score, is_duplicate'),
  ]);

  const reports = reportsRes.data || [];
  const categories = categoriesRes.data || [];
  const departments = departmentsRes.data || [];
  const aiResults = aiRes.data || [];

  // Reports by category
  const categoryMap = new Map(categories.map(c => [c.id, c.name]));
  const reportsByCategory: Record<string, number> = {};
  reports.forEach(r => {
    const catName = (r.category_id && categoryMap.get(r.category_id)) || 'Uncategorized';
    reportsByCategory[catName] = (reportsByCategory[catName] || 0) + 1;
  });

  // Reports by department
  const deptMap = new Map(departments.map(d => [d.id, d.name]));
  const reportsByDepartment: Record<string, number> = {};
  reports.forEach(r => {
    const deptName = (r.assigned_department_id && deptMap.get(r.assigned_department_id)) || 'Unassigned';
    reportsByDepartment[deptName] = (reportsByDepartment[deptName] || 0) + 1;
  });

  // AI verification stats
  const avgConfidence = aiResults.length > 0
    ? aiResults.reduce((sum, a) => sum + (a.confidence_score || 0), 0) / aiResults.length
    : 0;
  const duplicateCount = aiResults.filter(a => a.is_duplicate).length;

  return {
    totalReports: reports.length,
    reportsByCategory,
    reportsByDepartment,
    aiVerificationCount: aiResults.length,
    avgAIConfidence: Math.round(avgConfidence * 100),
    duplicatesDetected: duplicateCount,
  };
}
