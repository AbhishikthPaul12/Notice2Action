import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface ChecklistItemProps {
  index: number;
  label: string;
  completed?: boolean;
  className?: string;
}

export function ChecklistItem({ index, label, completed = false, className = '' }: ChecklistItemProps) {
  return (
    <motion.div
      className={`flex items-center gap-4 py-3 border-b border-dark-gray/30 ${completed ? 'opacity-40 line-through' : ''} ${className}`}
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      viewport={{ once: true }}
    >
      <div
        className={`
          w-6 h-6 flex items-center justify-center flex-shrink-0
          border transition-all duration-300
          ${
            completed
              ? 'border-accent bg-accent/10 text-accent'
              : 'border-neutral/30 text-transparent'
          }
        `}
      >
        {completed && <Check size={14} />}
      </div>
      <span
        className={`
          font-mono text-sm tracking-widest uppercase
          ${completed ? 'text-neutral' : 'text-paper'}
        `}
      >
        {String(index + 1).padStart(2, '0')} &nbsp; {label}
      </span>
    </motion.div>
  );
}
