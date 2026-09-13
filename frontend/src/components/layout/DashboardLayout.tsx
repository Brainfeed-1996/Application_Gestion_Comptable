'use client';

import { Sidebar } from './sidebar';
import { Header } from './header';
import { Footer } from './footer';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar pathname={typeof window !== 'undefined' ? window.location.pathname : ''} />
      <div className={cn('transition-[margin] duration-200', collapsed ? 'ml-0' : 'ml-64')}>
        <Header onMenuClick={() => setCollapsed(!collapsed)} />
        <main className="p-6 pb-20" role="main" aria-label="Contenu principal">
          {children}
        </main>
        <div className="ml-64">
          <Footer />
        </div>
      </div>
    </div>
  );
}
