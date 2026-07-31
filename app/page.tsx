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
import { AuthLoginView } from '@/src/components/views/AuthLoginView';
import KindraLandingPage from '@/components/landing/KindraLandingPage';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { FloatingAIButton } from '@/src/components/ui/FloatingAIButton';

import { useAuth } from '@/hooks/useAuth';

export default function HomePage() {
  const { user, role } = useAuth() || {};
  const [currentRole, setCurrentRole] = useState<UserRole>('citizen');
  const [activeTab, setActiveTab] = useState<string>('landing');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  const [reports, setReports] = useState<CivicReport[]>(mockCivicReports);
  const [tasks] = useState<VolunteerTask[]>(mockVolunteerTasks);
  const [campaigns] = useState<Campaign[]>(mockCampaigns);
  const [rewards] = useState<Reward[]>(mockRewards);
  const [notifications, setNotifications] = useState<NotificationItem[]>(mockNotifications);
  const [karmaPoints, setKarmaPoints] = useState<number>(350);

  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div suppressHydrationWarning className="min-h-screen bg-background text-on-surface flex flex-col font-sans" />
    );
  }

  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    setIsLoggedIn(true);
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
    <div suppressHydrationWarning className="min-h-screen bg-background text-on-surface flex flex-col font-sans">
      {/* Navigation Top Bar */}
      <TopAppBar
        currentRole={currentRole}
        onRoleChange={handleRoleChange}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
        }}
        karmaPoints={karmaPoints}
        unreadNotifications={notifications.filter((n) => !n.is_read).length}
        onOpenNotifications={() => setShowNotifications(true)}
        isLoggedIn={isLoggedIn}
      />

      {/* Main Content Area */}
      <main className="flex-1 pt-0">
        {/* Login / Sign Up Page from Stitch Screen */}
        {(activeTab === 'login' || activeTab === 'register') && (
          <AuthLoginView
            onLoginSuccess={() => {
              window.location.href = '/citizen/dashboard';
            }}
            onRoleSelect={(role) => handleRoleChange(role)}
          />
        )}

        {/* Premium AI-Powered Landing Page (Default View) */}
        {activeTab === 'landing' && (
          <KindraLandingPage
            onExploreMissions={() => setActiveTab('dashboard')}
            onNavigateToRole={(role) => handleRoleChange(role as UserRole)}
            onNavigateToAuth={() => setActiveTab('login')}
          />
        )}

        {activeTab === 'role_selection' && <RoleSelectionView onSelectRole={handleRoleChange} />}

        {/* Citizen Portal Views */}
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

        {/* Officer Portal Views */}
        {currentRole === 'officer' && (
          <OfficerDashboardView
            reports={reports}
            departments={mockDepartments}
            onUpdateStatus={handleUpdateReportStatus}
          />
        )}

        {/* Partner Portal Views */}
        {currentRole === 'partner' && <PartnerDashboardView campaigns={campaigns} rewards={rewards} />}

        {/* Admin Portal Views */}
        {currentRole === 'admin' && <AdminDashboardView departments={mockDepartments} reports={reports} />}
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
                    <span className="text-[10px] text-outline mt-1">
                      {new Date(n.created_at || Date.now()).toLocaleTimeString()}
                    </span>
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

      {/* Floating Gemma AI Assistant Button */}
      <FloatingAIButton />
    </div>
  );
}
