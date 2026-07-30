'use client';

import React, { useState } from 'react';
import { useCitizenDashboard } from '@/hooks/useCitizenDashboard';
import { Card } from '@/src/components/ui/Card';
import { ProgressBar } from '@/src/components/ui/ProgressBar';
import { GoodDeedsDiscovery } from '@/components/citizen/GoodDeedsDiscovery';

export default function CitizenDashboardPage() {
  const { profile, isLoadingProfile, credentials, leaderboard, recentReports } = useCitizenDashboard();
  const [extraKarma, setExtraKarma] = useState(0);

  if (isLoadingProfile) {
    return (
      <div className="flex flex-col gap-md animate-pulse">
        <div className="h-44 bg-surface-container-high rounded-2xl w-full" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-surface-container-high rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const karmaPoints = (profile?.karma_points || 100) + extraKarma;
  const nextMilestoneKarma = 250;
  const levelProgress = Math.min(100, Math.round((karmaPoints / nextMilestoneKarma) * 100));

  return (
    <div className="flex flex-col gap-lg pb-xl">
      {/* 1. Hero Profile Welcome Banner */}
      <Card className="bg-gradient-to-r from-primary/10 via-primary-container/20 to-secondary/10 border-primary/20 p-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-md relative overflow-hidden">
        <div className="flex items-center gap-md z-10 flex-1 min-w-0">
          <div className="w-16 h-16 rounded-2xl bg-primary text-on-primary font-bold text-2xl flex items-center justify-center shadow-md border-2 border-surface shrink-0">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover rounded-2xl" />
            ) : (
              <span>{(profile?.full_name || 'C')[0].toUpperCase()}</span>
            )}
          </div>

          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl md:text-2xl font-black text-on-surface leading-tight">
                Welcome back, {profile?.full_name || 'Citizen'}!
              </h1>
              <span className="bg-secondary-container/30 text-secondary text-xs font-bold px-2.5 py-0.5 rounded-full border border-secondary/30 whitespace-nowrap shrink-0">
                {profile?.rank_title || 'Civic Hero'}
              </span>
            </div>
            <p className="text-sm text-on-surface-variant mt-1 leading-relaxed">
              <span className="font-bold text-on-surface">"Make Kindness Count." 💚</span> You have earned{' '}
              <span className="font-extrabold text-secondary">{karmaPoints} Karma Points</span>.
            </p>
          </div>
        </div>

        {/* Level Progress Indicator */}
        <div className="w-full md:w-64 flex flex-col gap-1.5 z-10 bg-surface/90 p-3 rounded-xl border border-outline-variant/30 backdrop-blur-sm shrink-0">
          <div className="flex justify-between text-xs font-bold text-on-surface">
            <span>Level 2 Civic Advocate</span>
            <span className="text-secondary">{karmaPoints} / {nextMilestoneKarma} XP</span>
          </div>
          <ProgressBar value={levelProgress} color="green" showPercentage={false} />
          <span className="text-[10px] text-on-surface-variant font-medium">
            Earn {nextMilestoneKarma - karmaPoints} more Karma to reach Level 3
          </span>
        </div>
      </Card>

      {/* 2. Quick Action Grid */}
      <section className="flex flex-col gap-sm">
        <h2 className="text-lg font-extrabold text-on-surface">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
          <a href="/citizen/report" className="group">
            <Card hoverable className="p-md flex flex-col items-center text-center gap-sm border-primary/20 hover:border-primary">
              <div className="w-12 h-12 rounded-xl bg-primary-container/20 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-2xl">report_problem</span>
              </div>
              <span className="font-bold text-sm text-on-surface">Report Issue</span>
              <span className="text-xs text-on-surface-variant">Snap photo & verify with Gemma AI</span>
            </Card>
          </a>

          <a href="/citizen/credentials" className="group">
            <Card hoverable className="p-md flex flex-col items-center text-center gap-sm border-secondary/20 hover:border-secondary">
              <div className="w-12 h-12 rounded-xl bg-secondary-container/20 text-secondary flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-2xl">military_tech</span>
              </div>
              <span className="font-bold text-sm text-on-surface">My Credentials</span>
              <span className="text-xs text-on-surface-variant">View badges & milestone levels</span>
            </Card>
          </a>

          <a href="/citizen/rewards" className="group">
            <Card hoverable className="p-md flex flex-col items-center text-center gap-sm border-tertiary/20 hover:border-tertiary">
              <div className="w-12 h-12 rounded-xl bg-tertiary-container/20 text-tertiary flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-2xl">redeem</span>
              </div>
              <span className="font-bold text-sm text-on-surface">Redeem Rewards</span>
              <span className="text-xs text-on-surface-variant">Use Karma for local perks</span>
            </Card>
          </a>

          <a href="/citizen/gemma" className="group">
            <Card hoverable className="p-md flex flex-col items-center text-center gap-sm border-accent/20 hover:border-accent">
              <div className="w-12 h-12 rounded-xl bg-primary-container/20 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-2xl">smart_toy</span>
              </div>
              <span className="font-bold text-sm text-on-surface">Ask Gemma AI</span>
              <span className="text-xs text-on-surface-variant">24/7 Civic Assistant</span>
            </Card>
          </a>
        </div>
      </section>

      {/* 3. Good Deeds Ecosystem — Discovery Hub */}
      <GoodDeedsDiscovery onClaimKarma={(amount) => setExtraKarma((prev) => prev + amount)} />

      {/* 4. Main Dashboard Grid (Credentials + Leaderboard) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
        {/* Credential Progress Section (Left 2 Columns) */}
        <div className="lg:col-span-2 flex flex-col gap-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-on-surface">Civic Credentials Progress</h2>
            <a href="/citizen/credentials" className="text-xs font-bold text-primary hover:underline">
              View All 8 Categories
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            {credentials.slice(0, 4).map((cred) => (
              <Card key={cred.id} className="p-md flex flex-col gap-sm border-outline-variant/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-lg bg-secondary-container/20 text-secondary flex items-center justify-center">
                      <span className="material-symbols-outlined text-xl">{cred.icon_name || 'eco'}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-on-surface">{cred.title}</h3>
                      <span className="text-[11px] text-on-surface-variant font-medium">{cred.category_name}</span>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold bg-surface-container-high px-2 py-0.5 rounded-full text-on-surface">
                    Level {cred.current_level || 1}
                  </span>
                </div>

                <div className="flex flex-col gap-1 mt-1">
                  <div className="flex justify-between text-[11px] font-semibold text-on-surface-variant">
                    <span>Progress</span>
                    <span>{cred.progress_karma || 25} / 100 XP</span>
                  </div>
                  <ProgressBar value={cred.progress_karma || 25} color="green" showPercentage={false} />
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Leaderboard Preview (Right Column) */}
        <div className="flex flex-col gap-sm">
          <h2 className="text-lg font-extrabold text-on-surface">Community Leaderboard</h2>
          <Card className="p-md flex flex-col gap-sm border-outline-variant/30">
            {leaderboard.length === 0 ? (
              <p className="text-xs text-on-surface-variant py-4 text-center">Loading leaderboard...</p>
            ) : (
              leaderboard.map((userItem) => {
                const isCurrentUser = userItem.id === profile?.id;
                return (
                  <div
                    key={userItem.id}
                    className={`flex items-center justify-between p-2 rounded-xl text-xs font-semibold gap-2 ${
                      isCurrentUser ? 'bg-primary-container/20 border border-primary/30 text-primary' : 'hover:bg-surface-container-high'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="w-5 font-extrabold text-on-surface-variant shrink-0">#{userItem.rank_position}</span>
                      <div className="w-7 h-7 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center shrink-0">
                        {userItem.full_name[0].toUpperCase()}
                      </div>
                      <span className="font-bold text-on-surface truncate">{userItem.full_name}</span>
                    </div>
                    <span className="font-extrabold text-secondary shrink-0">{userItem.karma_points} Karma</span>
                  </div>
                );
              })
            )}
          </Card>
        </div>
      </div>

      {/* 4. Recent Activity Section */}
      <section className="flex flex-col gap-sm">
        <h2 className="text-lg font-extrabold text-on-surface">Recent Reports & Activity</h2>
        {recentReports.length === 0 ? (
          <Card className="p-lg text-center text-xs text-on-surface-variant border-dashed border-outline-variant">
            No civic reports submitted yet. Click "Report Issue" to submit your first issue and earn +50 Karma!
          </Card>
        ) : (
          <div className="flex flex-col gap-sm">
            {recentReports.map((report) => (
              <Card key={report.id} className="p-md flex items-center justify-between gap-md border-outline-variant/30">
                <div className="flex items-center gap-md">
                  <div className="w-10 h-10 rounded-xl bg-primary-container/20 text-primary flex items-center justify-center">
                    <span className="material-symbols-outlined text-xl">build</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-on-surface">{report.title}</h4>
                    <p className="text-xs text-on-surface-variant">{report.location_name} • {new Date(report.created_at || Date.now()).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className="text-xs font-extrabold bg-secondary-container/20 text-secondary border border-secondary/30 px-3 py-1 rounded-full">
                  +{report.karma_awarded || 50} Karma
                </span>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
