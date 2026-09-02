import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

interface ActionButtonProps {
  children: React.ReactNode;
  href?: string;
  variant?: 'primary' | 'secondary';
  className?: string;
  onClick?: () => void;
}

export function ActionButton({
  children,
  href,
  variant = 'primary',
  className = '',
  onClick,
}: ActionButtonProps) {
  const isPrimary = variant === 'primary';

  const baseClasses = `
    group relative inline-flex items-center gap-3
    px-8 py-4 text-sm font-medium tracking-widest uppercase
    transition-colors duration-300 cursor-pointer
    ${
      isPrimary
        ? 'bg-paper text-ink hover:bg-accent hover:text-white'
        : 'bg-transparent text-paper border border-neutral/30 hover:border-paper'
    }
    ${className}
  `;

  if (href) {
    return (
      <motion.a
        href={href}
        onClick={onClick}
        className={baseClasses}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        aria-label={typeof children === 'string' ? children : undefined}
      >
        <span>{children}</span>
        {isPrimary && (
          <ArrowUpRight
            size={16}
            className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        )}
      </motion.a>
    );
  }

  return (
    <motion.button
      type="button"
      onClick={onClick}
      className={baseClasses}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      aria-label={typeof children === 'string' ? children : undefined}
    >
      <span>{children}</span>
      {isPrimary && (
        <ArrowUpRight
          size={16}
          className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        />
      )}
    </motion.button>
  );
}
