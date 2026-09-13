'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ClientForm } from '@/components/clients/ClientForm';
import { Button } from '@/components/ui/button';

export default function NewClientPage() {
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

  const handleSubmit = (data: any) => {
    router.push('/clients');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Nouveau client</h2>
        <ClientForm onSubmit={handleSubmit} onCancel={() => router.push('/clients')} />
      </div>
    </DashboardLayout>
  );
}
