'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/src/components/ui/Card';
import { ProgressBar } from '@/src/components/ui/ProgressBar';
import { fetchAnalyticsData } from '@/services/adminService';

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData().then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-md animate-pulse">
        <div className="h-12 bg-surface-container-high rounded-xl w-48" />
        <div className="grid grid-cols-2 gap-md">
          {[1,2,3,4].map(i => <div key={i} className="h-48 bg-surface-container-high rounded-xl" />)}
        </div>
      </div>
    );
  }

  const maxCategoryCount = data ? Math.max(...Object.values(data.reportsByCategory as Record<string, number>), 1) : 1;
  const maxDeptCount = data ? Math.max(...Object.values(data.reportsByDepartment as Record<string, number>), 1) : 1;

  return (
    <div className="flex flex-col gap-lg pb-xl">
      <h1 className="text-2xl font-black text-on-surface">Platform Analytics</h1>

      {/* Top Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
        {[
          { label: 'Total Reports', value: data?.totalReports || 0, icon: 'description', color: 'text-blue-600 bg-blue-500/10' },
          { label: 'AI Verifications', value: data?.aiVerificationCount || 0, icon: 'smart_toy', color: 'text-purple-600 bg-purple-500/10' },
          { label: 'Avg AI Confidence', value: `${data?.avgAIConfidence || 0}%`, icon: 'verified', color: 'text-green-600 bg-green-500/10' },
          { label: 'Duplicates Detected', value: data?.duplicatesDetected || 0, icon: 'content_copy', color: 'text-amber-600 bg-amber-500/10' },
        ].map((s) => (
          <Card key={s.label} className="p-md flex flex-col items-center text-center gap-sm border-outline-variant/30">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
              <span className="material-symbols-outlined text-xl">{s.icon}</span>
            </div>
            <span className="text-xl font-black text-on-surface">{s.value}</span>
            <span className="text-[10px] font-semibold text-on-surface-variant">{s.label}</span>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
        {/* Reports by Category */}
        <Card className="p-lg flex flex-col gap-sm border-outline-variant/30">
          <h2 className="font-bold text-on-surface">Reports by Category</h2>
          {data?.reportsByCategory && Object.entries(data.reportsByCategory).map(([cat, count]) => (
            <div key={cat} className="flex flex-col gap-1">
              <div className="flex justify-between text-xs font-semibold text-on-surface">
                <span>{cat}</span>
                <span>{count as number}</span>
              </div>
              <ProgressBar value={Math.round(((count as number) / maxCategoryCount) * 100)} color="green" showPercentage={false} />
            </div>
          ))}
          {(!data?.reportsByCategory || Object.keys(data.reportsByCategory).length === 0) && (
            <p className="text-xs text-on-surface-variant">No category data yet</p>
          )}
        </Card>

        {/* Reports by Department */}
        <Card className="p-lg flex flex-col gap-sm border-outline-variant/30">
          <h2 className="font-bold text-on-surface">Reports by Department</h2>
          {data?.reportsByDepartment && Object.entries(data.reportsByDepartment).map(([dept, count]) => (
            <div key={dept} className="flex flex-col gap-1">
              <div className="flex justify-between text-xs font-semibold text-on-surface">
                <span>{dept}</span>
                <span>{count as number}</span>
              </div>
              <ProgressBar value={Math.round(((count as number) / maxDeptCount) * 100)} color="green" showPercentage={false} />
            </div>
          ))}
          {(!data?.reportsByDepartment || Object.keys(data.reportsByDepartment).length === 0) && (
            <p className="text-xs text-on-surface-variant">No department data yet</p>
          )}
        </Card>
      </div>
    </div>
  );
}
