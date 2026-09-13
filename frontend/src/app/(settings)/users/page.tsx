'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { UsersManager } from '@/components/settings/UsersManager';
import { Button } from '@/components/ui/button';
import { Modal, ModalTrigger, ModalContent, ModalHeader, ModalTitle } from '@/components/ui/modal';
import { ClientForm } from '@/components/clients/ClientForm';

export default function UsersPage() {
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
      <UsersManager />
    </DashboardLayout>
  );
}
