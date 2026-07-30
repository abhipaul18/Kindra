'use client';

import React from 'react';
import { useCitizenDashboard } from '@/hooks/useCitizenDashboard';
import { Card } from '@/src/components/ui/Card';
import { ProgressBar } from '@/src/components/ui/ProgressBar';

export default function CitizenCredentialsPage() {
  const { credentials, profile } = useCitizenDashboard();

  return (
    <div className="flex flex-col gap-lg pb-xl">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-black text-on-surface">My Civic Credentials & Milestones</h1>
        <p className="text-sm text-on-surface-variant">
          Track your civic contributions across 8 categories and unlock badges as you earn Karma.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
        {credentials.map((cred) => (
          <Card key={cred.id} className="p-md flex flex-col gap-md border-outline-variant/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-secondary-container/20 text-secondary flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl">{cred.icon_name || 'military_tech'}</span>
                </div>
                <div>
                  <h3 className="font-bold text-base text-on-surface">{cred.title}</h3>
                  <span className="text-xs text-on-surface-variant font-medium">{cred.category_name}</span>
                </div>
              </div>
              <span className="text-xs font-black bg-secondary-container/30 text-secondary border border-secondary/30 px-3 py-1 rounded-full">
                Level {cred.current_level || 1}
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs font-semibold text-on-surface-variant">
                <span>Milestone Progress</span>
                <span>{cred.progress_karma || 25} / 100 XP</span>
              </div>
              <ProgressBar progress={cred.progress_karma || 25} color="secondary" />
            </div>

            <div className="flex items-center justify-between text-xs pt-2 border-t border-outline-variant/20">
              <span className="text-on-surface-variant">Next Badge: <span className="font-bold text-on-surface font-sans">Level { (cred.current_level || 1) + 1 } Master</span></span>
              <span className="text-secondary font-bold">+{50} Karma Reward</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
