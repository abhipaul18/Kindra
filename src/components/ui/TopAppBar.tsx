import React from 'react';
import type { UserRole } from '../../types/database';
import { Chip } from './Chip';

export interface TopAppBarProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  karmaPoints?: number;
  unreadNotifications?: number;
  onOpenNotifications?: () => void;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({
  currentRole,
  onRoleChange,
  activeTab = 'dashboard',
  onTabChange,
  karmaPoints = 350,
  unreadNotifications = 2,
  onOpenNotifications,
}) => {
  return (
    <header className="fixed top-0 w-full z-50 flex justify-between items-center px-margin-mobile md:px-margin-desktop h-16 bg-surface-container-lowest border-b border-outline-variant/30 shadow-sm">
      {/* Brand & Main Nav */}
      <div className="flex items-center gap-md">
        <div 
          onClick={() => onTabChange?.('role_selection')}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center text-on-primary font-bold shadow-sm group-hover:scale-105 transition-transform">
            K
          </div>
          <span className="text-xl font-bold text-primary tracking-tight">Kindra</span>
        </div>

        {/* Dynamic Nav Links depending on Role */}
        <nav className="hidden md:flex items-center gap-1 ml-4">
          {currentRole === 'citizen' && (
            <>
              <button
                onClick={() => onTabChange?.('dashboard')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'dashboard'
                    ? 'bg-primary-container/10 text-primary-container font-semibold'
                    : 'text-on-surface-variant hover:bg-surface-container-low'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => onTabChange?.('report_issue')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'report_issue'
                    ? 'bg-primary-container/10 text-primary-container font-semibold'
                    : 'text-on-surface-variant hover:bg-surface-container-low'
                }`}
              >
                Report Issue
              </button>
              <button
                onClick={() => onTabChange?.('volunteer_tasks')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'volunteer_tasks'
                    ? 'bg-primary-container/10 text-primary-container font-semibold'
                    : 'text-on-surface-variant hover:bg-surface-container-low'
                }`}
              >
                Volunteer Tasks
              </button>
              <button
                onClick={() => onTabChange?.('campaigns')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'campaigns'
                    ? 'bg-primary-container/10 text-primary-container font-semibold'
                    : 'text-on-surface-variant hover:bg-surface-container-low'
                }`}
              >
                Campaigns
              </button>
              <button
                onClick={() => onTabChange?.('redeem_rewards')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'redeem_rewards'
                    ? 'bg-primary-container/10 text-primary-container font-semibold'
                    : 'text-on-surface-variant hover:bg-surface-container-low'
                }`}
              >
                Rewards
              </button>
              <button
                onClick={() => onTabChange?.('ask_gemma')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${
                  activeTab === 'ask_gemma'
                    ? 'bg-primary-container/10 text-primary-container font-semibold'
                    : 'text-on-surface-variant hover:bg-surface-container-low'
                }`}
              >
                <span className="material-symbols-outlined text-base text-primary">auto_awesome</span>
                Ask Gemma
              </button>
            </>
          )}

          {currentRole === 'officer' && (
            <>
              <button
                onClick={() => onTabChange?.('officer_dashboard')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'officer_dashboard' ? 'bg-primary-container/10 text-primary-container font-semibold' : 'text-on-surface-variant hover:bg-surface-container-low'
                }`}
              >
                Queue & Dispatch
              </button>
              <button
                onClick={() => onTabChange?.('my_activity')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'my_activity' ? 'bg-primary-container/10 text-primary-container font-semibold' : 'text-on-surface-variant hover:bg-surface-container-low'
                }`}
              >
                Assigned Reports
              </button>
            </>
          )}

          {currentRole === 'partner' && (
            <>
              <button
                onClick={() => onTabChange?.('partner_dashboard')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'partner_dashboard' ? 'bg-primary-container/10 text-primary-container font-semibold' : 'text-on-surface-variant hover:bg-surface-container-low'
                }`}
              >
                Partner Overview
              </button>
              <button
                onClick={() => onTabChange?.('my_campaigns')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'my_campaigns' ? 'bg-primary-container/10 text-primary-container font-semibold' : 'text-on-surface-variant hover:bg-surface-container-low'
                }`}
              >
                My Campaigns
              </button>
              <button
                onClick={() => onTabChange?.('sponsored_rewards')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'sponsored_rewards' ? 'bg-primary-container/10 text-primary-container font-semibold' : 'text-on-surface-variant hover:bg-surface-container-low'
                }`}
              >
                Sponsored Rewards
              </button>
            </>
          )}

          {currentRole === 'admin' && (
            <>
              <button
                onClick={() => onTabChange?.('admin_analytics')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'admin_analytics' ? 'bg-primary-container/10 text-primary-container font-semibold' : 'text-on-surface-variant hover:bg-surface-container-low'
                }`}
              >
                Analytics
              </button>
              <button
                onClick={() => onTabChange?.('manage_departments')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'manage_departments' ? 'bg-primary-container/10 text-primary-container font-semibold' : 'text-on-surface-variant hover:bg-surface-container-low'
                }`}
              >
                Officers & Departments
              </button>
              <button
                onClick={() => onTabChange?.('manage_partners')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'manage_partners' ? 'bg-primary-container/10 text-primary-container font-semibold' : 'text-on-surface-variant hover:bg-surface-container-low'
                }`}
              >
                Partnerships
              </button>
            </>
          )}
        </nav>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-sm">
        {/* Role Selector Dropdown */}
        <select
          value={currentRole}
          onChange={(e) => onRoleChange(e.target.value as UserRole)}
          className="bg-surface-container text-on-surface border border-outline-variant rounded-lg px-2.5 py-1 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary-container cursor-pointer"
        >
          <option value="citizen">Role: Citizen</option>
          <option value="officer">Role: Dept Officer</option>
          <option value="partner">Role: Partner</option>
          <option value="admin">Role: Administrator</option>
        </select>

        {/* Karma Points Badge */}
        {currentRole === 'citizen' && (
          <Chip variant="secondary" icon="workspace_premium" className="hidden sm:inline-flex">
            {karmaPoints} Karma
          </Chip>
        )}

        {/* Notifications Icon Button */}
        <button
          onClick={onOpenNotifications}
          className="relative text-on-surface-variant hover:text-primary p-2 rounded-full hover:bg-surface-container transition-colors"
          title="Notifications"
        >
          <span className="material-symbols-outlined text-2xl">notifications</span>
          {unreadNotifications > 0 && (
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-error rounded-full ring-2 ring-surface-container-lowest" />
          )}
        </button>

        {/* Account Avatar */}
        <button 
          onClick={() => onTabChange?.('credentials')}
          className="text-primary hover:opacity-80 transition-opacity p-1 rounded-full border border-outline-variant/40"
          title="My Profile & Credentials"
        >
          <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed font-bold text-sm">
            {currentRole.substring(0, 1).toUpperCase()}
          </div>
        </button>
      </div>
    </header>
  );
};
