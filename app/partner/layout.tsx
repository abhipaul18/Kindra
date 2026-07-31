'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { useAuth } from '@/hooks/useAuth';

import { M3NavigationDrawer } from '@/components/ui/M3NavigationDrawer';

export default function PartnerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { profile, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard', path: '/partner/dashboard', icon: 'dashboard' },
    { label: 'Manage Rewards', path: '/partner/rewards', icon: 'redeem' },
    { label: 'Campaigns', path: '/partner/campaigns', icon: 'campaign' },
  ];

  return (
    <AuthGuard allowedRoles={['partner', 'admin']}>
      <div className="min-h-screen bg-background flex flex-col font-sans">
        <header className="bg-surface border-b border-outline-variant/30 sticky top-0 z-40 px-margin-mobile md:px-margin-desktop h-16 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-md">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-on-surface p-1 rounded-lg hover:bg-surface-container-high transition-colors"
            >
              <span className="material-symbols-outlined text-2xl">menu</span>
            </button>
            <a href="/partner/dashboard" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-primary-container text-on-primary font-black text-xl flex items-center justify-center shadow-sm">
                K
              </div>
              <span className="font-extrabold text-xl tracking-tight text-on-surface">KINDRA</span>
              <span className="text-xs bg-amber-500/10 text-amber-600 border border-amber-500/30 px-2 py-0.5 rounded-full font-semibold">
                Partner Portal
              </span>
            </a>
          </div>

          <div className="flex items-center gap-md">
            <div className="flex items-center gap-2 pl-2">
              <div className="w-9 h-9 rounded-full bg-amber-500/10 text-amber-600 font-bold flex items-center justify-center border border-amber-500/20">
                {(profile?.full_name || 'P')[0].toUpperCase()}
              </div>
              <span className="hidden md:inline text-sm font-semibold text-on-surface">{profile?.full_name}</span>
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

        <div className="flex-1 flex w-full">
          <aside className="hidden md:flex flex-col w-64 border-r border-outline-variant/20 p-3 bg-surface-container-low/40 shrink-0 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
            <M3NavigationDrawer navItems={navItems} currentPath={pathname} accentColor="amber" />
          </aside>

          {isMobileMenuOpen && (
            <div className="fixed inset-0 z-50 bg-on-surface/40 md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
              <div className="w-4/5 max-w-xs h-full bg-surface p-4 flex flex-col gap-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30 px-2">
                  <span className="font-bold text-lg text-on-surface">Partner Menu</span>
                  <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 rounded-lg">
                    <span className="material-symbols-outlined text-xl">close</span>
                  </button>
                </div>
                <M3NavigationDrawer navItems={navItems} currentPath={pathname} accentColor="amber" onItemClick={() => setIsMobileMenuOpen(false)} />
              </div>
            </div>
          )}

          <main className="flex-1 p-margin-mobile md:p-margin-desktop overflow-x-hidden max-w-6xl mx-auto w-full">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}
