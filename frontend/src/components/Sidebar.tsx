import React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  HelpCircle, 
  Settings as SettingsIcon,
  X
} from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function Sidebar({ currentPage, setCurrentPage, isOpen, setIsOpen }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', num: '01', icon: LayoutDashboard },
    { id: 'notices', label: 'My Notices', num: '02', icon: FileText },
    { id: 'how-it-works', label: 'How It Works', num: '03', icon: HelpCircle },
  ];

  const handleNav = (pageId: string) => {
    setCurrentPage(pageId);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-neutral/15 bg-ink text-paper transition-transform duration-300 ease-in-out lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-0 lg:translate-x-0'}
        ${!isOpen && 'max-lg:-translate-x-full'}
      `}>
        {/* Header/Logo */}
        <div className="flex h-20 items-center justify-between border-b border-neutral/15 px-6">
          <button
            onClick={() => handleNav('landing')}
            className="flex items-center gap-3 text-left group cursor-pointer"
            title="Return to Landing Page"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-paper text-ink font-black text-sm tracking-tighter group-hover:bg-accent group-hover:text-white transition-colors duration-300">
              N2A
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-[0.2em] uppercase text-paper group-hover:text-accent transition-colors">
                Notice2Action
              </span>
              <span className="text-[10px] font-mono text-neutral tracking-wider uppercase">
                Doc Intelligence
              </span>
            </div>
          </button>
          
          <button 
            onClick={() => setIsOpen(false)} 
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-dark-gray text-neutral hover:text-paper cursor-pointer lg:hidden transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Section Label */}
        <div className="px-6 pt-6 pb-2">
          <p className="text-[10px] font-mono text-neutral/60 tracking-widest uppercase">
            Workstation
          </p>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 space-y-1 px-3 py-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id || (item.id === 'notices' && currentPage.startsWith('notices/'));
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`
                  flex w-full items-center justify-between rounded-lg px-3.5 py-3 text-xs font-mono uppercase tracking-wider transition-all duration-200 cursor-pointer
                  ${isActive 
                    ? 'bg-dark-gray text-paper border border-neutral/25 shadow-sm' 
                    : 'text-neutral hover:bg-dark-gray/50 hover:text-paper'}
                `}
              >
                <div className="flex items-center gap-3">
                  <Icon size={16} className={isActive ? 'text-accent' : 'text-neutral/70'} />
                  <span>{item.label}</span>
                </div>
                <span className="text-[10px] text-neutral/40 font-mono tabular-nums">
                  {item.num}
                </span>
              </button>
            );
          })}
        </nav>

        {/* System Status / Engine Badge */}
        <div className="px-4 py-3 mx-3 mb-3 rounded-lg border border-neutral/10 bg-dark-gray/50">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-mono text-neutral tracking-wider uppercase">AI ENGINE</span>
            <span className="flex items-center gap-1 text-[10px] font-mono text-accent">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              ONLINE
            </span>
          </div>
          <p className="text-[11px] font-mono text-paper/80 truncate">GPT-4o-mini Pipeline</p>
        </div>

        {/* Bottom Settings */}
        <div className="border-t border-neutral/15 p-3">
          <button
            onClick={() => handleNav('settings')}
            className={`
              flex w-full items-center justify-between rounded-lg px-3.5 py-3 text-xs font-mono uppercase tracking-wider transition-all duration-200 cursor-pointer
              ${currentPage === 'settings' 
                ? 'bg-dark-gray text-paper border border-neutral/25' 
                : 'text-neutral hover:bg-dark-gray/50 hover:text-paper'}
            `}
          >
            <div className="flex items-center gap-3">
              <SettingsIcon size={16} className={currentPage === 'settings' ? 'text-accent' : 'text-neutral/70'} />
              <span>Settings</span>
            </div>
            <span className="text-[10px] text-neutral/40 font-mono tabular-nums">04</span>
          </button>
        </div>
      </aside>
    </>
  );
}
