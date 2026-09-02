import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Bell,
  Monitor,
  Info,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Database,
  Cpu
} from 'lucide-react';
import { getSavedNotices, deleteNotice } from '../services/api';

interface SettingsProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  user: { name: string; email: string } | null;
}

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border border-neutral/30 transition-colors duration-200 ease-in-out ${
        enabled ? 'bg-accent' : 'bg-dark-gray'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-paper shadow transition duration-200 ease-in-out ${
          enabled ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

export default function Settings({ darkMode, onToggleDarkMode, user }: SettingsProps) {
  const PREF_KEY = 'notice2action_settings';

  const loadPrefs = () => {
    try {
      const raw = localStorage.getItem(PREF_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
  };

  const savedPrefs = loadPrefs();
  const [pushEnabled, setPushEnabled] = useState<boolean>(savedPrefs.pushEnabled ?? true);
  const [emailEnabled, setEmailEnabled] = useState<boolean>(savedPrefs.emailEnabled ?? false);
  const [noticeCount, setNoticeCount] = useState(0);
  const [clearConfirm, setClearConfirm] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    setNoticeCount(getSavedNotices().length);
  }, []);

  const persist = (updates: Record<string, unknown>) => {
    try {
      const current = loadPrefs();
      localStorage.setItem(PREF_KEY, JSON.stringify({ ...current, ...updates }));
    } catch { /* ignore */ }
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handlePushToggle = async () => {
    if (!pushEnabled) {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          new Notification('Notice2Action', {
            body: 'Push notifications are enabled.',
            icon: '/favicon.svg',
          });
          showToast('Push notifications enabled.', 'success');
        } else {
          showToast('Notification permission denied.', 'error');
          return;
        }
      }
    } else {
      showToast('Push notifications disabled.', 'info');
    }
    const next = !pushEnabled;
    setPushEnabled(next);
    persist({ pushEnabled: next });
  };

  const handleClearNotices = () => {
    if (!clearConfirm) { setClearConfirm(true); return; }
    try {
      const notices = getSavedNotices();
      notices.forEach((n) => deleteNotice(n.id));
      setNoticeCount(0);
      setClearConfirm(false);
      showToast('All stored notice records cleared.', 'success');
    } catch {
      showToast('Failed to clear notices.', 'error');
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 md:px-8 py-8 text-paper text-left">
      {/* Page Header */}
      <div className="border-b border-neutral/15 pb-6 mb-8 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-mono tracking-[0.2em] text-accent uppercase font-semibold">
              SYSTEM CONFIGURATION
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight text-paper uppercase font-sans">
            SETTINGS & PREFERENCES
          </h2>
          <p className="text-xs font-mono text-neutral/70 mt-1">
            Manage your AI extraction rules, notification channels, and document cache.
          </p>
        </div>
        {toast && (
          <div className="p-3 rounded-lg border border-accent/30 bg-dark-gray text-xs font-mono text-paper">
            {toast.message}
          </div>
        )}
      </div>

      <div className="space-y-6 max-w-2xl">
        {/* Notifications Card */}
        <div className="rounded-xl border border-neutral/20 bg-dark-gray/60 p-6 space-y-6">
          <div className="flex items-center gap-2 border-b border-neutral/15 pb-3">
            <Bell size={16} className="text-accent" />
            <h3 className="text-xs font-mono font-bold text-paper uppercase tracking-wider">
              Alerts & Reminders
            </h3>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-mono font-bold text-paper uppercase">Browser Push Notifications</p>
              <p className="text-[11px] font-mono text-neutral/70 mt-0.5">
                Immediate system alert when notice deadlines approach
              </p>
            </div>
            <Toggle enabled={pushEnabled} onToggle={handlePushToggle} />
          </div>

          <div className="flex items-center justify-between border-t border-neutral/10 pt-4">
            <div>
              <p className="text-xs font-mono font-bold text-paper uppercase">Weekly Digest Email</p>
              <p className="text-[11px] font-mono text-neutral/70 mt-0.5">
                Summary of pending checklists across active circulars
              </p>
            </div>
            <Toggle enabled={emailEnabled} onToggle={() => {
              const next = !emailEnabled;
              setEmailEnabled(next);
              persist({ emailEnabled: next });
            }} />
          </div>
        </div>

        {/* Data & Storage Card */}
        <div className="rounded-xl border border-neutral/20 bg-dark-gray/60 p-6 space-y-6">
          <div className="flex items-center gap-2 border-b border-neutral/15 pb-3">
            <Database size={16} className="text-accent" />
            <h3 className="text-xs font-mono font-bold text-paper uppercase tracking-wider">
              Local Notice Archive Cache
            </h3>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-mono font-bold text-paper uppercase">Stored Notice Documents</p>
              <p className="text-[11px] font-mono text-neutral/70 mt-0.5">
                Indexed in browser offline storage
              </p>
            </div>
            <span className="font-mono text-xs font-bold text-accent bg-accent/10 px-3 py-1 rounded border border-accent/20">
              {noticeCount} RECORD{noticeCount !== 1 ? 'S' : ''}
            </span>
          </div>

          {noticeCount > 0 && (
            <div className="flex items-center justify-between border-t border-neutral/10 pt-4">
              <div>
                <p className="text-xs font-mono font-bold text-rose-400 uppercase">Clear All Stored Notices</p>
                <p className="text-[11px] font-mono text-neutral/60 mt-0.5">
                  Permanently deletes all cached analysis checklists
                </p>
              </div>
              <button
                onClick={handleClearNotices}
                className={`px-3 py-1.5 rounded text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  clearConfirm
                    ? 'bg-rose-600 text-white'
                    : 'border border-rose-800/40 text-rose-400 hover:bg-rose-950/40'
                }`}
              >
                {clearConfirm ? 'Confirm Clear' : 'Clear All'}
              </button>
            </div>
          )}
        </div>

        {/* System Diagnostics */}
        <div className="rounded-xl border border-neutral/20 bg-dark-gray/60 p-6">
          <div className="flex items-center gap-2 border-b border-neutral/15 pb-3 mb-4">
            <Cpu size={16} className="text-accent" />
            <h3 className="text-xs font-mono font-bold text-paper uppercase tracking-wider">
              System Diagnostics
            </h3>
          </div>

          <div className="space-y-3 font-mono text-xs divide-y divide-neutral/10">
            <div className="flex items-center justify-between pt-2 first:pt-0">
              <span className="text-neutral/70">Engine</span>
              <span className="font-bold text-paper">Notice2Action Intelligence Core v1.0</span>
            </div>
            <div className="flex items-center justify-between pt-3">
              <span className="text-neutral/70">Backend Endpoint</span>
              <span className="text-accent">http://127.0.0.1:8000</span>
            </div>
            <div className="flex items-center justify-between pt-3">
              <span className="text-neutral/70">Active Session</span>
              <span className="text-paper">{user?.name || 'Demo User'} ({user?.email || 'demo@notice2action.com'})</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
