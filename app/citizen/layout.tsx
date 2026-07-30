'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { useAuth } from '@/hooks/useAuth';
import { useCitizenDashboard } from '@/hooks/useCitizenDashboard';

export default function CitizenLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, profile, logout } = useAuth();
  const { unreadNotificationCount } = useCitizenDashboard();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard', path: '/citizen/dashboard', icon: 'dashboard' },
    { label: 'Report Issue', path: '/citizen/report', icon: 'report_problem' },
    { label: 'Leaderboard', path: '/citizen/leaderboard', icon: 'leaderboard' },
    { label: 'Civic Campaigns', path: '/citizen/campaigns', icon: 'campaign' },
    { label: 'My Credentials', path: '/citizen/credentials', icon: 'military_tech' },
    { label: 'Redeem Rewards', path: '/citizen/rewards', icon: 'redeem' },
    { label: 'Notifications', path: '/citizen/notifications', icon: 'notifications', badge: unreadNotificationCount },
    { label: 'My Profile', path: '/citizen/profile', icon: 'account_circle' },
  ];

  return (
    <AuthGuard allowedRoles={['citizen', 'admin']}>
      <div className="min-h-screen bg-background flex flex-col font-sans">
        {/* Top Header */}
        <header className="bg-surface border-b border-outline-variant/30 sticky top-0 z-40 px-margin-mobile md:px-margin-desktop h-16 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-md">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-on-surface p-1 rounded-lg hover:bg-surface-container-high transition-colors"
            >
              <span className="material-symbols-outlined text-2xl">menu</span>
            </button>

            <a href="/citizen/dashboard" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-primary-container text-on-primary font-black text-xl flex items-center justify-center shadow-sm">
                K
              </div>
              <span className="font-extrabold text-xl tracking-tight text-on-surface">KINDRA</span>
              <span className="text-xs bg-secondary-container/30 text-secondary border border-secondary/30 px-2 py-0.5 rounded-full font-semibold">
                Citizen Portal
              </span>
            </a>
          </div>

          {/* Right Profile Actions */}
          <div className="flex items-center gap-md">
            {/* Karma Badge */}
            <div className="bg-secondary-container/20 border border-secondary/30 text-secondary px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm">
              <span className="material-symbols-outlined text-base">eco</span>
              <span>{profile?.karma_points || 100} Karma</span>
            </div>

            {/* Notification Bell */}
            <a
              href="/citizen/notifications"
              className="relative p-2 rounded-full hover:bg-surface-container-high text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined text-2xl">notifications</span>
              {unreadNotificationCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-error text-on-error text-[10px] font-bold flex items-center justify-center">
                  {unreadNotificationCount}
                </span>
              )}
            </a>

            {/* User Profile Avatar & Logout */}
            <div className="flex items-center gap-2 pl-2 border-l border-outline-variant/30">
              <a
                href="/citizen/profile"
                className="w-9 h-9 rounded-full bg-primary-container/20 text-primary font-bold flex items-center justify-center overflow-hidden border border-primary/20 hover:scale-105 transition-transform"
              >
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="User Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span>{(profile?.full_name || 'C')[0].toUpperCase()}</span>
                )}
              </a>
              <button
                onClick={logout}
                title="Sign Out"
                className="text-on-surface-variant hover:text-error p-1.5 rounded-lg hover:bg-error-container/20 transition-colors"
              >
                <span className="material-symbols-outlined text-xl">logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Body with Sidebar */}
        <div className="flex-1 flex max-w-7xl w-full mx-auto">
          {/* Desktop Sidebar Navigation */}
          <aside className="hidden md:flex flex-col w-64 border-r border-outline-variant/30 p-md gap-2 bg-surface">
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <a
                  key={item.path}
                  href={item.path}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                    isActive
                      ? 'bg-primary-container/15 text-primary border-l-4 border-primary shadow-sm'
                      : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-xl">{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="bg-error text-on-error px-2 py-0.5 rounded-full text-xs font-bold">
                      {item.badge}
                    </span>
                  )}
                </a>
              );
            })}
          </aside>

          {/* Mobile Drawer Menu */}
          {isMobileMenuOpen && (
            <div className="fixed inset-0 z-50 bg-on-surface/40 md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
              <div
                className="w-4/5 max-w-xs h-full bg-surface p-lg flex flex-col gap-md shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between pb-md border-b border-outline-variant/30">
                  <span className="font-bold text-lg text-on-surface">Menu</span>
                  <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 rounded-lg">
                    <span className="material-symbols-outlined text-xl">close</span>
                  </button>
                </div>
                <div className="flex flex-col gap-2">
                  {navItems.map((item) => (
                    <a
                      key={item.path}
                      href={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm ${
                        pathname === item.path ? 'bg-primary-container/15 text-primary' : 'text-on-surface-variant'
                      }`}
                    >
                      <span className="material-symbols-outlined text-xl">{item.icon}</span>
                      <span>{item.label}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Main Content Area */}
          <main className="flex-1 p-margin-mobile md:p-margin-desktop overflow-x-hidden">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}
