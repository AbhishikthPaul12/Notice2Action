import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { id: '01', label: 'How It Works', target: 'hero' },
  { id: '02', label: 'Features', target: 'chaos-to-structure' },
  { id: '03', label: 'Demo', target: 'product-demo' },
];

interface NavigationProps {
  onEnterApp?: () => void;
}

export default function Navigation({ onEnterApp }: NavigationProps) {
  const [activeScene, setActiveScene] = useState('hero');
  const [isVisible, setIsVisible] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const showTimer = setTimeout(() => setIsVisible(true), 1600);

    const handleScroll = () => {
      const sections = document.querySelectorAll('[data-scene]');
      let current = 'hero';
      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= window.innerHeight * 0.5 && rect.bottom > 0) {
          current = section.getAttribute('data-scene') || current;
        }
      });
      setActiveScene(current);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      clearTimeout(showTimer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollTo = (target: string) => {
    const el = document.querySelector(`[data-scene="${target}"]`);
    el?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
      transition={{ duration: 0.5, ease: [0.33, 1, 0.68, 1] }}
      className="fixed top-0 left-0 right-0 z-50 px-6 md:px-10 py-5 flex items-center justify-between"
      style={{
        background: 'linear-gradient(to bottom, rgba(8,8,8,0.85) 0%, transparent 100%)',
        pointerEvents: isVisible ? 'auto' : 'none',
      }}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Logo */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="text-xs font-bold tracking-[0.25em] uppercase text-paper hover:text-accent transition-colors duration-300"
        aria-label="Scroll to top"
      >
        Notice2Action
      </button>

      {/* Desktop nav */}
      <div className="hidden md:flex items-center gap-10">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => scrollTo(item.target)}
            className={`
              text-[0.6875rem] font-mono tracking-widest uppercase transition-colors duration-300
              ${activeScene === item.target ? 'text-paper' : 'text-neutral hover:text-paper'}
            `}
            aria-label={`Navigate to ${item.label}`}
          >
            <span className="text-neutral/50 mr-2">{item.id}</span>
            {item.label}
          </button>
        ))}

        <button
          onClick={onEnterApp}
          className="text-[0.6875rem] font-mono tracking-widest uppercase text-ink bg-paper px-5 py-2.5 hover:bg-accent hover:text-white transition-colors duration-300"
          aria-label="Open Notice2Action App"
        >
          Launch App ↗
        </button>
      </div>

      {/* Mobile menu button */}
      <button
        className="md:hidden flex flex-col gap-1.5 p-2"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={menuOpen}
      >
        <span
          className={`block w-5 h-px bg-paper transition-transform duration-200 ${
            menuOpen ? 'rotate-45 translate-y-2' : ''
          }`}
        />
        <span
          className={`block w-5 h-px bg-paper transition-opacity duration-200 ${
            menuOpen ? 'opacity-0' : ''
          }`}
        />
        <span
          className={`block w-5 h-px bg-paper transition-transform duration-200 ${
            menuOpen ? '-rotate-45 -translate-y-2' : ''
          }`}
        />
      </button>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="absolute top-full left-0 right-0 bg-ink/95 backdrop-blur-md px-6 py-6 flex flex-col gap-4 md:hidden border-t border-dark-gray/50"
          >
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.target)}
                className="text-sm font-mono tracking-widest uppercase text-paper/80 hover:text-paper text-left py-2"
              >
                <span className="text-neutral/50 mr-3">{item.id}</span>
                {item.label}
              </button>
            ))}
            <button
              onClick={() => { setMenuOpen(false); onEnterApp?.(); }}
              className="text-sm font-mono tracking-widest uppercase text-ink bg-paper px-5 py-3 text-center mt-2"
            >
              Launch App ↗
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
