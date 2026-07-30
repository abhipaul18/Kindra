'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { ProgressBar } from '@/src/components/ui/ProgressBar';
import { useAuth } from '@/hooks/useAuth';
import { fetchPartnerCampaigns, createPartnerCampaign, updatePartnerCampaign } from '@/services/partnerService';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  draft: { label: 'Draft', color: 'bg-gray-500/10 text-gray-600' },
  active: { label: 'Active', color: 'bg-green-500/10 text-green-600' },
  completed: { label: 'Completed', color: 'bg-blue-500/10 text-blue-600' },
  paused: { label: 'Paused', color: 'bg-amber-500/10 text-amber-600' },
};

export default function PartnerCampaignsPage() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', target_amount: 1000 });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    loadCampaigns();
  }, [user?.id]);

  async function loadCampaigns() {
    setLoading(true);
    const data = await fetchPartnerCampaigns(user!.id);
    setCampaigns(data);
    setLoading(false);
  }

  async function handleCreate() {
    setSaving(true);
    try {
      await createPartnerCampaign({ ...form, partner_id: user!.id });
      setShowForm(false);
      setForm({ title: '', description: '', target_amount: 1000 });
      await loadCampaigns();
    } catch (err) { console.error(err); }
    setSaving(false);
  }

  async function handleStatusChange(campaignId: string, newStatus: string) {
    await updatePartnerCampaign(campaignId, { status: newStatus });
    await loadCampaigns();
  }

  return (
    <div className="flex flex-col gap-lg pb-xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-on-surface">Manage Campaigns</h1>
        <Button variant="primary" size="sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ New Campaign'}
        </Button>
      </div>

      {showForm && (
        <Card className="p-lg flex flex-col gap-md border-blue-500/20">
          <h2 className="font-bold text-on-surface">Create New Campaign</h2>
          <input
            placeholder="Campaign Title"
            value={form.title}
            onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
            className="px-3 py-2 rounded-xl bg-surface-container-high border border-outline-variant/30 text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-blue-500"
          />
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
            rows={2}
            className="px-3 py-2 rounded-xl bg-surface-container-high border border-outline-variant/30 text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-blue-500 resize-none"
          />
          <div>
            <label className="text-xs font-semibold text-on-surface-variant block mb-1">Target Amount (Karma Goal)</label>
            <input
              type="number"
              value={form.target_amount}
              onChange={(e) => setForm(f => ({ ...f, target_amount: Number(e.target.value) }))}
              className="w-full px-3 py-2 rounded-xl bg-surface-container-high border border-outline-variant/30 text-sm text-on-surface focus:outline-none focus:border-blue-500"
            />
          </div>
          <Button variant="primary" onClick={handleCreate} disabled={saving || !form.title}>
            {saving ? 'Creating...' : 'Create Campaign'}
          </Button>
        </Card>
      )}

      {loading ? (
        <div className="flex flex-col gap-sm animate-pulse">
          {[1,2,3].map(i => <div key={i} className="h-28 bg-surface-container-high rounded-xl" />)}
        </div>
      ) : campaigns.length === 0 ? (
        <Card className="p-xl text-center text-on-surface-variant border-dashed">
          <span className="material-symbols-outlined text-4xl mb-2 block">campaign</span>
          <p className="text-sm font-semibold">No campaigns created yet</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-sm">
          {campaigns.map((campaign) => {
            const progress = campaign.target_amount > 0 ? Math.round(((campaign.current_amount || 0) / campaign.target_amount) * 100) : 0;
            const statusInfo = STATUS_LABELS[campaign.status] || STATUS_LABELS.draft;
            return (
              <Card key={campaign.id} className="p-md flex flex-col gap-sm border-outline-variant/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-md">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                      <span className="material-symbols-outlined text-xl">campaign</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-on-surface">{campaign.title}</h3>
                      <p className="text-xs text-on-surface-variant truncate max-w-[300px]">{campaign.description}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-[11px] font-semibold text-on-surface-variant">
                    <span>Progress</span>
                    <span>{campaign.current_amount || 0} / {campaign.target_amount}</span>
                  </div>
                  <ProgressBar value={progress} color="green" showPercentage={false} />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  {campaign.status === 'draft' && (
                    <Button variant="primary" size="sm" onClick={() => handleStatusChange(campaign.id, 'active')}>Activate</Button>
                  )}
                  {campaign.status === 'active' && (
                    <>
                      <Button variant="outline" size="sm" onClick={() => handleStatusChange(campaign.id, 'paused')}>Pause</Button>
                      <Button variant="primary" size="sm" onClick={() => handleStatusChange(campaign.id, 'completed')}>Complete</Button>
                    </>
                  )}
                  {campaign.status === 'paused' && (
                    <Button variant="primary" size="sm" onClick={() => handleStatusChange(campaign.id, 'active')}>Resume</Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
