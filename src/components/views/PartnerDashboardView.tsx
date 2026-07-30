import React from 'react';
import type { Campaign, Reward } from '../../types/database';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Chip } from '../ui/Chip';
import { ProgressBar } from '../ui/ProgressBar';

export interface PartnerDashboardViewProps {
  campaigns: Campaign[];
  rewards: Reward[];
}

export const PartnerDashboardView: React.FC<PartnerDashboardViewProps> = ({ campaigns, rewards }) => {
  return (
    <div className="flex flex-col gap-lg py-md px-margin-mobile md:px-margin-desktop max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-md">
        <div>
          <span className="text-xs font-semibold text-tertiary uppercase tracking-wider">Community Partner Portal</span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-on-surface">Metro Clean Energy & Business Network</h1>
          <p className="text-sm text-on-surface-variant">Sponsor civic initiatives, track Karma reward redemptions, and view social ROI.</p>
        </div>
        <Button variant="primary" icon="add">Sponsor New Campaign</Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-md">
        <Card className="flex flex-col justify-between p-md">
          <span className="text-xs font-semibold text-outline">Total Contributed</span>
          <span className="text-3xl font-extrabold text-primary">$11,420</span>
          <span className="text-xs text-secondary font-medium">Across 4 Civic Campaigns</span>
        </Card>

        <Card className="flex flex-col justify-between p-md">
          <span className="text-xs font-semibold text-outline">Karma Rewards Redeemed</span>
          <span className="text-3xl font-extrabold text-secondary">168 Redeemed</span>
          <span className="text-xs text-on-surface-variant font-medium">84% Redemption Rate</span>
        </Card>

        <Card className="flex flex-col justify-between p-md">
          <span className="text-xs font-semibold text-outline">Citizen Impact Reach</span>
          <span className="text-3xl font-extrabold text-tertiary">3,850 Citizens</span>
          <span className="text-xs text-outline font-medium">Verified Civic Engagement</span>
        </Card>
      </div>

      {/* Campaigns & Rewards Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
        {/* Active Campaigns */}
        <div className="flex flex-col gap-md">
          <h2 className="text-xl font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">campaign</span>
            Sponsored Campaigns
          </h2>

          {campaigns.map((camp) => (
            <Card key={camp.id} className="gap-sm">
              <div className="flex justify-between items-center">
                <Chip variant="primary">{camp.category}</Chip>
                <span className="text-xs font-semibold text-secondary">{camp.status.toUpperCase()}</span>
              </div>
              <h3 className="font-bold text-on-surface text-base">{camp.title}</h3>
              <p className="text-xs text-on-surface-variant">{camp.description}</p>
              <ProgressBar
                value={(camp.current_amount / camp.target_amount) * 100}
                color="green"
                label={`$${camp.current_amount.toLocaleString()} of $${camp.target_amount.toLocaleString()}`}
              />
            </Card>
          ))}
        </div>

        {/* Sponsored Perks & Rewards */}
        <div className="flex flex-col gap-md">
          <h2 className="text-xl font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-tertiary">redeem</span>
            Sponsored Karma Perks
          </h2>

          {rewards.map((reward) => (
            <Card key={reward.id} className="gap-sm">
              <div className="flex justify-between items-center">
                <span className="font-bold text-on-surface text-base">{reward.title}</span>
                <Chip variant="amber">{reward.karma_cost} Karma</Chip>
              </div>
              <p className="text-xs text-on-surface-variant">{reward.description}</p>
              <div className="flex justify-between items-center text-xs text-outline pt-2 border-t border-outline-variant/20">
                <span>Code: {reward.discount_code}</span>
                <span>Remaining: {reward.remaining} / {reward.total_available}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
