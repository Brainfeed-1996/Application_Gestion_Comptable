'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { TransactionForm } from '@/components/transactions/TransactionForm';
import { Button } from '@/components/ui/button';
import { Modal, ModalTrigger, ModalContent, ModalHeader, ModalTitle, ModalFooter } from '@/components/ui/modal';
import { useTransactions } from '@/hooks/use-transactions';
import type { TransactionCreate } from '@/types/transaction';

export default function NewTransactionPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const { create } = useTransactions();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) {
    return <div>Chargement...</div>;
  }

  const handleSubmit = (data: TransactionCreate) => {
    create.mutate(data, {
      onSuccess: () => {
        setShowModal(false);
        router.push('/transactions');
      },
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Nouvelle transaction</h2>

        <TransactionForm
          onSubmit={handleSubmit}
          onCancel={() => router.push('/transactions')}
        />
      </div>
    </DashboardLayout>
  );
}
