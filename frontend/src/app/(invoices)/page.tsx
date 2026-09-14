'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { InvoicesTable } from '@/components/invoices/InvoicesTable';
import { InvoiceEditor } from '@/components/invoices/InvoiceEditor';
import { Button } from '@/components/ui/button';
import { Modal, ModalTrigger, ModalContent, ModalHeader, ModalTitle } from '@/components/ui/modal';
import { useInvoices } from '@/hooks/use-invoices';
import type { InvoiceInput } from '@/lib/validators';

export default function InvoicesPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const { invoices, isLoading: isLoadingData, create } = useInvoices();
  const [showEditor, setShowEditor] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) {
    return <div>Chargement...</div>;
  }

  const handleCreate = (data: any) => {
    create.mutate(data, {
      onSuccess: () => {
        setShowEditor(false);
      },
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Factures</h2>
            <p className="text-muted-foreground">Gérez vos factures</p>
          </div>
          <Modal>
            <ModalTrigger asChild>
              <Button>Nouvelle facture</Button>
            </ModalTrigger>
            <ModalContent className="max-w-3xl max-h-[90vh] overflow-auto">
              <ModalHeader><ModalTitle>Nouvelle facture</ModalTitle></ModalHeader>
              <InvoiceEditor onSubmit={handleCreate} onCancel={() => setShowEditor(false)} />
            </ModalContent>
          </Modal>
        </div>

        <InvoicesTable
          invoices={invoices}
          isLoading={isLoadingData}
          onCreate={() => setShowEditor(true)}
          onView={() => {}}
          onSend={() => {}}
          onPay={() => {}}
          onDownload={() => {}}
          onCancel={() => {}}
        />
      </div>
    </DashboardLayout>
  );
}
