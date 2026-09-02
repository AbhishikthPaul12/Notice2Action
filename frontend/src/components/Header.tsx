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
  onMarkNotificationsRead,
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
    <header className="sticky top-0 z-30 flex flex-col gap-4 px-6 py-4 lg:h-20 lg:flex-row lg:items-center lg:justify-between lg:py-0 bg-ink/90 backdrop-blur-md border-b border-neutral/15 text-paper">
      <div className="flex items-center gap-4">
        {/* Mobile menu trigger */}
        <button
          onClick={onMenuToggle}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral/20 text-neutral hover:bg-dark-gray hover:text-paper cursor-pointer lg:hidden transition-colors"
        >
          <Menu size={18} />
        </button>

        <div className="flex flex-col text-left">
          <h1 className="text-lg font-bold tracking-tight text-paper lg:text-xl uppercase font-mono">
            {title || 'Turn notices into action.'}
          </h1>
          {subtitle && (
            <p className="text-xs font-mono text-neutral/80 tracking-wide mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Top right widgets */}
      <div className="flex items-center justify-end gap-3 max-lg:border-t max-lg:border-neutral/15 max-lg:pt-3 lg:border-none lg:pt-0">
        {/* Notification Bell */}
        <div className="relative">
          <button 
            onClick={() => { setIsNotifyOpen(!isNotifyOpen); setIsProfileOpen(false); }}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-neutral/20 bg-dark-gray/60 text-neutral hover:text-paper hover:border-neutral/40 transition-colors"
            aria-label="Notifications"
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-accent ring-2 ring-ink animate-pulse" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {isNotifyOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-neutral/20 bg-ink p-2 shadow-2xl text-left z-50">
              <div className="flex items-center justify-between border-b border-neutral/15 px-3 py-2">
                <span className="text-xs font-mono font-bold tracking-wider uppercase text-paper">Notifications</span>
                {unreadCount > 0 && (
                  <button 
                    onClick={handleMarkAllRead}
                    className="text-[10px] font-mono text-accent hover:underline flex items-center gap-0.5 uppercase tracking-wider"
                  >
                    <Check size={10} /> Mark all read
                  </button>
                )}
              </div>
              
              <div className="max-h-60 overflow-y-auto py-1">
                {(notifications || []).length === 0 ? (
                  <div className="py-8 text-center text-xs font-mono text-neutral/50">
                    No new alerts.
                  </div>
                ) : (
                  (notifications || []).map((item) => (
                    <div 
                      key={item.id} 
                      className={`
                        p-3 rounded-lg hover:bg-dark-gray transition-colors border-b border-neutral/10 last:border-0 flex gap-2.5 items-start
                        ${!item.read ? 'bg-dark-gray/80 border-l-2 border-l-accent' : ''}
                      `}
                    >
                      <div className="flex h-5 w-5 items-center justify-center rounded bg-dark-gray text-accent shrink-0 mt-0.5">
                        <Sparkles size={11} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-paper leading-snug">{item.text}</span>
                        <span className="text-[10px] font-mono text-neutral/60 mt-1">{item.time}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="h-6 w-px bg-neutral/20" />
        
        {/* User Profile */}
        <div className="relative">
          <button 
            onClick={() => { setIsProfileOpen(!isProfileOpen); setIsNotifyOpen(false); }}
            className="flex items-center gap-2.5 hover:bg-dark-gray p-1.5 rounded-lg border border-neutral/15 bg-dark-gray/30 transition-all cursor-pointer"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded bg-paper text-ink font-mono font-bold text-xs">
              {user ? getInitials(user.name) : 'JD'}
            </div>
            <div className="hidden flex-col text-left sm:flex pr-1">
              <span className="text-xs font-mono font-semibold text-paper leading-none">{user ? user.name : 'John Doe'}</span>
              <span className="text-[10px] font-mono text-neutral/70 mt-0.5 truncate max-w-28">{user ? user.email : 'demo@notice2action.com'}</span>
            </div>
          </button>

          {/* Profile Dropdown */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl border border-neutral/20 bg-ink p-1.5 shadow-2xl text-left z-50">
              <div className="px-3 py-2 border-b border-neutral/15 text-[10px] font-mono text-neutral/60 select-none uppercase tracking-widest">
                Account Active
              </div>
              <button
                onClick={onLogout}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-mono uppercase tracking-wider text-rose-400 hover:bg-dark-gray transition-colors mt-1"
              >
                <LogOut size={13} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
