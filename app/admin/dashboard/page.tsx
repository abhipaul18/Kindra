'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/src/components/ui/Card';
import { fetchAdminStats } from '@/services/adminService';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminStats().then(s => { setStats(s); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-md animate-pulse">
        <div className="h-32 bg-surface-container-high rounded-2xl" />
        <div className="grid grid-cols-3 gap-md">
          {[1,2,3].map(i => <div key={i} className="h-28 bg-surface-container-high rounded-xl" />)}
        </div>
      </div>
    );
  }

  const topCards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: 'group', color: 'text-blue-600 bg-blue-500/10' },
    { label: 'Total Reports', value: stats?.totalReports || 0, icon: 'description', color: 'text-green-600 bg-green-500/10' },
    { label: 'Karma Distributed', value: stats?.totalKarmaDistributed || 0, icon: 'eco', color: 'text-amber-600 bg-amber-500/10' },
  ];

  return (
    <div className="flex flex-col gap-lg pb-xl">
      <Card className="bg-gradient-to-r from-red-500/10 via-red-400/5 to-pink-500/10 border-red-500/20 p-lg">
        <h1 className="text-2xl font-black text-on-surface">Admin Dashboard</h1>
        <p className="text-sm text-on-surface-variant mt-1">
          System-wide overview. Monitor users, reports, and platform health.
        </p>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
        {topCards.map((s) => (
          <Card key={s.label} className="p-md flex flex-col items-center text-center gap-sm border-outline-variant/30">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.color}`}>
              <span className="material-symbols-outlined text-2xl">{s.icon}</span>
            </div>
            <span className="text-2xl font-black text-on-surface">{s.value.toLocaleString()}</span>
            <span className="text-xs font-semibold text-on-surface-variant">{s.label}</span>
          </Card>
        ))}
      </div>

      {/* Status Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
        <Card className="p-lg flex flex-col gap-sm border-outline-variant/30">
          <h2 className="font-bold text-on-surface">Reports by Status</h2>
          {stats?.statusBreakdown && Object.entries(stats.statusBreakdown).map(([status, count]) => (
            <div key={status} className="flex items-center justify-between py-1.5 border-b border-outline-variant/20 last:border-0">
              <span className="text-sm text-on-surface capitalize">{status.replace('_', ' ')}</span>
              <span className="text-sm font-bold text-on-surface">{count as number}</span>
            </div>
          ))}
          {(!stats?.statusBreakdown || Object.keys(stats.statusBreakdown).length === 0) && (
            <p className="text-xs text-on-surface-variant">No report data available</p>
          )}
        </Card>

        <Card className="p-lg flex flex-col gap-sm border-outline-variant/30">
          <h2 className="font-bold text-on-surface">Reports by Priority</h2>
          {stats?.priorityBreakdown && Object.entries(stats.priorityBreakdown).map(([priority, count]) => (
            <div key={priority} className="flex items-center justify-between py-1.5 border-b border-outline-variant/20 last:border-0">
              <span className="text-sm text-on-surface capitalize">{priority}</span>
              <span className="text-sm font-bold text-on-surface">{count as number}</span>
            </div>
          ))}
          {(!stats?.priorityBreakdown || Object.keys(stats.priorityBreakdown).length === 0) && (
            <p className="text-xs text-on-surface-variant">No priority data available</p>
          )}
        </Card>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
        {[
          { label: 'Analytics', path: '/admin/analytics', icon: 'analytics', color: 'text-purple-600 bg-purple-500/10' },
          { label: 'Users', path: '/admin/users', icon: 'group', color: 'text-blue-600 bg-blue-500/10' },
          { label: 'Departments', path: '/admin/departments', icon: 'business', color: 'text-green-600 bg-green-500/10' },
          { label: 'Audit Logs', path: '/admin/audit', icon: 'history', color: 'text-amber-600 bg-amber-500/10' },
        ].map((item) => (
          <a key={item.path} href={item.path}>
            <Card hoverable className="p-md flex flex-col items-center text-center gap-sm">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.color}`}>
                <span className="material-symbols-outlined text-xl">{item.icon}</span>
              </div>
              <span className="text-xs font-bold text-on-surface">{item.label}</span>
            </Card>
          </a>
        ))}
      </div>
    </div>
  );
}
