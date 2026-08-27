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
  Wifi,
  WifiOff,
  Sun,
  Moon,
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
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
        enabled ? 'bg-indigo-600' : 'bg-slate-200'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          enabled ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

function Toast({ message, type }: { message: string; type: 'success' | 'error' | 'info' }) {
  const styles = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    error: 'bg-rose-50 border-rose-200 text-rose-800',
    info: 'bg-indigo-50 border-indigo-200 text-indigo-800',
  };
  const icons = {
    success: <CheckCircle2 size={14} />,
    error: <AlertCircle size={14} />,
    info: <Info size={14} />,
  };
  return (
    <div className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold ${styles[type]}`}>
      {icons[type]}
      {message}
    </div>
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
  const [pushPermission, setPushPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [clearConfirm, setClearConfirm] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    setNoticeCount(getSavedNotices().length);
    if ('Notification' in window) {
      setPushPermission(Notification.permission);
    } else {
      setPushPermission('unsupported');
    }
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

  const handleDarkMode = () => {
    onToggleDarkMode();
    showToast(darkMode ? 'Switched to Light Mode' : 'Switched to Dark Mode', 'info');
    persist({ darkMode: !darkMode });
  };

  const handlePushToggle = async () => {
    if (!pushEnabled) {
      if (!('Notification' in window)) {
        showToast('This browser does not support push notifications.', 'error');
        return;
      }
      if (Notification.permission === 'denied') {
        showToast('Notifications are blocked. Please allow them in browser settings.', 'error');
        return;
      }
      if (Notification.permission !== 'granted') {
        const permission = await Notification.requestPermission();
        setPushPermission(permission);
        if (permission !== 'granted') {
          showToast('Notification permission was not granted.', 'error');
          return;
        }
      }
      new Notification('Notice2Action', {
        body: 'Push notifications are now enabled! 🎉',
        icon: '/favicon.svg',
      });
      showToast('Push notifications enabled!', 'success');
    } else {
      showToast('Push notifications disabled.', 'info');
    }
    const next = !pushEnabled;
    setPushEnabled(next);
    persist({ pushEnabled: next });
  };

  const handleEmailToggle = () => {
    const next = !emailEnabled;
    setEmailEnabled(next);
    persist({ emailEnabled: next });
    showToast(
      next ? 'Email digest reminders enabled.' : 'Email digest reminders disabled.',
      next ? 'success' : 'info'
    );
  };

  const handleClearNotices = () => {
    if (!clearConfirm) { setClearConfirm(true); return; }
    try {
      const notices = getSavedNotices();
      notices.forEach((n) => deleteNotice(n.id));
      setNoticeCount(0);
      setClearConfirm(false);
      showToast('All saved notices have been cleared.', 'success');
    } catch {
      showToast('Failed to clear notices.', 'error');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-6 mb-8 text-left flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <SettingsIcon size={22} className="text-slate-600" />
            Settings
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Configure Notice2Action preferences and credentials.
          </p>
        </div>
        {toast && (
          <div className="mt-1">
            <Toast message={toast.message} type={toast.type} />
          </div>
        )}
      </div>

      <div className="space-y-6 max-w-2xl text-left">

        {/* ── Appearance ── */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2.5 mb-5">
            <Monitor size={18} className="text-slate-500" />
            Appearance
          </h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                {darkMode ? <Moon size={18} /> : <Sun size={18} />}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-800">
                  {darkMode ? 'Dark Mode' : 'Light Mode'}
                </span>
                <span className="text-xs text-slate-500 mt-0.5">
                  {darkMode ? 'Currently using dark colour scheme' : 'Currently using light colour scheme'}
                </span>
              </div>
            </div>
            <Toggle enabled={darkMode} onToggle={handleDarkMode} />
          </div>
        </div>

        {/* ── Notifications ── */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
          <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Bell size={18} className="text-slate-500" />
            Notifications
          </h3>

          {/* Push */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Bell size={18} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-800">Browser Push Notifications</span>
                <span className="text-xs text-slate-500 mt-0.5">
                  {pushPermission === 'granted'
                    ? '✅ Permission granted'
                    : pushPermission === 'denied'
                    ? '🚫 Blocked — allow in browser settings'
                    : pushPermission === 'unsupported'
                    ? '⚠️ Not supported in this browser'
                    : 'Will ask for permission when enabled'}
                </span>
              </div>
            </div>
            <Toggle enabled={pushEnabled} onToggle={handlePushToggle} />
          </div>

          {/* Email */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-600">
                <Bell size={18} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-800">Email Digest Reminders</span>
                <span className="text-xs text-slate-500 mt-0.5">Weekly summary of incomplete action checklist items</span>
              </div>
            </div>
            <Toggle enabled={emailEnabled} onToggle={handleEmailToggle} />
          </div>
        </div>

        {/* ── Data & Storage ── */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Database size={18} className="text-slate-500" />
            Data & Storage
          </h3>

          <div className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-100 px-4 py-3">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-800">Saved Notices</span>
              <span className="text-xs text-slate-500 mt-0.5">Stored in browser localStorage</span>
            </div>
            <span className="text-sm font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">
              {noticeCount} notice{noticeCount !== 1 ? 's' : ''}
            </span>
          </div>

          {noticeCount > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-800">Clear All Notices</span>
                <span className="text-xs text-slate-500 mt-0.5">
                  {clearConfirm
                    ? '⚠️ Click again to confirm — this cannot be undone'
                    : 'Permanently delete all saved notice history'}
                </span>
              </div>
              <button
                onClick={handleClearNotices}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-colors ${
                  clearConfirm
                    ? 'bg-rose-600 text-white hover:bg-rose-700'
                    : 'border border-rose-200 text-rose-600 hover:bg-rose-50'
                }`}
              >
                <Trash2 size={13} />
                {clearConfirm ? 'Confirm Delete' : 'Clear All'}
              </button>
            </div>
          )}
        </div>

        {/* ── About ── */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2.5 mb-4">
            <Info size={18} className="text-slate-500" />
            About Notice2Action
          </h3>
          <div className="text-sm text-slate-600 divide-y divide-slate-100">
            <div className="flex items-center justify-between py-3 first:pt-0">
              <span className="font-semibold text-slate-700">Version</span>
              <span className="font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full text-xs">
                v1.0.0
              </span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="font-semibold text-slate-700">Signed in as</span>
              <span className="text-slate-800 font-medium">{user?.name ?? '—'}</span>
            </div>
            <div className="flex items-center justify-between py-3 last:pb-0">
              <span className="font-semibold text-slate-700">Account Email</span>
              <span className="text-slate-800 font-medium">{user?.email ?? '—'}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
