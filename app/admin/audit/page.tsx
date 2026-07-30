'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { fetchAuditLogs } from '@/services/adminService';

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState('');

  useEffect(() => { loadLogs(); }, [page, actionFilter]);

  async function loadLogs() {
    setLoading(true);
    try {
      const data = await fetchAuditLogs(page, 30, actionFilter || undefined);
      setLogs(data);
    } catch (err) { console.error(err); }
    setLoading(false);
  }

  return (
    <div className="flex flex-col gap-lg pb-xl">
      <h1 className="text-2xl font-black text-on-surface">Audit Logs</h1>

      <Card className="p-md flex items-center gap-sm border-outline-variant/30">
        <input
          type="text"
          placeholder="Filter by action type..."
          value={actionFilter}
          onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
          className="flex-1 px-3 py-2 rounded-xl bg-surface-container-high border border-outline-variant/30 text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-red-500"
        />
      </Card>

      {loading ? (
        <div className="flex flex-col gap-sm animate-pulse">
          {[1,2,3,4,5].map(i => <div key={i} className="h-14 bg-surface-container-high rounded-xl" />)}
        </div>
      ) : logs.length === 0 ? (
        <Card className="p-xl text-center text-on-surface-variant border-dashed">
          <span className="material-symbols-outlined text-4xl mb-2 block">history</span>
          <p className="text-sm font-semibold">No audit logs found</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-sm">
          {logs.map((log) => (
            <Card key={log.id} className="p-md flex items-center gap-md border-outline-variant/30">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-lg">history</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-on-surface">{log.action}</p>
                <p className="text-xs text-on-surface-variant truncate">
                  {log.entity_type}{log.entity_id ? ` • ${log.entity_id.slice(0, 8)}...` : ''}
                </p>
              </div>
              <span className="text-xs text-on-surface-variant flex-shrink-0">
                {log.created_at ? new Date(log.created_at).toLocaleString() : ''}
              </span>
            </Card>
          ))}
        </div>
      )}

      <div className="flex items-center justify-center gap-md">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
        <span className="text-sm font-semibold text-on-surface-variant">Page {page}</span>
        <Button variant="outline" size="sm" disabled={logs.length < 30} onClick={() => setPage(p => p + 1)}>Next</Button>
      </div>
    </div>
  );
}
