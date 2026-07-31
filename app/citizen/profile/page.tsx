'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/src/components/ui/Card';
import { Chip } from '@/src/components/ui/Chip';
import { useAuth } from '@/hooks/useAuth';
import { fetchUserBadges, fetchUserCredentials, fetchUserActivityTimeline } from '@/services/gamificationService';

export default function CitizenProfilePage() {
  const { user } = useAuth();
  const [badges, setBadges] = useState<any[]>([]);
  const [credentials, setCredentials] = useState<any[]>([]);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      const [b, c, t] = await Promise.all([
        fetchUserBadges(user.id),
        fetchUserCredentials(user.id),
        fetchUserActivityTimeline(user.id),
      ]);
      setBadges(b);
      setCredentials(c);
      setTimeline(t);
      setLoading(false);
    }
    loadData();
  }, [user]);

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-lg pb-xl p-margin-mobile">
      {/* User Header Profile Card */}
      <Card className="p-lg border-primary-container/30 bg-surface-container-lowest shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-md">
        <div className="w-20 h-20 rounded-full bg-primary text-on-primary font-black text-2xl flex items-center justify-center shadow-md shrink-0">
          {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'C'}
        </div>

        <div className="flex flex-col text-center sm:text-left gap-1 flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <h1 className="text-2xl font-black text-on-surface">
              {user?.user_metadata?.full_name || 'Active Citizen'}
            </h1>
            <span className="text-xs font-bold text-secondary bg-secondary-container/20 border border-secondary/30 px-3 py-1 rounded-full self-center sm:self-auto">
              Verified Citizen
            </span>
          </div>

          <p className="text-xs text-on-surface-variant">{user?.email || 'citizen@kindra.app'}</p>
          <p className="text-xs text-on-surface-variant font-medium mt-1">Location: Bengaluru, KA • Joined 2026</p>
        </div>
      </Card>

      {/* Grid: Credentials & Badges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
        {/* Credentials Progress */}
        <Card className="p-md border-outline-variant/30 flex flex-col gap-md">
          <h2 className="font-black text-base text-on-surface border-b border-outline-variant/20 pb-sm">
            Civic Credentials
          </h2>

          <div className="flex flex-col gap-sm">
            {credentials.length === 0 ? (
              <div className="flex flex-col gap-sm">
                <div className="p-sm bg-surface-container-high rounded-xl flex items-center justify-between">
                  <span className="font-bold text-xs text-on-surface">Cleanliness Credential</span>
                  <span className="text-xs font-black text-primary">Level 2</span>
                </div>
                <div className="p-sm bg-surface-container-high rounded-xl flex items-center justify-between">
                  <span className="font-bold text-xs text-on-surface">Tree Plantation Credential</span>
                  <span className="text-xs font-black text-primary">Level 1</span>
                </div>
                <div className="p-sm bg-surface-container-high rounded-xl flex items-center justify-between">
                  <span className="font-bold text-xs text-on-surface">Civic Reporting Credential</span>
                  <span className="text-xs font-black text-primary">Level 3</span>
                </div>
              </div>
            ) : (
              credentials.map((c) => (
                <div key={c.id} className="p-sm bg-surface-container-high rounded-xl flex items-center justify-between">
                  <span className="font-bold text-xs text-on-surface">{c.credentials?.name || 'Credential'}</span>
                  <span className="text-xs font-black text-primary">Level {c.current_level || 1}</span>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Unlocked Badges */}
        <Card className="p-md border-outline-variant/30 flex flex-col gap-md">
          <h2 className="font-black text-base text-on-surface border-b border-outline-variant/20 pb-sm">
            Unlocked Badges
          </h2>

          <div className="grid grid-cols-3 gap-sm">
            <div className="p-sm bg-primary-container/10 border border-primary/20 rounded-xl flex flex-col items-center text-center gap-1">
              <span className="material-symbols-outlined text-2xl text-primary">military_tech</span>
              <span className="font-extrabold text-[10px] text-on-surface">First Reporter</span>
            </div>

            <div className="p-sm bg-secondary-container/10 border border-secondary/20 rounded-xl flex flex-col items-center text-center gap-1">
              <span className="material-symbols-outlined text-2xl text-secondary">eco</span>
              <span className="font-extrabold text-[10px] text-on-surface">Green Guard</span>
            </div>

            <div className="p-sm bg-tertiary-container/10 border border-tertiary/20 rounded-xl flex flex-col items-center text-center gap-1">
              <span className="material-symbols-outlined text-2xl text-tertiary">stars</span>
              <span className="font-extrabold text-[10px] text-on-surface">Karma Champ</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Activity Timeline */}
      <Card className="p-md border-outline-variant/30 flex flex-col gap-md">
        <h2 className="font-black text-base text-on-surface border-b border-outline-variant/20 pb-sm">
          Activity History
        </h2>

        <div className="flex flex-col gap-md">
          {timeline.length === 0 ? (
            <span className="text-xs text-on-surface-variant">No recent activity records.</span>
          ) : (
            timeline.map((item, idx) => (
              <div key={idx} className="flex items-start gap-md border-l-2 border-primary/30 pl-md py-1">
                <div className="flex flex-col">
                  <span className="font-extrabold text-xs text-on-surface">{item.title}</span>
                  <span className="text-[10px] text-on-surface-variant">
                    {new Date(item.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
