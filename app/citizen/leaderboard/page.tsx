'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/src/components/ui/Card';
import { Chip } from '@/src/components/ui/Chip';
import { fetchLeaderboard } from '@/services/gamificationService';
import { useAuth } from '@/hooks/useAuth';

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly' | 'all'>('monthly');

  useEffect(() => {
    async function loadData() {
      const data = await fetchLeaderboard(25);
      setLeaderboard(data);
      setLoading(false);
    }
    loadData();
  }, [timeframe]);

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-lg pb-xl p-margin-mobile">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-md border-b border-outline-variant/30 pb-md">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-secondary">Civic Champions</span>
          <h1 className="text-2xl sm:text-3xl font-black text-on-surface">Citizen Leaderboard</h1>
          <p className="text-xs text-on-surface-variant">Recognizing top contributors making real impact in Bengaluru.</p>
        </div>

        {/* Timeframe Filters */}
        <div className="flex items-center gap-1 bg-surface-container-high p-1 rounded-full border border-outline-variant/30 self-start sm:self-auto">
          {(['weekly', 'monthly', 'all'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 rounded-full text-xs font-bold capitalize transition-colors ${
                timeframe === tf
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Podium Top 3 Ranks */}
      {!loading && leaderboard.length >= 3 && (
        <div className="grid grid-cols-3 gap-sm sm:gap-md items-end pt-md">
          {/* Rank 2 - Silver */}
          <Card className="p-sm sm:p-md flex flex-col items-center text-center gap-1 border-secondary/30 bg-surface-container-low shadow-sm">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-secondary-container/40 text-secondary font-black flex items-center justify-center border-2 border-secondary/50">
              #2
            </div>
            <span className="font-extrabold text-xs text-on-surface truncate max-w-[100px]">{leaderboard[1]?.full_name}</span>
            <span className="text-[11px] font-bold text-secondary">{leaderboard[1]?.karma_points} XP</span>
          </Card>

          {/* Rank 1 - Gold */}
          <Card className="p-md flex flex-col items-center text-center gap-1 border-primary/50 bg-primary-container/10 shadow-md scale-105">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary text-on-primary font-black flex items-center justify-center shadow-sm">
              👑 #1
            </div>
            <span className="font-black text-sm text-on-surface truncate max-w-[120px]">{leaderboard[0]?.full_name}</span>
            <span className="text-xs font-extrabold text-primary">{leaderboard[0]?.karma_points} Karma XP</span>
          </Card>

          {/* Rank 3 - Bronze */}
          <Card className="p-sm sm:p-md flex flex-col items-center text-center gap-1 border-tertiary/30 bg-surface-container-low shadow-sm">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-tertiary-container/40 text-tertiary font-black flex items-center justify-center border-2 border-tertiary/50">
              #3
            </div>
            <span className="font-extrabold text-xs text-on-surface truncate max-w-[100px]">{leaderboard[2]?.full_name}</span>
            <span className="text-[11px] font-bold text-tertiary">{leaderboard[2]?.karma_points} XP</span>
          </Card>
        </div>
      )}

      {/* Leaderboard Table List */}
      <Card className="p-0 border-outline-variant/30 overflow-hidden shadow-sm">
        <div className="divide-y divide-outline-variant/20">
          {loading ? (
            <div className="p-lg text-center text-xs font-bold text-on-surface-variant">Loading civic leaderboard...</div>
          ) : (
            leaderboard.map((item) => {
              const isCurrentUser = user?.id === item.user_id;
              return (
                <div
                  key={item.user_id}
                  className={`flex items-center justify-between p-md transition-colors ${
                    isCurrentUser ? 'bg-primary-container/20 border-l-4 border-primary' : 'hover:bg-surface-container-low'
                  }`}
                >
                  <div className="flex items-center gap-md">
                    <span className="font-black text-sm w-6 text-center text-on-surface-variant">#{item.rank}</span>
                    <div className="w-9 h-9 rounded-full bg-surface-container-high border border-outline-variant flex items-center justify-center font-bold text-xs text-on-surface uppercase">
                      {item.full_name.charAt(0)}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-extrabold text-xs text-on-surface flex items-center gap-2">
                        {item.full_name}
                        {isCurrentUser && (
                          <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full">You</span>
                        )}
                      </span>
                      <span className="text-[10px] text-on-surface-variant font-medium">{item.city}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-base text-secondary">star</span>
                    <span className="font-black text-sm text-on-surface">{item.karma_points} XP</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>
    </div>
  );
}
