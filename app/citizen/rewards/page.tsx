'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchRewards } from '@/services/rewardService';
import { useCitizenDashboard } from '@/hooks/useCitizenDashboard';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';

export default function CitizenRewardsPage() {
  const { profile } = useCitizenDashboard();
  const { data: rewards = [], isLoading } = useQuery({
    queryKey: ['rewards-catalog'],
    queryFn: fetchRewards,
  });

  return (
    <div className="flex flex-col gap-lg pb-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-md">
        <div>
          <h1 className="text-2xl font-black text-on-surface">Redeem Partner Rewards</h1>
          <p className="text-sm text-on-surface-variant">
            Exchange your hard-earned Karma Points for discounts at local partner cafes and businesses.
          </p>
        </div>
        <div className="bg-secondary-container/20 border border-secondary/30 text-secondary px-4 py-2 rounded-xl text-sm font-extrabold flex items-center gap-2 self-start">
          <span className="material-symbols-outlined text-xl">eco</span>
          <span>Balance: {profile?.karma_points || 100} Karma</span>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-surface-container-high rounded-xl animate-pulse" />
          ))}
        </div>
      ) : rewards.length === 0 ? (
        <Card className="p-xl text-center flex flex-col items-center gap-md border-outline-variant/30">
          <span className="material-symbols-outlined text-4xl text-on-surface-variant">card_giftcard</span>
          <h3 className="text-base font-bold text-on-surface">No Rewards Available Right Now</h3>
          <p className="text-xs text-on-surface-variant max-w-sm">
            Partner rewards will appear here shortly as local businesses sponsor new Karma discount codes.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
          {rewards.map((reward) => {
            const canAfford = (profile?.karma_points || 100) >= reward.karma_cost;
            return (
              <Card key={reward.id} className="p-md flex flex-col justify-between gap-md border-outline-variant/30">
                <div className="flex flex-col gap-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold bg-surface-container-high px-2.5 py-1 rounded-full text-on-surface">
                      {reward.partner_name}
                    </span>
                    <span className="text-xs font-extrabold text-secondary flex items-center gap-1">
                      <span className="material-symbols-outlined text-base">eco</span>
                      {reward.karma_cost} Karma
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-on-surface">{reward.title}</h3>
                  <p className="text-xs text-on-surface-variant">{reward.description}</p>
                </div>

                <Button
                  variant={canAfford ? 'secondary' : 'outline'}
                  disabled={!canAfford}
                  className="w-full font-bold text-xs"
                >
                  {canAfford ? 'Redeem Perk Voucher' : `Need ${reward.karma_cost - (profile?.karma_points || 100)} More Karma`}
                </Button>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
