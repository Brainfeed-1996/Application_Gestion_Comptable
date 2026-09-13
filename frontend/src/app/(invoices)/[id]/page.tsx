'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { InvoiceDetail } from '@/components/invoices/InvoiceDetail';
import { useInvoice } from '@/hooks/use-invoices';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Modal, ModalTrigger, ModalContent, ModalHeader, ModalTitle } from '@/components/ui/modal';
import { InvoiceEditor } from '@/components/invoices/InvoiceEditor';
import type { Invoice } from '@/types/invoice';

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const { data: invoice, isLoading: isLoadingData } = useInvoice(id);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) {
    return <div>Chargement...</div>;
  }

  if (isLoadingData) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-20"><Spinner /></div>
      </DashboardLayout>
    );
  }

  if (!invoice) {
    return (
      <DashboardLayout>
        <Card><CardContent className="pt-6 text-center"><p>Facture non trouvée</p><Button onClick={() => router.push('/invoices')} className="mt-4">Retour</Button></CardContent></Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => router.back()}>← Retour</Button>
          <h2 className="text-2xl font-bold">Facture {invoice.number}</h2>
        </div>
        <InvoiceDetail
          invoice={invoice as Invoice}
          onEdit={() => {}}
          onDelete={() => {}}
          onSend={() => {}}
          onPay={() => {}}
          onCancel={() => {}}
          onDownload={() => {}}
        />
      </div>
    </DashboardLayout>
  );
}
