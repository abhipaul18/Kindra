import React from 'react';
import type { UserRole } from '../../types/database';
import { Card } from '../ui/Card';

export interface RoleSelectionViewProps {
  onSelectRole: (role: UserRole) => void;
}

export const RoleSelectionView: React.FC<RoleSelectionViewProps> = ({ onSelectRole }) => {
  return (
    <div className="flex flex-col items-center justify-center py-xl px-margin-mobile md:px-margin-desktop min-h-[calc(100vh-4rem)]">
      <div className="text-center max-w-3xl mb-lg">
        <h1 className="text-3xl md:text-5xl font-extrabold text-on-background tracking-tight mb-md">
          Welcome to Kindra. How are you contributing today?
        </h1>
        <p className="text-lg text-on-surface-variant max-w-xl mx-auto">
          Join our community of citizens, department officers, partners, and leaders making a real-world impact.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter w-full max-w-7xl">
        {/* Citizen Role Card */}
        <Card
          hoverable
          onClick={() => onSelectRole('citizen')}
          className="group relative flex flex-col justify-between items-start text-left p-lg min-h-[300px] border border-outline-variant/30 hover:border-primary-container"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary-fixed/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          <div>
            <div className="w-14 h-14 rounded-2xl bg-primary-container text-on-primary flex items-center justify-center mb-md shadow-md group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-3xl">volunteer_activism</span>
            </div>
            <h3 className="text-xl font-bold text-on-surface mb-2 group-hover:text-primary transition-colors">
              Citizen
            </h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Report local issues, track resolution progress, join volunteer tasks, and earn Karma rewards.
            </p>
          </div>
          <div className="flex items-center text-sm font-semibold text-primary gap-1 mt-6 group-hover:translate-x-1 transition-transform">
            <span>Enter Citizen Portal</span>
            <span className="material-symbols-outlined text-lg">arrow_forward</span>
          </div>
        </Card>

        {/* Department Officer Card */}
        <Card
          hoverable
          onClick={() => onSelectRole('officer')}
          className="group relative flex flex-col justify-between items-start text-left p-lg min-h-[300px] border border-outline-variant/30 hover:border-secondary"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-secondary-fixed/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          <div>
            <div className="w-14 h-14 rounded-2xl bg-secondary text-on-secondary flex items-center justify-center mb-md shadow-md group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-3xl">local_police</span>
            </div>
            <h3 className="text-xl font-bold text-on-surface mb-2 group-hover:text-secondary transition-colors">
              Department Officer
            </h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Triage assigned reports, dispatch field crews, update status, and track department SLAs.
            </p>
          </div>
          <div className="flex items-center text-sm font-semibold text-secondary gap-1 mt-6 group-hover:translate-x-1 transition-transform">
            <span>Enter Officer Console</span>
            <span className="material-symbols-outlined text-lg">arrow_forward</span>
          </div>
        </Card>

        {/* Partner & Sponsor Card */}
        <Card
          hoverable
          onClick={() => onSelectRole('partner')}
          className="group relative flex flex-col justify-between items-start text-left p-lg min-h-[300px] border border-outline-variant/30 hover:border-tertiary-fixed-dim"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-tertiary-fixed/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          <div>
            <div className="w-14 h-14 rounded-2xl bg-tertiary-container text-on-tertiary flex items-center justify-center mb-md shadow-md group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-3xl">handshake</span>
            </div>
            <h3 className="text-xl font-bold text-on-surface mb-2 group-hover:text-tertiary transition-colors">
              Community Partner
            </h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Sponsor civic campaigns, offer Karma perk rewards, and view measurable social ROI reports.
            </p>
          </div>
          <div className="flex items-center text-sm font-semibold text-tertiary gap-1 mt-6 group-hover:translate-x-1 transition-transform">
            <span>Enter Partner Portal</span>
            <span className="material-symbols-outlined text-lg">arrow_forward</span>
          </div>
        </Card>

        {/* Administrator Card */}
        <Card
          hoverable
          onClick={() => onSelectRole('admin')}
          className="group relative flex flex-col justify-between items-start text-left p-lg min-h-[300px] border border-outline-variant/30 hover:border-outline"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-surface-container-high to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          <div>
            <div className="w-14 h-14 rounded-2xl bg-inverse-surface text-inverse-on-surface flex items-center justify-center mb-md shadow-md group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-3xl">admin_panel_settings</span>
            </div>
            <h3 className="text-xl font-bold text-on-surface mb-2 group-hover:text-inverse-surface transition-colors">
              Administrator
            </h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Manage city departments, review partner applications, oversee revenue, and track city analytics.
            </p>
          </div>
          <div className="flex items-center text-sm font-semibold text-on-surface gap-1 mt-6 group-hover:translate-x-1 transition-transform">
            <span>Enter Admin Portal</span>
            <span className="material-symbols-outlined text-lg">arrow_forward</span>
          </div>
        </Card>
      </div>
    </div>
  );
};
