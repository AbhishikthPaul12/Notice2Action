import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { ActionButton } from '../ui/ActionButton';
import { TechnicalLabel } from '../ui/TechnicalLabel';

const metadataList = [
  'DOCUMENT INTELLIGENCE',
  'PDF / DOCX / TXT',
  'AI ANALYSIS',
  'DEADLINES',
  'ELIGIBILITY',
  'ACTION CHECKLIST',
  'AI Q&A',
];

interface FinalCTAProps {
  onEnterApp?: () => void;
}

export default function FinalCTA({ onEnterApp }: FinalCTAProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer
      ref={containerRef}
      id="analyze"
      data-scene="final-cta"
      className="relative w-full min-h-screen bg-ink overflow-hidden flex flex-col justify-between pt-24 pb-12 px-6 md:px-16 text-paper"
      aria-label="Final Call to Action"
    >
      <div
        className="absolute -right-16 md:-right-24 -bottom-32 select-none pointer-events-none text-neutral/5 font-black leading-none"
        style={{ fontSize: 'clamp(30rem, 60vw, 85vw)' }}
        aria-hidden="true"
      >
        N
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
        <div>
          <TechnicalLabel className="text-accent tracking-[0.25em]">010 / FINALE</TechnicalLabel>
          <p className="text-sm font-mono text-neutral mt-1">AI-POWERED DOCUMENT TRANSFORMATION</p>
        </div>

        <button
          onClick={scrollToTop}
          className="text-technical hover:text-paper transition-colors duration-300 flex items-center gap-2"
          aria-label="Return to top"
        >
          <span>BACK TO BEGINNING ↑</span>
        </button>
      </div>

      <div className="my-16 md:my-24 max-w-5xl relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="text-display text-paper leading-[0.9] font-black uppercase tracking-tighter"
        >
          STOP READING.
          <br />
          <span className="text-accent">START ACTING.</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="text-body-lg text-neutral mt-8 max-w-xl font-light"
        >
          Turn every complicated circular, scholarship notice, and policy document into a clear, prioritized checklist.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="flex flex-wrap items-center gap-4 md:gap-6 mt-10"
        >
          <ActionButton
            onClick={onEnterApp}
            variant="primary"
            className="shadow-2xl shadow-accent/20"
          >
            Analyze a Notice ↗
          </ActionButton>

          <ActionButton
            onClick={scrollToTop}
            variant="secondary"
          >
            See How It Works
          </ActionButton>
        </motion.div>
      </div>

      <div className="border-t border-neutral/15 pt-8 relative z-10 flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
        <div>
          <p className="font-mono text-xs font-bold tracking-[0.25em] text-paper uppercase">
            NOTICE2ACTION
          </p>
          <p className="text-technical text-neutral/70 mt-1">
            Engineered for high-stakes circulars & announcements
          </p>
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-2 max-w-xl">
          {metadataList.map((item, i) => (
            <span key={i} className="text-technical text-neutral/50">
              • {item}
            </span>
          ))}
        </div>

        <div className="text-right">
          <span className="text-technical text-neutral/40">
            © 2026 NOTICE2ACTION. ALL RIGHTS RESERVED.
          </span>
        </div>
      </div>
    </footer>
  );
}
