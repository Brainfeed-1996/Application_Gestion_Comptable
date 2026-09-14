'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { InvoiceEditor } from '@/components/invoices/InvoiceEditor';
import type { InvoiceInput } from '@/lib/validators';

export default function NewInvoicePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) {
    return <div>Chargement...</div>;
  }

  const handleSubmit = (data: any) => {
    setSubmitted(true);
    setTimeout(() => {
      router.push('/invoices');
    }, 1000);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Nouvelle facture</h2>
        {submitted && (
          <p className="text-green-600">Facture créée avec succès ! Redirection...</p>
        )}
        <InvoiceEditor
          onSubmit={handleSubmit}
          onCancel={() => router.push('/invoices')}
        />
      </div>
    </DashboardLayout>
  );
}
