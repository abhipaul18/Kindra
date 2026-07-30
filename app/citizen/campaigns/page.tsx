'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { ProgressBar } from '@/src/components/ui/ProgressBar';
import { fetchActiveCampaigns, joinCampaign } from '@/services/campaignService';
import { useAuth } from '@/hooks/useAuth';
import type { Campaign } from '@/src/types/database';

export default function CampaignsPage() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [joinedMap, setJoinedMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function loadData() {
      const data = await fetchActiveCampaigns();
      setCampaigns(data);
      setLoading(false);
    }
    loadData();
  }, []);

  const handleJoin = async (campaignId: string) => {
    if (!user) return;
    await joinCampaign(user.id, campaignId);
    setJoinedMap((prev) => ({ ...prev, [campaignId]: true }));
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-lg pb-xl p-margin-mobile">
      {/* Header Banner */}
      <div className="flex flex-col gap-1 border-b border-outline-variant/30 pb-md">
        <span className="text-xs font-bold uppercase tracking-widest text-secondary">Collective Action</span>
        <h1 className="text-2xl sm:text-3xl font-black text-on-surface">Civic Campaigns</h1>
        <p className="text-xs text-on-surface-variant">Unite with fellow citizens to transform community parks, roads, and environment.</p>
      </div>

      {/* Campaigns Grid */}
      {loading ? (
        <div className="p-xl text-center text-xs font-bold text-on-surface-variant">Loading civic campaigns...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          {campaigns.map((c) => {
            const isJoined = joinedMap[c.id];
            const currentPart = (c as any).current_participants || 342;
            const goalPart = (c as any).goal_participants || 500;
            const percent = Math.min(100, Math.round((currentPart / goalPart) * 100));

            return (
              <Card key={c.id} className="p-0 border-outline-variant/30 overflow-hidden shadow-sm flex flex-col justify-between">
                {/* Banner Image */}
                {c.banner_url && (
                  <div className="h-40 w-full relative overflow-hidden bg-surface-container-high">
                    <img src={c.banner_url} alt={c.title} className="w-full h-full object-cover" />
                    <div className="absolute top-2 right-2 bg-secondary text-on-secondary text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                      +{c.karma_reward} XP Karma
                    </div>
                  </div>
                )}

                {/* Content Details */}
                <div className="p-md flex flex-col gap-md flex-1">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold uppercase text-secondary tracking-wider">{c.category}</span>
                    <h2 className="font-extrabold text-base text-on-surface line-clamp-1">{c.title}</h2>
                    <p className="text-xs text-on-surface-variant line-clamp-2">{c.description}</p>
                  </div>

                  {/* Participation Progress Bar */}
                  <div className="flex flex-col gap-1 mt-auto">
                    <div className="flex justify-between text-xs font-bold text-on-surface">
                      <span>{currentPart} Citizens Joined</span>
                      <span>Target: {goalPart}</span>
                    </div>
                    <ProgressBar value={percent} color="green" showPercentage={false} />
                  </div>

                  {/* Join Button Action */}
                  <Button
                    variant={isJoined ? 'outline' : 'primary'}
                    icon={isJoined ? 'check_circle' : 'group_add'}
                    disabled={isJoined}
                    onClick={() => handleJoin(c.id)}
                    className="w-full font-bold mt-2"
                  >
                    {isJoined ? 'Joined Campaign' : 'Join Civic Campaign'}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
