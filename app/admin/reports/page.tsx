'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { fetchAllReports } from '@/services/adminService';

const STATUS_OPTIONS = ['submitted', 'ai_verifying', 'approved', 'in_progress', 'resolved', 'rejected'];
const PRIORITY_OPTIONS = ['low', 'medium', 'high', 'urgent'];

const priorityColors: Record<string, string> = {
  low: 'bg-green-500/10 text-green-600 border-green-500/30',
  medium: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
  high: 'bg-orange-500/10 text-orange-600 border-orange-500/30',
  urgent: 'bg-red-500/10 text-red-600 border-red-500/30',
};

export default function AdminReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<{ status?: string; priority?: string; search?: string }>({});
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => { loadReports(); }, [page, filters]);

  async function loadReports() {
    setLoading(true);
    try {
      const data = await fetchAllReports(page, 20, { ...filters, search: search || undefined });
      setReports(data);
    } catch (err) { console.error(err); }
    setLoading(false);
  }

  return (
    <div className="flex flex-col gap-lg pb-xl">
      <h1 className="text-2xl font-black text-on-surface">All Reports</h1>

      <Card className="p-md flex flex-wrap items-center gap-sm border-outline-variant/30">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search reports..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { setPage(1); loadReports(); }}}
            className="flex-1 px-3 py-2 rounded-xl bg-surface-container-high border border-outline-variant/30 text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-red-500"
          />
          <Button variant="primary" size="sm" onClick={() => { setPage(1); loadReports(); }}>Search</Button>
        </div>
        <select
          value={filters.status || ''}
          onChange={(e) => { setFilters(f => ({ ...f, status: e.target.value || undefined })); setPage(1); }}
          className="px-3 py-2 rounded-xl bg-surface-container-high border border-outline-variant/30 text-sm text-on-surface"
        >
          <option value="">All Status</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
        <select
          value={filters.priority || ''}
          onChange={(e) => { setFilters(f => ({ ...f, priority: e.target.value || undefined })); setPage(1); }}
          className="px-3 py-2 rounded-xl bg-surface-container-high border border-outline-variant/30 text-sm text-on-surface"
        >
          <option value="">All Priority</option>
          {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </Card>

      {loading ? (
        <div className="flex flex-col gap-sm animate-pulse">
          {[1,2,3,4,5].map(i => <div key={i} className="h-16 bg-surface-container-high rounded-xl" />)}
        </div>
      ) : reports.length === 0 ? (
        <Card className="p-xl text-center text-on-surface-variant border-dashed">
          <p className="text-sm font-semibold">No reports found</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-sm">
          {reports.map((report) => (
            <a key={report.id} href={`/officer/report/${report.id}`}>
              <Card hoverable className="p-md flex items-center gap-md border-outline-variant/30">
                <div className="w-8 h-8 rounded-lg bg-surface-container-high text-on-surface-variant flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-lg">description</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm text-on-surface truncate">{report.title}</h3>
                  <p className="text-xs text-on-surface-variant">
                    {(report.categories as any)?.name || 'Uncategorized'} • {(report.departments as any)?.name || 'Unassigned'}
                  </p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${priorityColors[report.priority] || ''}`}>
                  {report.priority}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface capitalize">
                  {report.status?.replace('_', ' ')}
                </span>
                <span className="text-xs text-on-surface-variant flex-shrink-0">
                  {report.created_at ? new Date(report.created_at).toLocaleDateString() : ''}
                </span>
              </Card>
            </a>
          ))}
        </div>
      )}

      <div className="flex items-center justify-center gap-md">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
        <span className="text-sm font-semibold text-on-surface-variant">Page {page}</span>
        <Button variant="outline" size="sm" disabled={reports.length < 20} onClick={() => setPage(p => p + 1)}>Next</Button>
      </div>
    </div>
  );
}
