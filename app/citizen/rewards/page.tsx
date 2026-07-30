'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { fetchRewards, redeemReward } from '@/services/rewardService';
import { useAuth } from '@/hooks/useAuth';
import type { Reward } from '@/src/types/database';

export default function RewardsPage() {
  const { user } = useAuth();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [redeemingId, setRedeemingId] = useState<string | null>(null);
  const [voucherModal, setVoucherModal] = useState<{ title: string; code: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      const data = await fetchRewards();
      setRewards(data);
      setLoading(false);
    }
    loadData();
  }, []);

  const handleRedeem = async (reward: Reward) => {
    if (!user) return;
    setRedeemingId(reward.id);
    setErrorMsg(null);

    const res = await redeemReward(user.id, reward.id, reward.cost_karma);
    setRedeemingId(null);

    if (res.success && res.voucherCode) {
      setVoucherModal({ title: reward.title, code: res.voucherCode });
    } else if (res.error) {
      setErrorMsg(res.error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-lg pb-xl p-margin-mobile">
      {/* Header Banner */}
      <div className="flex flex-col gap-1 border-b border-outline-variant/30 pb-md">
        <span className="text-xs font-bold uppercase tracking-widest text-secondary">Karma Rewards Catalog</span>
        <h1 className="text-2xl sm:text-3xl font-black text-on-surface">Redeem Karma Points</h1>
        <p className="text-xs text-on-surface-variant">Exchange your civic Karma XP for partner transit passes, green vouchers, and discounts.</p>
      </div>

      {errorMsg && (
        <div className="bg-error-container text-on-error-container p-3 rounded-xl text-xs font-bold flex items-center gap-2">
          <span className="material-symbols-outlined text-base">error</span>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Rewards Catalog Grid */}
      {loading ? (
        <div className="p-xl text-center text-xs font-bold text-on-surface-variant">Loading rewards catalog...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
          {rewards.map((r) => (
            <Card key={r.id} className="p-0 border-outline-variant/30 overflow-hidden shadow-sm flex flex-col justify-between">
              {r.image_url && (
                <div className="h-36 w-full relative overflow-hidden bg-surface-container-high">
                  <img src={r.image_url} alt={r.title} className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2 bg-primary text-on-primary text-xs font-black px-2.5 py-1 rounded-full shadow-sm">
                    {r.cost_karma} Karma XP
                  </div>
                </div>
              )}

              <div className="p-md flex flex-col gap-md flex-1 justify-between">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold uppercase text-secondary tracking-wider">{r.partner_name || r.category}</span>
                  <h3 className="font-extrabold text-base text-on-surface line-clamp-1">{r.title}</h3>
                  <p className="text-xs text-on-surface-variant line-clamp-2">{r.description}</p>
                </div>

                <Button
                  variant="primary"
                  icon="confirmation_number"
                  isLoading={redeemingId === r.id}
                  onClick={() => handleRedeem(r)}
                  className="w-full font-bold mt-2"
                >
                  Redeem for {r.cost_karma} XP
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Voucher Code Success Modal Popup */}
      {voucherModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-md">
          <Card className="w-full max-w-md p-lg flex flex-col items-center text-center gap-md border-secondary/40 shadow-2xl bg-surface-container-lowest animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 rounded-full bg-secondary-container/30 text-secondary flex items-center justify-center border-2 border-secondary">
              <span className="material-symbols-outlined text-4xl">celebration</span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold uppercase text-secondary tracking-wider">Redemption Complete</span>
              <h2 className="text-xl font-black text-on-surface">{voucherModal.title}</h2>
            </div>

            <div className="bg-surface-container-high p-md rounded-2xl border border-dashed border-secondary/50 w-full flex flex-col gap-1">
              <span className="text-[10px] text-on-surface-variant font-bold uppercase">Your Digital Voucher Code</span>
              <span className="font-mono text-xl font-black text-primary tracking-widest">{voucherModal.code}</span>
            </div>

            <Button
              variant="primary"
              onClick={() => setVoucherModal(null)}
              className="w-full font-bold mt-2"
            >
              Done & Close
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
}
