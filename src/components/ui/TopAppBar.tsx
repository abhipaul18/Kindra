'use client';

import React, { useState, useEffect } from 'react';
import type { UserRole } from '../../types/database';
import { SearchModal } from './SearchModal';
import { useAuth } from '@/hooks/useAuth';
import { Search, Menu, X, ChevronDown, User, LogOut, ShieldCheck, Sparkles, Trophy } from 'lucide-react';
import { Magnetic } from '@/components/core/magnetic';

import { AnimatedNumber } from '@/components/core/animated-number';
import { getLevelFromKarma } from '@/src/lib/karmaProgression';

export interface TopAppBarProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  karmaPoints?: number;
  unreadNotifications?: number;
  onOpenNotifications?: () => void;
  isLoggedIn?: boolean;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({
  currentRole,
  onRoleChange,
  activeTab = 'landing',
  onTabChange,
  karmaPoints: karmaProp,
  unreadNotifications = 2,
  onOpenNotifications,
  isLoggedIn,
}) => {
  const { profile } = useAuth();
  const karmaPoints = profile?.karma_points ?? karmaProp ?? 0;
  const levelInfo = getLevelFromKarma(karmaPoints);
  const { user, logout } = useAuth() || {};
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const [mounted, setMounted] = useState(false);

  // Determine authentication state (Guest vs Logged In) with hydration safety
  const isAuthenticated = mounted
    ? (isLoggedIn !== undefined
        ? isLoggedIn
        : (user ? true : false))
    : false;

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems: { id: string; label: string; path: string }[] = [];

  const handleNavClick = (tabId: string) => {
    onTabChange?.(tabId);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header
        suppressHydrationWarning
        className={`sticky top-0 z-50 w-full h-[72px] transition-all duration-300 ${
          isScrolled
            ? 'bg-white/85 dark:bg-slate-900/85 backdrop-blur-[20px] border-b border-black/[0.05] dark:border-white/[0.08] shadow-[0_2px_15px_-3px_rgba(0,0,0,0.03)]'
            : 'bg-white/75 dark:bg-slate-900/75 backdrop-blur-[16px] border-b border-black/[0.04] dark:border-white/[0.06]'
        }`}
      >
        <div suppressHydrationWarning className="max-w-[1440px] mx-auto px-6 md:px-10 h-full flex items-center justify-between">
          {/* ============================================================ */}
          {/* LEFT SIDE: Clickable Brand Logo & Text */}
          {/* ============================================================ */}
          <div className="flex items-center gap-8">
            <button
              onClick={() => handleNavClick('landing')}
              className="flex items-center gap-3 cursor-pointer group focus:outline-none"
              title="KINDRA Home"
            >
              <div className="w-9 h-9 rounded-xl bg-primary text-white font-extrabold text-lg flex items-center justify-center shadow-md group-hover:scale-105 group-hover:bg-blue-600 transition-all">
                K
              </div>
              <span className="text-xl font-black text-on-surface tracking-tight font-sans">
                KINDRA
              </span>
            </button>

            {/* ============================================================ */}
            {/* CENTER NAVIGATION (Desktop) */}
            {/* ============================================================ */}
            <nav className="hidden md:flex items-center gap-1.5">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`relative px-3.5 py-1.5 text-xs font-bold transition-all rounded-lg cursor-pointer ${
                      isActive
                        ? 'text-primary bg-primary/10 font-black'
                        : 'text-on-surface-variant/80 hover:text-primary hover:bg-surface-container-low'
                    }`}
                  >
                    {item.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-primary rounded-full" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* ============================================================ */}
          {/* RIGHT SIDE: Search, Auth Controls, Karma & Profile */}
          {/* ============================================================ */}
          <div className="flex items-center gap-3">
            {/* Search Icon Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 rounded-xl text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors cursor-pointer"
              title="Search missions & tasks (Ctrl+K)"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {!isAuthenticated ? (
              /* ================= GUEST STATE ================= */
              <div className="flex items-center gap-2.5">
                <Magnetic>
                  <a
                    href="/login"
                    onClick={(e) => {
                      e.preventDefault();
                      if (onTabChange) onTabChange('login');
                      else window.location.href = '/login';
                    }}
                    className="inline-flex items-center justify-center bg-primary text-white rounded-xl px-5 py-2 text-xs font-bold shadow-md hover:bg-blue-600 hover:-translate-y-[2px] hover:shadow-[0_4px_20px_rgba(0,82,204,0.3)] transition-all cursor-pointer whitespace-nowrap"
                  >
                    Sign In
                  </a>
                </Magnetic>
              </div>
            ) : (
              /* ================= LOGGED IN STATE ================= */
              <div className="flex items-center gap-3">
                {/* Karma Badge (Only shown after authentication) */}
                <button
                  onClick={() => handleNavClick('redeem_rewards')}
                  className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm hover:scale-105 transition-transform cursor-pointer"
                  title="View Karma Points & Rewards"
                >
                  <Trophy className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="inline-flex items-center gap-1">
                    <AnimatedNumber
                      value={karmaPoints}
                      springOptions={{
                        bounce: 0,
                        duration: 2000,
                      }}
                    />
                    <span>Karma</span>
                  </span>
                </button>

                {/* Notifications Button (Only shown after authentication) */}
                <button
                  onClick={onOpenNotifications}
                  className="relative p-2 rounded-xl text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors cursor-pointer"
                  title="Notifications"
                >
                  <span className="material-symbols-outlined text-xl">notifications</span>
                  {unreadNotifications > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full ring-2 ring-surface" />
                  )}
                </button>

                {/* User Avatar & Dropdown Menu */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="w-9 h-9 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center text-primary font-black text-xs hover:opacity-80 transition-all cursor-pointer shadow-sm"
                    title="Account Profile"
                  >
                    {currentRole.substring(0, 1).toUpperCase()}
                  </button>

                  {/* Profile Dropdown Menu */}
                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
                      <div className="px-3 py-2 border-b border-outline-variant/20 mb-1">
                        <p className="text-xs font-bold text-on-surface">Level {levelInfo.level} {levelInfo.title}</p>
                        <p className="text-[10px] text-on-surface-variant font-medium uppercase tracking-wider">
                          Role: {currentRole}
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          handleNavClick('credentials');
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full px-3 py-2 text-xs font-semibold text-on-surface-variant hover:text-primary hover:bg-primary-container/10 rounded-xl flex items-center gap-2 transition-colors cursor-pointer text-left"
                      >
                        <User className="w-4 h-4 text-primary" />
                        My Credentials
                      </button>

                      <button
                        onClick={() => {
                          handleNavClick('role_selection');
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full px-3 py-2 text-xs font-semibold text-on-surface-variant hover:text-primary hover:bg-primary-container/10 rounded-xl flex items-center gap-2 transition-colors cursor-pointer text-left"
                      >
                        <ShieldCheck className="w-4 h-4 text-amber-500" />
                        Switch Role Portal
                      </button>

                      <div className="my-1 border-t border-outline-variant/20" />

                      <button
                        onClick={async () => {
                          if (logout) await logout();
                          onTabChange?.('landing');
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full px-3 py-2 text-xs font-bold text-error hover:bg-error-container/20 rounded-xl flex items-center gap-2 transition-colors cursor-pointer text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* MOBILE DRAWER NAVIGATION */}
        {/* ============================================================ */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-surface-container-lowest/98 backdrop-blur-2xl border-b border-outline-variant/30 px-6 py-4 flex flex-col gap-3 shadow-xl animate-in fade-in slide-in-from-top-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`text-left text-sm font-bold py-2 px-3 rounded-xl transition-colors ${
                  activeTab === item.id
                    ? 'bg-primary-container/20 text-primary'
                    : 'text-on-surface-variant hover:bg-surface-container-low'
                }`}
              >
                {item.label}
              </button>
            ))}

            {!isAuthenticated && (
              <div className="flex flex-col gap-2 pt-2 border-t border-outline-variant/20">
                <a
                  href="/login"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick('dashboard');
                  }}
                  className="w-full text-center border border-outline-variant/60 rounded-xl py-2.5 text-xs font-bold text-on-surface hover:bg-surface-container-high"
                >
                  Sign In
                </a>
                <a
                  href="/register"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick('dashboard');
                  }}
                  className="w-full text-center bg-primary text-white rounded-xl py-2.5 text-xs font-bold shadow-md hover:bg-blue-600"
                >
                  Get Started
                </a>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Quick Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectAction={(tabId) => handleNavClick(tabId)}
      />
    </>
  );
};
