import React from 'react';
import type { CivicReport, Department } from '../../types/database';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Chip } from '../ui/Chip';

export interface OfficerDashboardViewProps {
  reports: CivicReport[];
  departments: Department[];
  onUpdateStatus: (reportId: string, newStatus: CivicReport['status']) => void;
}

export const OfficerDashboardView: React.FC<OfficerDashboardViewProps> = ({
  reports,
  onUpdateStatus,
}) => {
  return (
    <div className="flex flex-col gap-lg py-md px-margin-mobile md:px-margin-desktop max-w-7xl mx-auto w-full">
      {/* Officer Header */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-md">
        <div>
          <span className="text-xs font-semibold text-secondary uppercase tracking-wider">Department Officer Console</span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-on-surface">Roads & Infrastructure Queue</h1>
          <p className="text-sm text-on-surface-variant">Review incoming citizen reports, dispatch repair crews, and update SLA timestamps.</p>
        </div>
        <div className="flex items-center gap-sm">
          <Chip variant="amber" icon="pending_actions">3 Pending Triage</Chip>
          <Chip variant="secondary" icon="check_circle">12 Resolved Today</Chip>
        </div>
      </div>

      {/* Reports Queue Table / Cards */}
      <div className="flex flex-col gap-md">
        <h2 className="text-xl font-bold text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">assignment</span>
          Incoming & Dispatched Reports Queue
        </h2>

        <div className="grid grid-cols-1 gap-md">
          {reports.map((report) => (
            <Card key={report.id} accentBorder={report.priority === 'urgent' ? 'amber' : 'blue'} className="gap-md">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-sm border-b border-outline-variant/20 pb-sm">
                <div className="flex items-center gap-2">
                  <Chip variant={report.priority === 'urgent' ? 'error' : 'primary'}>
                    {report.priority.toUpperCase()} PRIORITY
                  </Chip>
                  <span className="font-bold text-on-surface text-base">{report.title}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-outline font-medium">
                  <span>ID: #{report.id}</span>
                  <span>•</span>
                  <span>{new Date(report.created_at || Date.now()).toLocaleString()}</span>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-md items-start">
                {report.image_url && (
                  <img
                    src={report.image_url}
                    alt={report.title}
                    className="w-full md:w-36 h-28 object-cover rounded-lg border border-outline-variant/30 flex-shrink-0"
                  />
                )}
                <div className="flex-1 flex flex-col gap-1">
                  <p className="text-sm text-on-surface-variant leading-relaxed">{report.description}</p>
                  <div className="flex items-center gap-2 text-xs text-outline font-medium mt-1">
                    <span className="material-symbols-outlined text-sm text-error">location_on</span>
                    {report.location_name}
                  </div>

                  {report.ai_analysis && (
                    <div className="mt-2 bg-surface-container-low p-2 rounded-lg text-xs text-on-surface-variant border border-outline-variant/20">
                      <span className="font-semibold text-primary">AI Category: </span>
                      {report.ai_analysis.suggested_category} | <span className="font-semibold">Summary: </span>
                      {report.ai_analysis.summary}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons for Dispatch */}
              <div className="flex flex-wrap items-center justify-between gap-sm pt-sm border-t border-outline-variant/20">
                <div className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant">
                  <span>Current Status:</span>
                  <Chip variant={report.status === 'resolved' ? 'secondary' : 'primary'}>
                    {report.status.replace('_', ' ').toUpperCase()}
                  </Chip>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onUpdateStatus(report.id, 'needs_info')}
                  >
                    Request Info
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    icon="engineering"
                    onClick={() => onUpdateStatus(report.id, 'in_progress')}
                  >
                    Dispatch Crew
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon="check_circle"
                    onClick={() => onUpdateStatus(report.id, 'resolved')}
                  >
                    Mark Resolved
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
