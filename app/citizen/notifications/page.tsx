'use client';

import React from 'react';
import { useCitizenDashboard } from '@/hooks/useCitizenDashboard';
import { useAuth } from '@/hooks/useAuth';
import { markNotificationsAsRead } from '@/services/notificationService';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';

export default function CitizenNotificationsPage() {
  const { notifications } = useCitizenDashboard();
  const { user } = useAuth();

  const handleMarkAllRead = async () => {
    if (user?.id) {
      await markNotificationsAsRead(user.id);
      window.location.reload();
    }
  };

  return (
    <div className="flex flex-col gap-lg pb-xl max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-on-surface">Notifications</h1>
          <p className="text-sm text-on-surface-variant">Stay updated on your civic report status and Karma rewards.</p>
        </div>
        {notifications.length > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
            Mark All as Read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <Card className="p-xl text-center flex flex-col items-center gap-md border-outline-variant/30">
          <span className="material-symbols-outlined text-4xl text-on-surface-variant">notifications_off</span>
          <h3 className="text-base font-bold text-on-surface">No Notifications Yet</h3>
          <p className="text-xs text-on-surface-variant max-w-sm">
            When your reported civic issues are verified by officers or Karma is awarded, updates will appear here.
          </p>
        </Card>
      ) : (
        <div className="flex flex-col gap-sm">
          {notifications.map((item) => (
            <Card
              key={item.id}
              className={`p-md flex items-start gap-md border-outline-variant/30 ${
                !item.is_read ? 'bg-primary-container/10 border-l-4 border-primary' : ''
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-primary-container/20 text-primary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-xl">
                  {item.type === 'success' ? 'check_circle' : 'notifications'}
                </span>
              </div>
              <div className="flex-1 flex flex-col gap-0.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-on-surface">{item.title}</h4>
                  <span suppressHydrationWarning className="text-[11px] text-on-surface-variant">{new Date(item.created_at || Date.now()).toLocaleDateString('en-US')}</span>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">{item.message}</p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
