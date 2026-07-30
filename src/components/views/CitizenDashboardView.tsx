import React from 'react';
import type { CivicReport, VolunteerTask, Campaign } from '../../types/database';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Chip } from '../ui/Chip';
import { ProgressBar } from '../ui/ProgressBar';

export interface CitizenDashboardViewProps {
  reports: CivicReport[];
  tasks?: VolunteerTask[];
  campaigns: Campaign[];
  karmaPoints: number;
  onNavigate: (tab: string) => void;
}

export const CitizenDashboardView: React.FC<CitizenDashboardViewProps> = ({
  reports,
  campaigns,
  karmaPoints,
  onNavigate,
}) => {
  const statusVariants: Record<string, 'primary' | 'secondary' | 'amber' | 'neutral' | 'error'> = {
    submitted: 'neutral',
    ai_verifying: 'amber',
    needs_info: 'amber',
    approved: 'primary',
    in_progress: 'primary',
    resolved: 'secondary',
    rejected: 'error',
  };

  return (
    <div className="flex flex-col gap-lg py-md px-margin-mobile md:px-margin-desktop max-w-7xl mx-auto w-full">
      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-r from-primary-container via-primary to-surface-tint rounded-2xl p-lg text-on-primary shadow-md relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-md">
        <div className="z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full mb-3 backdrop-blur-sm">
            <span className="material-symbols-outlined text-sm">nature_people</span> Citizen Empowerment
          </span>
          <h1 className="text-2xl md:text-4xl font-bold tracking-tight mb-2">
            Welcome back! You have {karmaPoints} Karma Points.
          </h1>
          <p className="text-primary-fixed-dim text-sm md:text-base leading-relaxed">
            Report civic issues in your area, join volunteer missions, and track city resolution timelines.
          </p>
        </div>

        <div className="z-10 flex flex-wrap gap-sm">
          <Button
            variant="secondary"
            icon="add_circle"
            onClick={() => onNavigate('report_issue')}
            className="shadow-lg font-bold"
          >
            Report an Issue
          </Button>
          <Button
            variant="outline"
            icon="auto_awesome"
            onClick={() => onNavigate('ask_gemma')}
            className="bg-white/10 text-white border-white/30 hover:bg-white/20"
          >
            Ask Gemma AI
          </Button>
        </div>
      </div>

      {/* Quick Access Action Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-sm">
        <Card
          hoverable
          onClick={() => onNavigate('report_issue')}
          className="flex flex-col items-center text-center p-md bg-surface-container-lowest hover:border-primary-container"
        >
          <div className="w-12 h-12 rounded-xl bg-primary-container/10 text-primary-container flex items-center justify-center mb-2">
            <span className="material-symbols-outlined text-2xl">report_problem</span>
          </div>
          <span className="font-bold text-on-surface text-sm">Report Issue</span>
          <span className="text-xs text-on-surface-variant mt-0.5">AI Assisted</span>
        </Card>

        <Card
          hoverable
          onClick={() => onNavigate('volunteer_tasks')}
          className="flex flex-col items-center text-center p-md bg-surface-container-lowest hover:border-secondary"
        >
          <div className="w-12 h-12 rounded-xl bg-secondary-container/30 text-secondary flex items-center justify-center mb-2">
            <span className="material-symbols-outlined text-2xl">handshake</span>
          </div>
          <span className="font-bold text-on-surface text-sm">Volunteer Tasks</span>
          <span className="text-xs text-on-surface-variant mt-0.5">Earn Karma</span>
        </Card>

        <Card
          hoverable
          onClick={() => onNavigate('campaigns')}
          className="flex flex-col items-center text-center p-md bg-surface-container-lowest hover:border-tertiary-fixed-dim"
        >
          <div className="w-12 h-12 rounded-xl bg-tertiary-fixed/40 text-tertiary flex items-center justify-center mb-2">
            <span className="material-symbols-outlined text-2xl">campaign</span>
          </div>
          <span className="font-bold text-on-surface text-sm">Civic Campaigns</span>
          <span className="text-xs text-on-surface-variant mt-0.5">Community Funding</span>
        </Card>

        <Card
          hoverable
          onClick={() => onNavigate('redeem_rewards')}
          className="flex flex-col items-center text-center p-md bg-surface-container-lowest hover:border-primary"
        >
          <div className="w-12 h-12 rounded-xl bg-primary-fixed text-on-primary-fixed-variant flex items-center justify-center mb-2">
            <span className="material-symbols-outlined text-2xl">redeem</span>
          </div>
          <span className="font-bold text-on-surface text-sm">Redeem Rewards</span>
          <span className="text-xs text-on-surface-variant mt-0.5">Local Discounts</span>
        </Card>
      </div>

      {/* Main Content Layout: Active Reports & Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        {/* Left Column: Active Reports */}
        <div className="lg:col-span-2 flex flex-col gap-md">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">my_location</span>
              Recent Civic Reports Nearby
            </h2>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('report_issue')}>
              View All
            </Button>
          </div>

          <div className="flex flex-col gap-md">
            {reports.map((report) => (
              <Card key={report.id} hoverable accentBorder="blue" className="gap-sm">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-sm">
                  <div className="flex items-center gap-2">
                    <Chip variant={statusVariants[report.status] || 'neutral'}>
                      {report.status.replace('_', ' ').toUpperCase()}
                    </Chip>
                    <span className="text-xs text-on-surface-variant font-medium">
                      {report.category || 'General'}
                    </span>
                  </div>
                  <span suppressHydrationWarning className="text-xs text-outline flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">schedule</span>
                    {new Date(report.created_at || Date.now()).toLocaleDateString('en-US')}
                  </span>
                </div>

                <div className="flex flex-col md:flex-row gap-md items-start">
                  {report.image_url && (
                    <img
                      src={report.image_url}
                      alt={report.title}
                      className="w-full md:w-32 h-24 object-cover rounded-lg border border-outline-variant/30 flex-shrink-0"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-bold text-on-surface text-base mb-1 hover:text-primary transition-colors">
                      {report.title}
                    </h3>
                    <p className="text-sm text-on-surface-variant line-clamp-2 mb-2">
                      {report.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-outline font-medium">
                      <span className="material-symbols-outlined text-sm text-error">location_on</span>
                      {report.location_name}
                    </div>
                  </div>
                </div>

                {report.ai_analysis && (
                  <div className="bg-surface-container-low p-2.5 rounded-lg text-xs text-on-surface-variant flex items-start gap-2 border border-outline-variant/20">
                    <span className="material-symbols-outlined text-base text-primary">auto_awesome</span>
                    <div>
                      <span className="font-semibold text-primary">AI Verification: </span>
                      {report.ai_analysis.summary}
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>

        {/* Right Column: Featured Campaigns & Tasks */}
        <div className="flex flex-col gap-md">
          <h2 className="text-xl font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">trending_up</span>
            Active Campaigns
          </h2>

          {campaigns.slice(0, 2).map((camp) => {
            const current = camp.current_amount ?? 0;
            return (
              <Card key={camp.id} className="gap-sm">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold text-secondary uppercase tracking-wider">
                    {camp.category || 'Campaign'}
                  </span>
                  <span className="text-xs text-outline">{camp.partner_name}</span>
                </div>
                <h4 className="font-bold text-on-surface text-base">{camp.title}</h4>
                <p className="text-xs text-on-surface-variant line-clamp-2">{camp.description}</p>
                
                <ProgressBar
                  value={(current / camp.target_amount) * 100}
                  color="green"
                  label={`$${current.toLocaleString()} raised of $${camp.target_amount.toLocaleString()}`}
                />
                <Button variant="outline" size="sm" className="mt-1 w-full" onClick={() => onNavigate('campaigns')}>
                  Contribute to Campaign
                </Button>
              </Card>
            );
          })}

          {/* Ask Gemma Promo Card */}
          <Card className="bg-gradient-to-br from-primary-fixed/30 to-surface-container border-primary-container/30 gap-sm">
            <div className="flex items-center gap-2 text-primary font-bold text-sm">
              <span className="material-symbols-outlined text-lg">auto_awesome</span>
              Have questions about city services?
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Ask Gemma AI about reporting guidelines, trash pickup schedules, or civic reward options.
            </p>
            <Button
              variant="primary"
              size="sm"
              icon="chat"
              onClick={() => onNavigate('ask_gemma')}
              className="w-full"
            >
              Chat with Gemma
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};
