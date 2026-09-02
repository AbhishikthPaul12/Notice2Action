import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

export default function Loader({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<'loading' | 'found' | 'exit'>('loading');
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const steps = [0, 18, 37, 64, 82, 100];
    let stepIndex = 0;

    const advance = () => {
      stepIndex++;
      if (stepIndex < steps.length) {
        setProgress(steps[stepIndex]);
        const delay = stepIndex === steps.length - 1 ? 200 : 80 + Math.random() * 120;
        intervalRef.current = setTimeout(advance, delay);
      } else {
        setTimeout(() => setPhase('found'), 150);
        setTimeout(() => {
          setPhase('exit');
          setTimeout(onComplete, 400);
        }, 700);
      }
    };

    intervalRef.current = setTimeout(advance, 200);
    return () => {
      if (intervalRef.current) clearTimeout(intervalRef.current);
    };
  }, [onComplete]);

  if (phase === 'exit') return null;

  return (
    <motion.div
      className="fixed inset-0 z-[100] bg-ink flex items-center justify-center pointer-events-auto"
      initial={{ opacity: 1 }}
      animate={phase === 'found' ? { opacity: 1 } : { opacity: 1 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.4, ease: [0.33, 1, 0.68, 1] }}
    >
      <div className="flex flex-col items-center gap-8">
        {/* Logo */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="font-bold text-lg tracking-[0.3em] uppercase text-paper">
            Notice2Action
          </h1>
          <p className="text-technical mt-2">Document Intelligence</p>
        </motion.div>

        {/* Progress bar */}
        <div className="w-48 relative">
          <div className="h-px bg-dark-gray w-full" />
          <motion.div
            className="h-px bg-paper absolute top-0 left-0"
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
          />
        </div>

        {/* Status text */}
        <div className="text-center h-16 flex items-center justify-center">
          {phase === 'loading' ? (
            <div className="flex flex-col items-center gap-2">
              <span className="text-technical">Initializing</span>
              <span className="font-mono text-2xl text-paper font-light tracking-wider tabular-nums">
                {String(progress).padStart(3, '0')}%
              </span>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <span className="text-label text-accent font-semibold tracking-widest">
                Structure Found
              </span>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
