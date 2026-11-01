import React, { useState } from 'react';
import { AppNotification, TabRoute } from '../types';
import { LaunchGradLogo } from './BrandVisuals';

interface AppShellProps {
  activeTab: TabRoute;
  savedCount: number;
  trackerCount: number;
  notifications: AppNotification[];
  toastMessage: string | null;
  onSelectTab: (tab: TabRoute) => void;
  onSelectNotification: (notif: AppNotification) => void;
  onMarkAllRead: () => void;
  children: React.ReactNode;
}

export function AppShell({
  activeTab,
  savedCount,
  trackerCount,
  notifications,
  toastMessage,
  onSelectTab,
  onSelectNotification,
  onMarkAllRead,
  children,
}: AppShellProps) {
  const [showNotifs, setShowNotifs] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const navItems: { key: TabRoute; label: string; icon: string; count?: number }[] = [
    { key: 'discover', label: 'Discover', icon: 'explore' },
    { key: 'saved', label: 'Saved', icon: 'bookmark', count: savedCount },
    { key: 'tracker', label: 'Tracker', icon: 'assignment_turned_in', count: trackerCount },
    { key: 'profile', label: 'Profile', icon: 'school' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface">
      {/* 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-30 h-14 bg-surface/90 backdrop-blur-md border-b border-outline-variant/25">
        <div className="max-w-6xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between gap-8">
          {/* Zone 1: Brand Wordmark */}
          <button
            type="button"
            onClick={() => onSelectTab('discover')}
            className="flex items-center gap-2.5 font-display font-extrabold text-lg tracking-tight text-on-surface whitespace-nowrap shrink-0"
          >
            <LaunchGradLogo className="w-7 h-7" />
            <span>LaunchGrad</span>
          </button>

          {/* Zone 2: Desktop Single-Line Text Navigation */}
          <nav
            aria-label="Primary"
            className="hidden md:flex items-center gap-7 text-sm font-medium text-on-surface-variant"
          >
            {navItems.map((item) => {
              const active = activeTab === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => onSelectTab(item.key)}
                  className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 tabular-nums ${
                    active
                      ? 'border-primary text-primary font-semibold'
                      : 'border-transparent hover:text-on-surface'
                  }`}
                >
                  {item.label}
                  {typeof item.count === 'number' && item.count > 0 ? ` (${item.count})` : ''}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Single Primary Contextual Action (Inbox / Notifications) */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setShowNotifs((v) => !v)}
              aria-label="Open notifications"
              className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-surface-container-low hover:bg-surface-container text-xs font-semibold text-on-surface flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 tabular-nums"
            >
              <span className="material-symbols-outlined text-[18px] text-primary">
                notifications
              </span>
              <span>Inbox{unreadCount > 0 ? ` (${unreadCount})` : ''}</span>
            </button>

            {showNotifs && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowNotifs(false)}
                />
                <div className="absolute right-0 mt-2 w-80 sm:w-96 z-50 bg-surface-container-lowest rounded-2xl border border-outline-variant/35 shadow-xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-outline-variant/20 flex items-center justify-between">
                    <span className="font-display font-bold text-sm text-on-surface">
                      Recruiter Activity
                    </span>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={onMarkAllRead}
                        className="text-xs font-semibold text-primary hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-outline-variant/20">
                    {notifications.map((n) => (
                      <button
                        key={n.id}
                        type="button"
                        onClick={() => {
                          onSelectNotification(n);
                          setShowNotifs(false);
                        }}
                        className={`w-full text-left p-3.5 hover:bg-surface-container-low transition-colors space-y-1 ${
                          !n.read ? 'bg-primary-fixed/20' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 text-xs">
                          <span className="font-display font-bold text-on-surface truncate">
                            {n.title}
                          </span>
                          <span className="text-outline whitespace-nowrap">{n.timeAgo}</span>
                        </div>
                        <p className="text-xs text-on-surface-variant leading-relaxed">{n.body}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-12">
        {children}
      </main>

      {/* Mobile Fixed Bottom Tab Bar */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-surface-container-lowest/95 backdrop-blur-md border-t border-outline-variant/25 pb-safe"
      >
        <div className="grid grid-cols-4 items-center h-16 px-2">
          {navItems.map((item) => {
            const active = activeTab === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onSelectTab(item.key)}
                aria-current={active ? 'page' : undefined}
                className={`min-h-[48px] flex flex-col items-center justify-center rounded-xl transition-colors ${
                  active ? 'text-primary font-bold' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <div className="relative flex items-center justify-center">
                  <span
                    className={`material-symbols-outlined text-[22px] ${
                      active ? 'material-symbols-filled' : ''
                    }`}
                  >
                    {item.icon}
                  </span>
                  {typeof item.count === 'number' && item.count > 0 && (
                    <span className="ml-1 text-[10px] font-bold tabular-nums text-primary">
                      {item.count}
                    </span>
                  )}
                </div>
                <span className="text-[11px] tracking-tight mt-0.5 whitespace-nowrap">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Toast Feedback Banner */}
      {toastMessage && (
        <div
          role="status"
          className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-inverse-surface text-inverse-on-surface px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg transition-opacity"
        >
          <span className="material-symbols-outlined text-[17px] text-secondary-fixed">
            check_circle
          </span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
