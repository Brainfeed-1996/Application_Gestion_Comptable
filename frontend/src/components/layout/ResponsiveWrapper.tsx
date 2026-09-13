'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ResponsiveWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function ResponsiveWrapper({ children, className }: ResponsiveWrapperProps) {
  return (
    <div className={cn('mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8', className)}>
      {children}
    </div>
  );
}
