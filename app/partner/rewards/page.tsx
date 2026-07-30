'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { fetchPartnerRewards, createPartnerReward, deletePartnerReward } from '@/services/partnerService';

export default function PartnerRewardsPage() {
  const { user, profile } = useAuth();
  const [rewards, setRewards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', karma_cost: 50, discount_code: '', total_available: 100 });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    loadRewards();
  }, [user?.id]);

  async function loadRewards() {
    setLoading(true);
    const data = await fetchPartnerRewards(user!.id);
    setRewards(data);
    setLoading(false);
  }

  async function handleCreate() {
    setSaving(true);
    try {
      await createPartnerReward({
        ...form,
        partner_id: user!.id,
        partner_name: profile?.partner_org_name || profile?.full_name || 'Partner',
      });
      setShowForm(false);
      setForm({ title: '', description: '', karma_cost: 50, discount_code: '', total_available: 100 });
      await loadRewards();
    } catch (err) { console.error(err); }
    setSaving(false);
  }

  async function handleDelete(rewardId: string) {
    if (!confirm('Delete this reward?')) return;
    await deletePartnerReward(rewardId);
    await loadRewards();
  }

  return (
    <div className="flex flex-col gap-lg pb-xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-on-surface">Manage Rewards</h1>
        <Button variant="primary" size="sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ New Reward'}
        </Button>
      </div>

      {/* Create Reward Form */}
      {showForm && (
        <Card className="p-lg flex flex-col gap-md border-amber-500/20">
          <h2 className="font-bold text-on-surface">Create New Reward</h2>
          <input
            placeholder="Reward Title"
            value={form.title}
            onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
            className="px-3 py-2 rounded-xl bg-surface-container-high border border-outline-variant/30 text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-amber-500"
          />
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
            rows={2}
            className="px-3 py-2 rounded-xl bg-surface-container-high border border-outline-variant/30 text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-amber-500 resize-none"
          />
          <div className="grid grid-cols-3 gap-sm">
            <div>
              <label className="text-xs font-semibold text-on-surface-variant block mb-1">Karma Cost</label>
              <input
                type="number"
                value={form.karma_cost}
                onChange={(e) => setForm(f => ({ ...f, karma_cost: Number(e.target.value) }))}
                className="w-full px-3 py-2 rounded-xl bg-surface-container-high border border-outline-variant/30 text-sm text-on-surface focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-on-surface-variant block mb-1">Discount Code</label>
              <input
                placeholder="CODE123"
                value={form.discount_code}
                onChange={(e) => setForm(f => ({ ...f, discount_code: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl bg-surface-container-high border border-outline-variant/30 text-sm text-on-surface focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-on-surface-variant block mb-1">Quantity</label>
              <input
                type="number"
                value={form.total_available}
                onChange={(e) => setForm(f => ({ ...f, total_available: Number(e.target.value) }))}
                className="w-full px-3 py-2 rounded-xl bg-surface-container-high border border-outline-variant/30 text-sm text-on-surface focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
          <Button variant="primary" onClick={handleCreate} disabled={saving || !form.title}>
            {saving ? 'Creating...' : 'Create Reward'}
          </Button>
        </Card>
      )}

      {/* Rewards List */}
      {loading ? (
        <div className="flex flex-col gap-sm animate-pulse">
          {[1,2,3].map(i => <div key={i} className="h-24 bg-surface-container-high rounded-xl" />)}
        </div>
      ) : rewards.length === 0 ? (
        <Card className="p-xl text-center text-on-surface-variant border-dashed">
          <span className="material-symbols-outlined text-4xl mb-2 block">redeem</span>
          <p className="text-sm font-semibold">No rewards created yet</p>
          <p className="text-xs">Click &quot;+ New Reward&quot; to create your first reward offer</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-sm">
          {rewards.map((reward) => (
            <Card key={reward.id} className="p-md flex items-center gap-md border-outline-variant/30">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-2xl">redeem</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm text-on-surface">{reward.title}</h3>
                <p className="text-xs text-on-surface-variant truncate">{reward.description}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs font-bold text-secondary">{reward.karma_cost} Karma</span>
                  <span className="text-xs text-on-surface-variant">{reward.remaining}/{reward.total_available} remaining</span>
                </div>
              </div>
              <button
                onClick={() => handleDelete(reward.id)}
                className="p-2 rounded-lg text-on-surface-variant hover:text-error hover:bg-error-container/20 transition-colors"
              >
                <span className="material-symbols-outlined text-xl">delete</span>
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
