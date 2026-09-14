'use client';

import { useState } from 'react';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar pathname={pathname} />
      <div className={cn('transition-[margin] duration-200', sidebarOpen ? 'ml-0' : 'ml-64')}>
        <Header
          title={getPageTitle(pathname)}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        />
        <main className="p-6 pb-20" role="main" aria-label="Contenu principal">
          {children}
        </main>
        <div className="fixed bottom-0 right-0 left-64">
          <Footer />
        </div>
      </div>
    </div>
  );
}

function getPageTitle(pathname: string): string {
  if (pathname === '/dashboard') return 'Tableau de bord';
  if (pathname.includes('/transactions')) return 'Transactions';
  if (pathname.includes('/invoices')) return 'Factures';
  if (pathname.includes('/clients')) return 'Clients';
  if (pathname.includes('/reports')) return 'Rapports';
  if (pathname.includes('/settings')) return 'Paramètres';
  return 'Application Comptable';
}
