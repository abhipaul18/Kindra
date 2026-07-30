import React from 'react';
import type { Department, CivicReport } from '../../types/database';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Chip } from '../ui/Chip';

export interface AdminDashboardViewProps {
  departments: Department[];
  reports: CivicReport[];
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ departments, reports }) => {
  return (
    <div className="flex flex-col gap-lg py-md px-margin-mobile md:px-margin-desktop max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="bg-inverse-surface text-inverse-on-surface rounded-2xl p-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-md shadow-lg">
        <div>
          <span className="text-xs font-semibold text-primary-fixed-dim uppercase tracking-wider">Municipal Console</span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white">Citywide Civic Operations & Analytics</h1>
          <p className="text-sm text-outline-variant">Monitor department response SLAs, manage partner applications, and analyze category trends.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" icon="download" size="sm">Export Report</Button>
        </div>
      </div>

      {/* Analytics KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
        <Card className="p-md">
          <span className="text-xs font-semibold text-outline">Total Reports Submitted</span>
          <span className="text-3xl font-extrabold text-primary">{reports.length + 142}</span>
          <span className="text-xs text-secondary font-semibold mt-1">94.2% Verified Rate</span>
        </Card>

        <Card className="p-md">
          <span className="text-xs font-semibold text-outline">Average Resolution Time</span>
          <span className="text-3xl font-extrabold text-secondary">1.8 Days</span>
          <span className="text-xs text-secondary font-semibold mt-1">-18% SLA Improvement</span>
        </Card>

        <Card className="p-md">
          <span className="text-xs font-semibold text-outline">Active City Departments</span>
          <span className="text-3xl font-extrabold text-tertiary">{departments.length}</span>
          <span className="text-xs text-outline font-semibold mt-1">63 Active Officers</span>
        </Card>

        <Card className="p-md">
          <span className="text-xs font-semibold text-outline">Karma Points Distributed</span>
          <span className="text-3xl font-extrabold text-primary-container">48,500</span>
          <span className="text-xs text-secondary font-semibold mt-1">High Citizen Engagement</span>
        </Card>
      </div>

      {/* Departments Overview */}
      <div className="flex flex-col gap-md">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">domain</span>
            City Departments SLA Performance
          </h2>
          <Button variant="outline" size="sm" icon="add">Add Department</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          {departments.map((dept) => (
            <Card key={dept.id} className="gap-sm">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-on-surface text-base">{dept.name}</h3>
                <Chip variant="primary">{dept.officer_count} Officers</Chip>
              </div>
              <p className="text-xs text-on-surface-variant">{dept.description}</p>
              <div className="flex justify-between items-center text-xs text-outline pt-2 border-t border-outline-variant/20">
                <span>Avg SLA: 24 Hours</span>
                <span className="text-secondary font-bold">96% On Time</span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
