'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/src/components/ui/Card';
import { useAuth } from '@/hooks/useAuth';
import { fetchPartnerStats } from '@/services/partnerService';

export default function PartnerDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalRewards: 0, totalRedemptions: 0, activeCampaigns: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    fetchPartnerStats(user.id).then(s => { setStats(s); setLoading(false); }).catch(() => setLoading(false));
  }, [user?.id]);

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

  const statCards = [
    { label: 'Active Rewards', value: stats.totalRewards, icon: 'redeem', color: 'text-amber-600 bg-amber-500/10' },
    { label: 'Total Redemptions', value: stats.totalRedemptions, icon: 'receipt_long', color: 'text-green-600 bg-green-500/10' },
    { label: 'Active Campaigns', value: stats.activeCampaigns, icon: 'campaign', color: 'text-blue-600 bg-blue-500/10' },
  ];

  return (
    <div className="flex flex-col gap-lg pb-xl">
      <Card className="bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-orange-500/10 border-amber-500/20 p-lg">
        <h1 className="text-2xl font-black text-on-surface">Partner Dashboard</h1>
        <p className="text-sm text-on-surface-variant mt-1">
          Manage your rewards and civic campaigns. Engage citizens and build brand value.
        </p>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
        <a href="/partner/rewards">
          <Card hoverable className="p-lg flex items-center gap-md border-amber-500/20 hover:border-amber-500">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">redeem</span>
            </div>
            <div>
              <h3 className="font-bold text-on-surface">Manage Rewards</h3>
              <p className="text-xs text-on-surface-variant">Create and manage reward offers for citizens</p>
            </div>
          </Card>
        </a>
        <a href="/partner/campaigns">
          <Card hoverable className="p-lg flex items-center gap-md border-blue-500/20 hover:border-blue-500">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">campaign</span>
            </div>
            <div>
              <h3 className="font-bold text-on-surface">Manage Campaigns</h3>
              <p className="text-xs text-on-surface-variant">Create civic campaigns and track participation</p>
            </div>
          </Card>
        </a>
      </div>
    </div>
  );
}
