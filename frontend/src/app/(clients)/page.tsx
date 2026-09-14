'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ClientsTable } from '@/components/clients/ClientsTable';
import { ClientForm } from '@/components/clients/ClientForm';
import { Button } from '@/components/ui/button';
import { Modal, ModalTrigger, ModalContent, ModalHeader, ModalTitle } from '@/components/ui/modal';
import { useClients } from '@/hooks/use-accounts';
import type { ClientFull } from '@/services/clients.service';

export default function ClientsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const { clients, isLoading: isLoadingData, create } = useClients();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) {
    return <div>Chargement...</div>;
  }

  const handleCreate = (data: any) => {
    create.mutate(data as any, {
      onSuccess: () => {
        setShowModal(false);
      },
    });
  };

  const [showModal, setShowModal] = useState(false);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Clients</h2>
            <p className="text-muted-foreground">Gérez vos clients</p>
          </div>
          <Modal>
            <ModalTrigger asChild>
              <Button>Ajouter un client</Button>
            </ModalTrigger>
            <ModalContent className="max-w-lg">
              <ModalHeader><ModalTitle>Nouveau client</ModalTitle></ModalHeader>
              <ClientForm
                onSubmit={handleCreate}
                onCancel={() => setShowModal(false)}
              />
            </ModalContent>
          </Modal>
        </div>

        <ClientsTable
          clients={clients}
          isLoading={isLoadingData}
          onCreate={() => setShowModal(true)}
          onView={(client) => router.push(`/clients/${client.id}`)}
        />
      </div>
    </DashboardLayout>
  );
}
