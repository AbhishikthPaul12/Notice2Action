import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Login from './components/Login';
import Dashboard from './pages/Dashboard';
import MyNotices from './pages/MyNotices';
import NoticeDetail from './pages/NoticeDetail';
import HowItWorks from './pages/HowItWorks';
import Settings from './pages/Settings';
import LandingPage from './pages/LandingPage';

interface User {
  name: string;
  email: string;
}

interface NotificationItem {
  id: string;
  text: string;
  time: string;
  read: boolean;
}

// Determine initial page from URL path
const getPageFromPath = (): string => {
  const path = window.location.pathname.replace(/^\/+/, '');
  if (!path || path === '' || path === 'index.html') {
    return 'landing';
  }
  return path;
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPageState] = useState<string>(() => getPageFromPath());
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const prefs = JSON.parse(localStorage.getItem('notice2action_settings') || '{}');
      return prefs.darkMode ?? false;
    } catch { return false; }
  });

  // URL route updater helper
  const setCurrentPage = (page: string) => {
    setCurrentPageState(page);
    const targetPath = page === 'landing' ? '/' : `/${page}`;
    if (window.location.pathname !== targetPath) {
      window.history.pushState({ page }, '', targetPath);
    }
  };

  // Listen to browser Back / Forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPageState(getPageFromPath());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Apply / remove dark class on <html> whenever darkMode changes
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleToggleDarkMode = () => setDarkMode((prev) => !prev);

  // Load auth state and notifications on mount
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('notice2action_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
      
      const savedNotifs = localStorage.getItem('notice2action_notifs');
      if (savedNotifs) {
        setNotifications(JSON.parse(savedNotifs));
      } else {
        const welcomeNotif = {
          id: 'welcome',
          text: 'Welcome to Notice2Action! Try uploading a notice to start.',
          time: 'Just now',
          read: false
        };
        setNotifications([welcomeNotif]);
        localStorage.setItem('notice2action_notifs', JSON.stringify([welcomeNotif]));
      }

      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
    } catch (e) {
      console.error('Failed to load session:', e);
    }
  }, []);

  const handleLogin = (name: string, email: string) => {
    const newUser = { name, email };
    setUser(newUser);
    localStorage.setItem('notice2action_user', JSON.stringify(newUser));
    setCurrentPage('dashboard');
    addNotification(`Signed in successfully as ${name}`);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('notice2action_user');
    setCurrentPage('landing');
  };

  const addNotification = (text: string) => {
    const newNotif: NotificationItem = {
      id: `notif_${Date.now()}`,
      text,
      time: 'Just now',
      read: false
    };
    
    setNotifications((prev) => {
      const updated = [newNotif, ...prev];
      localStorage.setItem('notice2action_notifs', JSON.stringify(updated));
      return updated;
    });

    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Notice2Action Alert', {
        body: text,
        icon: '/favicon.svg'
      });
    }
  };

  const handleMarkNotificationsRead = () => {
    setNotifications((prev) => {
      const updated = prev.map(n => ({ ...n, read: true }));
      localStorage.setItem('notice2action_notifs', JSON.stringify(updated));
      return updated;
    });
  };

  // 1. Landing page view (Whenever at root / or 'landing')
  if (currentPage === 'landing') {
    return (
      <div className="relative min-h-screen bg-ink">
        <LandingPage
          onEnterApp={() => {
            if (user) {
              setCurrentPage('dashboard');
            } else {
              setCurrentPage('login');
            }
          }}
        />
      </div>
    );
  }

  // 2. Sign In / Sign Up view
  if (currentPage === 'login' || (!user && currentPage === 'dashboard')) {
    return (
      <div className="relative min-h-screen bg-ink">
        <div className="absolute top-6 left-6 z-50">
          <button
            onClick={() => setCurrentPage('landing')}
            className="px-4 py-2 rounded-lg bg-dark-gray hover:bg-neutral/20 text-paper font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer border border-neutral/20 backdrop-blur-md"
          >
            ← Back to Landing Page
          </button>
        </div>
        <Login onLogin={handleLogin} />
      </div>
    );
  }

  // 3. Authenticated Workspace Pages (/dashboard, /notices, etc.)
  const renderPage = () => {
    if (currentPage === 'dashboard') {
      return (
        <Dashboard
          setCurrentPage={setCurrentPage}
          onNoticeAnalyzed={(title) => addNotification(`Notice analyzed successfully: "${title}"`)}
        />
      );
    }
    if (currentPage === 'notices') {
      return <MyNotices setCurrentPage={setCurrentPage} />;
    }
    if (currentPage.startsWith('notices/')) {
      const noticeId = currentPage.split('/')[1];
      return <NoticeDetail noticeId={noticeId} setCurrentPage={setCurrentPage} />;
    }
    if (currentPage === 'how-it-works') {
      return <HowItWorks />;
    }
    if (currentPage === 'settings') {
      return <Settings darkMode={darkMode} onToggleDarkMode={handleToggleDarkMode} user={user} />;
    }
    return <Dashboard setCurrentPage={setCurrentPage} />;
  };

  const getHeaderInfo = () => {
    if (currentPage === 'dashboard') {
      return {
        title: 'Turn notices into action.',
        subtitle: 'Upload a notice and instantly discover what matters, what you need to do, and when you need to do it.',
      };
    }
    if (currentPage === 'notices') {
      return {
        title: 'My Saved Notices',
        subtitle: 'Browse and query details of your previously analyzed documents.',
      };
    }
    if (currentPage.startsWith('notices/')) {
      return {
        title: 'Notice Analysis Detail',
        subtitle: 'Review extracted checklist, details and ask questions.',
      };
    }
    if (currentPage === 'how-it-works') {
      return {
        title: 'How Notice2Action Works',
        subtitle: 'Learn how we bridge circular announcements into actionable workflows.',
      };
    }
    if (currentPage === 'settings') {
      return {
        title: 'Settings Preferences',
        subtitle: 'Manage configurations and app statistics.',
      };
    }
    return {
      title: 'Notice2Action',
      subtitle: '',
    };
  };

  const headerInfo = getHeaderInfo();

  return (
    <div className="min-h-screen bg-ink flex text-paper">
      {/* Sidebar navigation */}
      <Sidebar 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage}
        isOpen={isMobileSidebarOpen}
        setIsOpen={setIsMobileSidebarOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen lg:pl-72">
        <Header 
          onMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} 
          title={headerInfo.title}
          subtitle={headerInfo.subtitle}
          user={user}
          onLogout={handleLogout}
          notifications={notifications}
          onMarkNotificationsRead={handleMarkNotificationsRead}
        />
        
        <main className="flex-1 overflow-y-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
