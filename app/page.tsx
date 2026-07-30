'use client';

import React, { useState } from 'react';
import type { UserRole, CivicReport, VolunteerTask, Campaign, Reward, NotificationItem } from '@/src/types/database';
import {
  mockCivicReports,
  mockDepartments,
  mockVolunteerTasks,
  mockCampaigns,
  mockRewards,
  mockNotifications,
} from '@/src/lib/mockData';

import { TopAppBar } from '@/src/components/ui/TopAppBar';
import { RoleSelectionView } from '@/src/components/views/RoleSelectionView';
import { CitizenDashboardView } from '@/src/components/views/CitizenDashboardView';
import { ReportIssueView } from '@/src/components/views/ReportIssueView';
import { AskGemmaView } from '@/src/components/views/AskGemmaView';
import { VolunteerTasksView } from '@/src/components/views/VolunteerTasksView';
import { RedeemRewardsView } from '@/src/components/views/RedeemRewardsView';
import { OfficerDashboardView } from '@/src/components/views/OfficerDashboardView';
import { PartnerDashboardView } from '@/src/components/views/PartnerDashboardView';
import { AdminDashboardView } from '@/src/components/views/AdminDashboardView';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';

export default function HomePage() {
  const [currentRole, setCurrentRole] = useState<UserRole>('citizen');
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  const [reports, setReports] = useState<CivicReport[]>(mockCivicReports);
  const [tasks] = useState<VolunteerTask[]>(mockVolunteerTasks);
  const [campaigns] = useState<Campaign[]>(mockCampaigns);
  const [rewards] = useState<Reward[]>(mockRewards);
  const [notifications, setNotifications] = useState<NotificationItem[]>(mockNotifications);
  const [karmaPoints, setKarmaPoints] = useState<number>(350);

  const [showNotifications, setShowNotifications] = useState<boolean>(false);

  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    if (role === 'citizen') setActiveTab('dashboard');
    else if (role === 'officer') setActiveTab('officer_dashboard');
    else if (role === 'partner') setActiveTab('partner_dashboard');
    else if (role === 'admin') setActiveTab('admin_analytics');
  };

  const handleAddReport = (newReport: CivicReport) => {
    setReports((prev) => [newReport, ...prev]);
    setKarmaPoints((prev) => prev + 50);

    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      user_id: 'user-01',
      title: 'Report Published & +50 Karma!',
      message: `Your report "${newReport.title}" was submitted and sent for AI verification.`,
      type: 'success',
      is_read: false,
      created_at: new Date().toISOString(),
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const handleUpdateReportStatus = (reportId: string, newStatus: CivicReport['status']) => {
    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, status: newStatus, updated_at: new Date().toISOString() } : r))
    );
  };

  const handleRedeemReward = (reward: Reward) => {
    if (karmaPoints < reward.karma_cost) return;
    setKarmaPoints((prev) => prev - reward.karma_cost);
  };

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col font-sans">
      {/* Navigation Top Bar */}
      <TopAppBar
        currentRole={currentRole}
        onRoleChange={handleRoleChange}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        karmaPoints={karmaPoints}
        unreadNotifications={notifications.filter((n) => !n.is_read).length}
        onOpenNotifications={() => setShowNotifications(true)}
      />

      {/* Portal Main Content */}
      <main className="flex-1 pt-16 pb-lg">
        {/* Live Portal Navigation — For Hackathon Judges */}
        <section className="max-w-5xl mx-auto px-margin-mobile md:px-margin-desktop py-lg">
          <div className="flex flex-col gap-md mb-lg">
            <div className="text-center">
              <h2 className="text-xl font-black text-on-surface">🚀 Launch Live Portals</h2>
              <p className="text-xs text-on-surface-variant mt-1">Authenticated portals connected to Supabase + Gemma AI</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
              <a href="/citizen/dashboard">
                <Card hoverable className="p-md flex flex-col items-center text-center gap-sm border-primary/30 hover:border-primary hover:shadow-md transition-all">
                  <div className="w-12 h-12 rounded-xl bg-primary-container/20 text-primary flex items-center justify-center">
                    <span className="material-symbols-outlined text-2xl">person</span>
                  </div>
                  <span className="font-bold text-sm text-on-surface">Citizen Portal</span>
                  <span className="text-[10px] text-on-surface-variant">Report • Verify • Earn Karma</span>
                </Card>
              </a>
              <a href="/officer/dashboard">
                <Card hoverable className="p-md flex flex-col items-center text-center gap-sm border-blue-500/30 hover:border-blue-500 hover:shadow-md transition-all">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                    <span className="material-symbols-outlined text-2xl">shield</span>
                  </div>
                  <span className="font-bold text-sm text-on-surface">Officer Portal</span>
                  <span className="text-[10px] text-on-surface-variant">Queue • Review • Resolve</span>
                </Card>
              </a>
              <a href="/partner/dashboard">
                <Card hoverable className="p-md flex flex-col items-center text-center gap-sm border-amber-500/30 hover:border-amber-500 hover:shadow-md transition-all">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                    <span className="material-symbols-outlined text-2xl">storefront</span>
                  </div>
                  <span className="font-bold text-sm text-on-surface">Partner Portal</span>
                  <span className="text-[10px] text-on-surface-variant">Rewards • Campaigns</span>
                </Card>
              </a>
              <a href="/admin/dashboard">
                <Card hoverable className="p-md flex flex-col items-center text-center gap-sm border-red-500/30 hover:border-red-500 hover:shadow-md transition-all">
                  <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-600 flex items-center justify-center">
                    <span className="material-symbols-outlined text-2xl">admin_panel_settings</span>
                  </div>
                  <span className="font-bold text-sm text-on-surface">Admin Portal</span>
                  <span className="text-[10px] text-on-surface-variant">Analytics • Users • Settings</span>
                </Card>
              </a>
            </div>
          </div>
        </section>

        {activeTab === 'role_selection' && (
          <RoleSelectionView onSelectRole={handleRoleChange} />
        )}

        {/* Citizen Portal */}
        {currentRole === 'citizen' && activeTab === 'dashboard' && (
          <CitizenDashboardView
            reports={reports}
            tasks={tasks}
            campaigns={campaigns}
            karmaPoints={karmaPoints}
            onNavigate={setActiveTab}
          />
        )}

        {currentRole === 'citizen' && activeTab === 'report_issue' && (
          <ReportIssueView onAddReport={handleAddReport} onNavigate={setActiveTab} />
        )}

        {currentRole === 'citizen' && activeTab === 'ask_gemma' && <AskGemmaView />}

        {currentRole === 'citizen' && (activeTab === 'volunteer_tasks' || activeTab === 'campaigns') && (
          <VolunteerTasksView tasks={tasks} onJoinTask={() => setKarmaPoints((p) => p + 75)} />
        )}

        {currentRole === 'citizen' && activeTab === 'redeem_rewards' && (
          <RedeemRewardsView rewards={rewards} karmaPoints={karmaPoints} onRedeem={handleRedeemReward} />
        )}

        {/* Officer Portal */}
        {currentRole === 'officer' && (
          <OfficerDashboardView
            reports={reports}
            departments={mockDepartments}
            onUpdateStatus={handleUpdateReportStatus}
          />
        )}

        {/* Partner Portal */}
        {currentRole === 'partner' && (
          <PartnerDashboardView campaigns={campaigns} rewards={rewards} />
        )}

        {/* Admin Portal */}
        {currentRole === 'admin' && (
          <AdminDashboardView departments={mockDepartments} reports={reports} />
        )}
      </main>

      {/* Notifications Modal Drawer */}
      {showNotifications && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-md bg-surface-container-lowest h-full shadow-2xl p-md flex flex-col justify-between animate-fade-in border-l border-outline-variant/30">
            <div>
              <div className="flex justify-between items-center pb-sm border-b border-outline-variant/20 mb-md">
                <h3 className="font-bold text-on-surface text-lg flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">notifications</span>
                  Notifications
                </h3>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="p-1 rounded-full hover:bg-surface-container text-on-surface-variant"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="flex flex-col gap-sm">
                {notifications.map((n) => (
                  <Card key={n.id} className="p-sm bg-surface-container-low border border-outline-variant/20 gap-1">
                    <span className="font-bold text-on-surface text-sm">{n.title}</span>
                    <p className="text-xs text-on-surface-variant leading-relaxed">{n.message}</p>
                    <span className="text-[10px] text-outline mt-1">{new Date(n.created_at || Date.now()).toLocaleTimeString()}</span>
                  </Card>
                ))}
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
                setShowNotifications(false);
              }}
              className="w-full"
            >
              Mark All as Read
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
