'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';

export default function ReportSubmittedPage() {
  const searchParams = useSearchParams();
  const reportId = searchParams.get('id') || 'rep-94218';

  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] max-w-xl mx-auto p-margin-mobile">
      <Card className="w-full p-lg flex flex-col items-center text-center gap-md border-primary-container/30 shadow-lg">
        {/* Animated Success Icon */}
        <div className="w-20 h-20 rounded-full bg-secondary-container/30 text-secondary flex items-center justify-center border-2 border-secondary/40 shadow-inner">
          <span className="material-symbols-outlined text-5xl animate-bounce">check_circle</span>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs font-bold uppercase tracking-widest text-secondary">Report Received</span>
          <h1 className="text-2xl font-black text-on-surface">Civic Issue Submitted!</h1>
          <p className="text-xs text-on-surface-variant">Report Reference ID: <span className="font-mono font-bold text-on-surface">{reportId}</span></p>
        </div>

        {/* Status Badge */}
        <div className="bg-primary-container/20 border border-primary/30 text-primary px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2">
          <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
          <span>Status: Pending AI Verification</span>
        </div>

        {/* Info Box */}
        <div className="bg-surface-container-high/60 p-md rounded-2xl border border-outline-variant/30 text-left w-full flex flex-col gap-sm text-xs">
          <div className="flex justify-between items-center pb-2 border-b border-outline-variant/30">
            <span className="text-on-surface-variant font-semibold">Initial Department:</span>
            <span className="font-bold text-on-surface">Roads & Infrastructure</span>
          </div>
          <div className="flex justify-between items-center pb-2 border-b border-outline-variant/30">
            <span className="text-on-surface-variant font-semibold">Karma Earned:</span>
            <span className="font-extrabold text-secondary">+50 Points</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-on-surface-variant font-semibold">Next Step:</span>
            <span className="font-bold text-primary">OpenRouter Gemma AI Processing (Phase 5)</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-md w-full pt-2">
          <Button
            variant="primary"
            icon="dashboard"
            onClick={() => (window.location.href = '/citizen/dashboard')}
            className="flex-1 font-bold"
          >
            Go to Dashboard
          </Button>

          <Button
            variant="outline"
            icon="add_a_photo"
            onClick={() => (window.location.href = '/citizen/report')}
            className="flex-1 font-bold"
          >
            Report Another Issue
          </Button>
        </div>
      </Card>
    </div>
  );
}
