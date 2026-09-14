'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PaymentForm } from '@/components/payments/payment-form';
import { usePayments } from '@/hooks/use-payments';
import { useInvoices } from '@/hooks/use-invoices';
import type { PaymentCreate } from '@/types/payment';

export default function NewPaymentPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const { create } = usePayments();
  const { invoices } = useInvoices();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) {
    return <div>Chargement...</div>;
  }

  const handleSubmit = (data: PaymentCreate) => {
    create.mutate(data, {
      onSuccess: () => {
        router.push('/payments');
      },
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Nouveau paiement</h2>
        <PaymentForm
          onSubmit={handleSubmit}
          onCancel={() => router.push('/payments')}
          invoices={invoices}
          isSubmitting={create.isPending}
        />
      </div>
    </DashboardLayout>
  );
}