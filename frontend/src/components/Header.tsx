import React, { useState } from 'react';
import { Menu, Bell, LogOut, Check, Sparkles } from 'lucide-react';

interface NotificationItem {
  id: string;
  text: string;
  time: string;
  read: boolean;
}

interface HeaderProps {
  onMenuToggle: () => void;
  title?: string;
  subtitle?: string;
  user: { name: string; email: string } | null;
  onLogout: () => void;
  notifications: NotificationItem[];
  onMarkNotificationsRead: () => void;
}

export default function Header({ 
  onMenuToggle, 
  title, 
  subtitle, 
  user, 
  onLogout,
  notifications,
  onMarkNotificationsRead
}: HeaderProps) {
  const [isNotifyOpen, setIsNotifyOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const unreadCount = (notifications || []).filter(n => !n.read).length;

  const handleMarkAllRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMarkNotificationsRead();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <header className="glass-header flex flex-col gap-4 px-6 py-4 lg:h-20 lg:flex-row lg:items-center lg:justify-between lg:py-0">
      <div className="flex items-center gap-4">
        {/* Mobile menu trigger */}
        <button
          onClick={onMenuToggle}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer lg:hidden transition-colors"
        >
          <Menu size={20} />
        </button>

        <div className="flex flex-col text-left">
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white lg:text-2xl">
            {title || 'Turn notices into action.'}
          </h1>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 lg:text-sm">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Top right widgets */}
      <div className="flex items-center justify-end gap-3 max-lg:border-t max-lg:pt-3 lg:border-none lg:pt-0">
        
        {/* Notification Bell with Dropdown */}
        <div className="relative">
          <button 
            onClick={() => { setIsNotifyOpen(!isNotifyOpen); setIsProfileOpen(false); }}
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-indigo-600 ring-2 ring-white animate-pulse" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {isNotifyOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg text-left">
              <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2">
                <span className="text-xs font-bold text-slate-900">Notifications</span>
                {unreadCount > 0 && (
                  <button 
                    onClick={handleMarkAllRead}
                    className="text-[10px] font-bold text-indigo-600 hover:underline flex items-center gap-0.5"
                  >
                    <Check size={10} /> Mark all read
                  </button>
                )}
              </div>
              
              <div className="max-h-60 overflow-y-auto py-1">
                {(notifications || []).length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    No new alerts.
                  </div>
                ) : (
                  (notifications || []).map((item) => (
                    <div 
                      key={item.id} 
                      className={`
                        p-3 rounded-xl hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 flex gap-2.5 items-start
                        ${!item.read ? 'bg-indigo-50/10' : ''}
                      `}
                    >
                      <div className="flex h-6 w-6 items-center justify-center rounded bg-indigo-50 text-indigo-600 shrink-0 mt-0.5">
                        <Sparkles size={12} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-slate-800 leading-snug font-medium">{item.text}</span>
                        <span className="text-[10px] text-slate-400 mt-1">{item.time}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="h-8 w-px bg-slate-200" />
        
        {/* User avatar & profile dropdown */}
        <div className="relative">
          <button 
            onClick={() => { setIsProfileOpen(!isProfileOpen); setIsNotifyOpen(false); }}
            className="flex items-center gap-2.5 hover:bg-slate-50 p-1.5 rounded-xl transition-all"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 font-bold text-white shadow-sm text-sm">
              {user ? getInitials(user.name) : 'JD'}
            </div>
            <div className="hidden flex-col text-left sm:flex">
              <span className="text-xs font-semibold text-slate-850 leading-none">{user ? user.name : 'John Doe'}</span>
              <span className="text-[10px] text-slate-500 mt-0.5 truncate max-w-28">{user ? user.email : 'demo@notice2action.com'}</span>
            </div>
          </button>

          {/* Profile Dropdown */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg text-left">
              <div className="px-3 py-2 border-b border-slate-100 text-xs font-semibold text-slate-400 select-none uppercase tracking-wider">
                My Account
              </div>
              <button
                onClick={onLogout}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50/50 transition-colors"
              >
                <LogOut size={14} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
