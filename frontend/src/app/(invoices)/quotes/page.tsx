'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { InvoicesTable } from '@/components/invoices/InvoicesTable';
import { QuoteEditor } from '@/components/invoices/QuoteEditor';
import { Button } from '@/components/ui/button';
import { Modal, ModalTrigger, ModalContent, ModalHeader, ModalTitle } from '@/components/ui/modal';

export default function QuotesPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) {
    return <div>Chargement...</div>;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Devis</h2>
            <p className="text-muted-foreground">Gérez vos devis et propositions</p>
          </div>
          <Modal>
            <ModalTrigger asChild>
              <Button>Nouveau devis</Button>
            </ModalTrigger>
            <ModalContent className="max-w-3xl max-h-[90vh] overflow-auto">
              <ModalHeader><ModalTitle>Nouveau devis</ModalTitle></ModalHeader>
              <QuoteEditor onSubmit={() => {}} onCancel={() => {}} />
            </ModalContent>
          </Modal>
        </div>

        <InvoicesTable invoices={[]} isLoading={false} />

        <div className="rounded-lg border p-6 bg-muted/50">
          <h3 className="font-medium mb-4">Conversion devis → facture</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Sélectionnez un devis accepté pour le convertir en facture.
          </p>
          <Button variant="outline">Convertir en facture</Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
