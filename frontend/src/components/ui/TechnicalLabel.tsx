import React from 'react';

interface TechnicalLabelProps {
  children: React.ReactNode;
  className?: string;
}

export function TechnicalLabel({ children, className = '' }: TechnicalLabelProps) {
  return (
    <span className={`text-technical ${className}`}>
      {children}
    </span>
  );
}
