'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import type { UserRole } from '@/src/types/database';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';

export interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-md">
        <div className="flex flex-col items-center gap-md text-center">
          <span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
          <span className="font-semibold text-on-surface text-base">Authenticating session...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-md">
        <Card className="max-w-md w-full text-center p-lg gap-md border-primary-container/30">
          <div className="w-14 h-14 rounded-2xl bg-primary-container/10 text-primary-container flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-3xl">lock</span>
          </div>
          <h2 className="text-2xl font-bold text-on-surface">Authentication Required</h2>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Please log in to access your authorized portal and community civic features.
          </p>
          <Button
            variant="primary"
            icon="login"
            onClick={() => (window.location.href = '/auth/login')}
            className="w-full font-bold"
          >
            Go to Login
          </Button>
        </Card>
      </div>
    );
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-md">
        <Card className="max-w-md w-full text-center p-lg gap-md border-error/30">
          <div className="w-14 h-14 rounded-2xl bg-error-container text-on-error-container flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-3xl">block</span>
          </div>
          <h2 className="text-2xl font-bold text-on-surface">Access Denied</h2>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Your account role (<span className="font-bold uppercase text-primary">{role}</span>) does not have permission to view this portal.
          </p>
          <Button
            variant="outline"
            icon="arrow_back"
            onClick={() => (window.location.href = '/')}
            className="w-full"
          >
            Return to Portal Home
          </Button>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
