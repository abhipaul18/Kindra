'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import type { UserRole } from '@/src/types/database';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';

export interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const { user, role, loading, slowAuthWarning, authError, refreshSession, clearAuthError } = useAuth();
  const [showSlowLoader, setShowSlowLoader] = useState(false);

  // If authentication takes longer than 1s, display a subtle top progress bar without blanking the screen
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (loading) {
      timer = setTimeout(() => {
        setShowSlowLoader(true);
      }, 1000);
    } else {
      setShowSlowLoader(false);
    }
    return () => clearTimeout(timer);
  }, [loading]);

  return (
    <>
      {/* 1. Subtle top loading bar if auth takes > 1 second */}
      {loading && showSlowLoader && (
        <div className="fixed top-0 left-0 right-0 z-[100] h-1 bg-gradient-to-r from-primary via-blue-500 to-indigo-600 animate-pulse" />
      )}

      {/* 2. Non-blocking Timeout Banner if auth takes > 10s or returns error */}
      {(authError || slowAuthWarning) && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[110] max-w-lg w-[90%] bg-surface-container-highest border border-amber-500/30 rounded-2xl p-4 shadow-2xl backdrop-blur-md flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-amber-500 text-2xl">warning</span>
            <div>
              <p className="text-xs font-bold text-on-surface">Authentication Notice</p>
              <p className="text-xs text-on-surface-variant leading-tight">
                {authError || 'Authentication is taking longer than expected.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                clearAuthError();
                refreshSession();
              }}
              className="text-xs py-1 px-3"
            >
              Retry
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => (window.location.href = '/')}
              className="text-xs py-1 px-3"
            >
              Home
            </Button>
          </div>
        </div>
      )}

      {/* 3. Render page children content. If user is loaded or on public view, allow access. */}
      {loading ? (
        /* While auth is still loading, render children non-blocking to avoid flash */
        children
      ) : user ? (
        allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role) ? (
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
        ) : (
          children
        )
      ) : allowedRoles && allowedRoles.length > 0 ? (
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
              onClick={() => (window.location.href = '/login')}
              className="w-full font-bold"
            >
              Go to Login
            </Button>
          </Card>
        </div>
      ) : (
        /* Default non-blocking render during background restoration */
        children
      )}
    </>
  );
}
