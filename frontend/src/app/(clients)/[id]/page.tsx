'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ClientDetail } from '@/components/clients/ClientDetail';
import { useClient } from '@/hooks/use-accounts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Modal, ModalTrigger, ModalContent, ModalHeader, ModalTitle } from '@/components/ui/modal';
import { ClientForm } from '@/components/clients/ClientForm';
import type { ClientFull } from '@/services/clients.service';

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const { data: client, isLoading: isLoadingData } = useClient(id);
  const [showEdit, setShowEdit] = useState(false);

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

  if (!client) {
    return (
      <DashboardLayout>
        <Card><CardContent className="pt-6 text-center"><p>Client non trouvé</p><Button onClick={() => router.push('/clients')} className="mt-4">Retour</Button></CardContent></Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => router.back()}>← Retour</Button>
          <h2 className="text-2xl font-bold">{client.name}</h2>
        </div>

        <ClientDetail
          client={client as ClientFull}
          onEdit={() => setShowEdit(true)}
        />

        <Modal>
          <ModalTrigger asChild>
            <Button variant="outline">Modifier les informations</Button>
          </ModalTrigger>
          <ModalContent className="max-w-lg">
            <ModalHeader><ModalTitle>Modifier le client</ModalTitle></ModalHeader>
            <ClientForm
              onSubmit={() => setShowEdit(false)}
              onCancel={() => setShowEdit(false)}
              initialData={client as Record<string, string>}
              isEdit
            />
          </ModalContent>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
