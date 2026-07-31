'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { AIVerificationCard } from '@/components/reports/AIVerificationCard';

function ReportSubmittedContent() {
  const searchParams = useSearchParams();
  const reportId = searchParams.get('id') || 'rep-94218';

  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] max-w-xl mx-auto p-margin-mobile gap-md">
      <Card className="w-full p-lg flex flex-col items-center text-center gap-md border-primary-container/30 shadow-lg">
        {/* Animated Success Icon */}
        <div className="w-16 h-16 rounded-full bg-secondary-container/30 text-secondary flex items-center justify-center border-2 border-secondary/40 shadow-inner">
          <span className="material-symbols-outlined text-4xl">check_circle</span>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs font-bold uppercase tracking-widest text-secondary">Report Submitted</span>
          <h1 className="text-2xl font-black text-on-surface">Civic Issue Received!</h1>
          <p className="text-xs text-on-surface-variant">Report Reference ID: <span className="font-mono font-bold text-on-surface">{reportId}</span></p>
        </div>

        {/* Live AI Verification Engine Card */}
        <AIVerificationCard reportId={reportId} />

        {/* Action Controls */}
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

export default function ReportSubmittedPage() {
  return (
    <Suspense fallback={<div className="min-h-[75vh] flex items-center justify-center text-on-surface-variant text-sm">Loading report details...</div>}>
      <ReportSubmittedContent />
    </Suspense>
  );
}
