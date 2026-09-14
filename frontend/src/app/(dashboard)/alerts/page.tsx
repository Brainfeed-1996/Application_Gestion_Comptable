'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AlertsList } from '@/components/dashboard/AlertsList';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

export default function AlertsPage() {
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
            <h2 className="text-2xl font-bold">Alertes</h2>
            <p className="text-muted-foreground">Gérez et surveillez vos alertes</p>
          </div>
          <Button variant="outline">Marquer tout lu</Button>
        </div>

        <div className="flex gap-2">
          <Input placeholder="Rechercher une alerte..." className="max-w-sm" aria-label="Rechercher" />
          <Badge variant="default">5 ouvertes</Badge>
          <Badge variant="secondary">2 résolues</Badge>
        </div>

        <AlertsList />
      </div>
    </DashboardLayout>
  );
}
