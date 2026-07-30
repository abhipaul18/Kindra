'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/src/components/ui/Card';
import { fetchOfficerStats, fetchRecentOfficerActivity } from '@/services/officerService';

export default function OfficerDashboardPage() {
  const [stats, setStats] = useState({ pendingCount: 0, highPriorityCount: 0, criticalCount: 0, resolvedTodayCount: 0, totalReports: 0 });
  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [s, a] = await Promise.all([fetchOfficerStats(), fetchRecentOfficerActivity(8)]);
        setStats(s);
        setActivity(a);
      } catch (err) { console.error(err); }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-md animate-pulse">
        <div className="h-32 bg-surface-container-high rounded-2xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
          {[1,2,3,4].map(i => <div key={i} className="h-28 bg-surface-container-high rounded-xl" />)}
        </div>
      </div>
    );
  }

  const statCards = [
    { label: 'Pending Reports', value: stats.pendingCount, icon: 'pending_actions', color: 'text-amber-600 bg-amber-500/10' },
    { label: 'High Priority', value: stats.highPriorityCount, icon: 'priority_high', color: 'text-orange-600 bg-orange-500/10' },
    { label: 'Critical', value: stats.criticalCount, icon: 'warning', color: 'text-red-600 bg-red-500/10' },
    { label: 'Resolved Today', value: stats.resolvedTodayCount, icon: 'check_circle', color: 'text-green-600 bg-green-500/10' },
  ];

  return (
    <div className="flex flex-col gap-lg pb-xl">
      {/* Welcome Banner */}
      <Card className="bg-gradient-to-r from-blue-500/10 via-blue-400/5 to-indigo-500/10 border-blue-500/20 p-lg">
        <h1 className="text-2xl font-black text-on-surface">Officer Dashboard</h1>
        <p className="text-sm text-on-surface-variant mt-1">
          Manage civic reports, prioritize issues, and protect your community.
        </p>
      </Card>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
        {statCards.map((s) => (
          <Card key={s.label} className="p-md flex flex-col items-center text-center gap-sm border-outline-variant/30">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.color}`}>
              <span className="material-symbols-outlined text-2xl">{s.icon}</span>
            </div>
            <span className="text-2xl font-black text-on-surface">{s.value}</span>
            <span className="text-xs font-semibold text-on-surface-variant">{s.label}</span>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
        <a href="/officer/queue">
          <Card hoverable className="p-lg flex items-center gap-md border-blue-500/20 hover:border-blue-500">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">assignment</span>
            </div>
            <div>
              <h3 className="font-bold text-on-surface">View Report Queue</h3>
              <p className="text-xs text-on-surface-variant">Review and process pending civic reports</p>
            </div>
          </Card>
        </a>
        <a href="/officer/map">
          <Card hoverable className="p-lg flex items-center gap-md border-green-500/20 hover:border-green-500">
            <div className="w-12 h-12 rounded-xl bg-green-500/10 text-green-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">map</span>
            </div>
            <div>
              <h3 className="font-bold text-on-surface">Issue Map</h3>
              <p className="text-xs text-on-surface-variant">View all reported issues on an interactive map</p>
            </div>
          </Card>
        </a>
      </div>

      {/* Recent Activity */}
      <section className="flex flex-col gap-sm">
        <h2 className="text-lg font-extrabold text-on-surface">Recent System Activity</h2>
        {activity.length === 0 ? (
          <Card className="p-lg text-center text-xs text-on-surface-variant border-dashed">No recent activity recorded.</Card>
        ) : (
          <div className="flex flex-col gap-sm">
            {activity.map((log) => (
              <Card key={log.id} className="p-md flex items-center gap-md border-outline-variant/30">
                <div className="w-9 h-9 rounded-lg bg-surface-container-high text-on-surface-variant flex items-center justify-center">
                  <span className="material-symbols-outlined text-lg">history</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-on-surface">{log.action}</p>
                  <p className="text-xs text-on-surface-variant">{log.entity_type} • {new Date(log.created_at).toLocaleString()}</p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
