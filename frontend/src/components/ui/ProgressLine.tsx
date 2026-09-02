import React from 'react';

interface ProgressLineProps {
  className?: string;
}

export function ProgressLine({ className = '' }: ProgressLineProps) {
  return (
    <div
      className={`h-px bg-neutral/20 w-full ${className}`}
      role="separator"
    />
  );
}
