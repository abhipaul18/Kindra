import React, { useState } from 'react';
import type { Reward } from '../../types/database';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Chip } from '../ui/Chip';
import { redeemRewardVoucher } from '@/services/rewardService';
import { useAuth } from '@/hooks/useAuth';

export interface RedeemRewardsViewProps {
  rewards: Reward[];
  karmaPoints: number;
  onRedeem: (reward: Reward) => void;
}

export const RedeemRewardsView: React.FC<RedeemRewardsViewProps> = ({ rewards, karmaPoints, onRedeem }) => {
  const { user } = useAuth();
  const [redeemedCodes, setRedeemedCodes] = useState<Record<string, string>>({});
  const [loadingRewardId, setLoadingRewardId] = useState<string | null>(null);

  const handleRedeem = async (reward: Reward) => {
    if (karmaPoints < reward.karma_cost) return;

    setLoadingRewardId(reward.id);
    try {
      const result = await redeemRewardVoucher(reward.id, user?.id || 'guest');
      setRedeemedCodes((prev) => ({ ...prev, [reward.id]: result.code || reward.discount_code }));
      onRedeem(reward);
    } catch (err) {
      console.warn('Redemption error, fallback code displayed:', err);
      setRedeemedCodes((prev) => ({ ...prev, [reward.id]: reward.discount_code }));
      onRedeem(reward);
    } finally {
      setLoadingRewardId(null);
    }
  };

  return (
    <div className="flex flex-col gap-lg py-md px-margin-mobile md:px-margin-desktop max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-md">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-3xl">redeem</span>
            Redeem Karma Rewards
          </h1>
          <p className="text-sm text-on-surface-variant">
            Exchange your earned Karma points for discounts at local partner businesses and civic benefits.
          </p>
        </div>

        <Chip variant="secondary" icon="workspace_premium" className="text-base px-4 py-1.5 font-bold">
          Your Karma: {karmaPoints} Points
        </Chip>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
        {rewards.map((reward) => {
          const code = redeemedCodes[reward.id];
          const canAfford = karmaPoints >= reward.karma_cost;
          const isLoading = loadingRewardId === reward.id;

          return (
            <Card key={reward.id} hoverable className="gap-md flex flex-col justify-between">
              {reward.image_url && (
                <img
                  src={reward.image_url}
                  alt={reward.title}
                  className="w-full h-36 object-cover rounded-lg border border-outline-variant/30"
                />
              )}

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-semibold text-outline">{reward.partner_name}</span>
                  <Chip variant="amber">{reward.karma_cost} Karma</Chip>
                </div>
                <h3 className="font-bold text-on-surface text-lg mb-1">{reward.title}</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">{reward.description}</p>
              </div>

              {code ? (
                <div className="bg-secondary-container/30 border border-secondary/30 p-3 rounded-lg text-center">
                  <span className="text-xs font-bold text-on-secondary-container uppercase">Coupon Code:</span>
                  <div className="text-lg font-extrabold text-secondary tracking-widest mt-0.5">{code}</div>
                </div>
              ) : (
                <Button
                  variant={canAfford ? 'primary' : 'ghost'}
                  disabled={!canAfford || isLoading}
                  isLoading={isLoading}
                  onClick={() => handleRedeem(reward)}
                  className="w-full font-bold"
                >
                  {canAfford ? 'Redeem Voucher' : `Need ${reward.karma_cost - karmaPoints} More Karma`}
                </Button>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};
