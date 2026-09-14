'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ClientPortal } from '@/components/clients/ClientPortal';
import { useInvoices } from '@/hooks/use-invoices';
import { Spinner } from '@/components/ui/spinner';

export default function ClientPortalPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const { invoices, isLoading: isLoadingInvoices } = useInvoices();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated || isLoadingInvoices) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-20"><Spinner /></div>
      </DashboardLayout>
    );
  }

  const unpaidInvoices = invoices.filter((i) => i.status === 'sent' || i.status === 'overdue');
  const paidInvoices = invoices.filter((i) => i.status === 'paid');

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Mon portail client</h2>
        <ClientPortal
          invoices={invoices}
        />
      </div>
    </DashboardLayout>
  );
}
