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
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'notices', label: 'My Notices', icon: FileText },
    { id: 'how-it-works', label: 'How It Works', icon: HelpCircle },
  ];

  const handleNav = (pageId: string) => {
    setCurrentPage(pageId);
    setIsOpen(false); // Close mobile sidebar on navigation
  };

  return (
    <>
      {/* Mobile Backdrop overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl transition-transform duration-300 ease-in-out lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-0 lg:translate-x-0'}
        ${!isOpen && 'max-lg:-translate-x-full'}
      `}>
        {/* Header/Logo */}
        <div className="flex h-20 items-center justify-between border-b border-slate-100 dark:border-slate-800/60 px-6">
          <div className="flex flex-col">
            <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
              <img 
                src="/favicon.svg" 
                alt="Notice2Action icon" 
                className="h-8 w-8 rounded-xl shadow-sm"
              />
              Notice2Action
            </span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
              From Notice to Action
            </span>
          </div>
          
          <button 
            onClick={() => setIsOpen(false)} 
            className="flex h-8 w-8 items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-pointer lg:hidden transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 space-y-1.5 px-4 py-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id || (item.id === 'notices' && currentPage.startsWith('notices/'));
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`
                  flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 cursor-pointer
                  ${isActive 
                    ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 shadow-sm border border-indigo-100 dark:border-indigo-800/40' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white'}
                `}
              >
                <Icon size={18} className={isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Bottom Panel */}
        <div className="border-t border-slate-100 dark:border-slate-800/60 p-4">
          <button
            onClick={() => handleNav('settings')}
            className={`
              flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 cursor-pointer
              ${currentPage === 'settings' 
                ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 shadow-sm border border-indigo-100 dark:border-indigo-800/40' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white'}
            `}
          >
            <SettingsIcon size={18} className={currentPage === 'settings' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'} />
            Settings
          </button>
        </div>
      </aside>
    </>
  );
}
