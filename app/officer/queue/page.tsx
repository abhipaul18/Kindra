'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { fetchOfficerQueue, type QueueFilters } from '@/services/officerService';
import type { ReportStatus, ReportPriority } from '@/src/types/database';

const STATUS_OPTIONS: ReportStatus[] = ['submitted', 'ai_verifying', 'approved', 'in_progress', 'resolved', 'rejected'];
const PRIORITY_OPTIONS: ReportPriority[] = ['low', 'medium', 'high', 'urgent'];

const priorityColors: Record<string, string> = {
  low: 'bg-green-500/10 text-green-600 border-green-500/30',
  medium: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
  high: 'bg-orange-500/10 text-orange-600 border-orange-500/30',
  urgent: 'bg-red-500/10 text-red-600 border-red-500/30',
};

const statusColors: Record<string, string> = {
  submitted: 'bg-blue-500/10 text-blue-600',
  ai_verifying: 'bg-purple-500/10 text-purple-600',
  approved: 'bg-green-500/10 text-green-600',
  in_progress: 'bg-amber-500/10 text-amber-600',
  resolved: 'bg-emerald-500/10 text-emerald-600',
  rejected: 'bg-red-500/10 text-red-600',
};

export default function OfficerQueuePage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<QueueFilters>({ page: 1, pageSize: 20 });
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadQueue();
  }, [filters]);

  async function loadQueue() {
    setLoading(true);
    try {
      const data = await fetchOfficerQueue({ ...filters, search: search || undefined });
      setReports(data);
    } catch (err) { console.error(err); }
    setLoading(false);
  }

  function handleSearch() {
    setFilters(f => ({ ...f, page: 1 }));
    loadQueue();
  }

  return (
    <div className="flex flex-col gap-lg pb-xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-on-surface">Report Queue</h1>
        <span className="text-xs font-semibold text-on-surface-variant bg-surface-container-high px-3 py-1 rounded-full">
          {reports.length} reports
        </span>
      </div>

      {/* Filters */}
      <Card className="p-md flex flex-wrap items-center gap-sm border-outline-variant/30">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search by title or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1 px-3 py-2 rounded-xl bg-surface-container-high border border-outline-variant/30 text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-blue-500"
          />
          <Button variant="primary" size="sm" onClick={handleSearch}>Search</Button>
        </div>

        <select
          value={filters.status || ''}
          onChange={(e) => setFilters(f => ({ ...f, status: (e.target.value as ReportStatus) || undefined, page: 1 }))}
          className="px-3 py-2 rounded-xl bg-surface-container-high border border-outline-variant/30 text-sm text-on-surface focus:outline-none focus:border-blue-500"
        >
          <option value="">All Status</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>

        <select
          value={filters.priority || ''}
          onChange={(e) => setFilters(f => ({ ...f, priority: (e.target.value as ReportPriority) || undefined, page: 1 }))}
          className="px-3 py-2 rounded-xl bg-surface-container-high border border-outline-variant/30 text-sm text-on-surface focus:outline-none focus:border-blue-500"
        >
          <option value="">All Priority</option>
          {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </Card>

      {/* Report List */}
      {loading ? (
        <div className="flex flex-col gap-sm animate-pulse">
          {[1,2,3,4,5].map(i => <div key={i} className="h-20 bg-surface-container-high rounded-xl" />)}
        </div>
      ) : reports.length === 0 ? (
        <Card className="p-xl text-center text-on-surface-variant border-dashed">
          <span className="material-symbols-outlined text-4xl mb-2 block">inbox</span>
          <p className="text-sm font-semibold">No reports match your filters</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-sm">
          {reports.map((report) => (
            <a key={report.report_id} href={`/officer/report/${report.report_id}`}>
              <Card hoverable className="p-md flex items-center gap-md border-outline-variant/30">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-xl">description</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm text-on-surface truncate">{report.title}</h3>
                  <p className="text-xs text-on-surface-variant truncate">
                    {report.location_name || 'Unknown'} • {report.department_name || 'Unassigned'} • {report.category_name || 'Uncategorized'}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${priorityColors[report.priority] || ''}`}>
                    {report.priority}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColors[report.status] || ''}`}>
                    {(report.status || '').replace('_', ' ')}
                  </span>
                </div>
                <span suppressHydrationWarning className="text-xs text-on-surface-variant flex-shrink-0">
                  {report.created_at ? new Date(report.created_at).toLocaleDateString('en-US') : ''}
                </span>
              </Card>
            </a>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-center gap-md">
        <Button
          variant="outline"
          size="sm"
          disabled={(filters.page || 1) <= 1}
          onClick={() => setFilters(f => ({ ...f, page: (f.page || 1) - 1 }))}
        >
          Previous
        </Button>
        <span className="text-sm font-semibold text-on-surface-variant">Page {filters.page || 1}</span>
        <Button
          variant="outline"
          size="sm"
          disabled={reports.length < (filters.pageSize || 20)}
          onClick={() => setFilters(f => ({ ...f, page: (f.page || 1) + 1 }))}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
