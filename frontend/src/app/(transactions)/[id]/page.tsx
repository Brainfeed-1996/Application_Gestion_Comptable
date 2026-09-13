'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useTransaction } from '@/hooks/use-transactions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatFrenchCurrency, formatFrenchDate } from '@/lib/formatters';
import { Spinner } from '@/components/ui/spinner';
import { Modal, ModalTrigger, ModalContent, ModalHeader, ModalTitle, ModalFooter } from '@/components/ui/modal';
import { TransactionForm } from '@/components/transactions/TransactionForm';
import type { TransactionCreate } from '@/types/transaction';

export default function TransactionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const { data, isLoading: isLoadingData } = useTransaction(id);

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
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      </DashboardLayout>
    );
  }

  if (!data) {
    return (
      <DashboardLayout>
        <Card>
          <CardContent className="pt-6 text-center">
            <p>Transaction non trouvée</p>
            <Button onClick={() => router.push('/transactions')} className="mt-4">Retour</Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  const transaction = data;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => router.back()} aria-label="Retour">
            ← Retour
          </Button>
          <h2 className="text-2xl font-bold">Transaction {transaction.id}</h2>
        </div>

        <Card>
          <CardHeader><CardTitle>Détails</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="font-medium">{formatFrenchDate(transaction.date)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Libellé</p>
                <p className="font-medium">{transaction.label}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Montant</p>
                <p className={`text-2xl font-bold ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                  {transaction.type === 'credit' ? '+' : '-'}{formatFrenchCurrency(transaction.amount)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Type</p>
                <Badge variant={transaction.type === 'credit' ? 'success' : 'destructive'}>
                  {transaction.type === 'credit' ? 'Recette' : 'Dépense'}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Statut</p>
                <Badge>{transaction.status}</Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Counterparty</p>
                <p>{transaction.counterparty || '-'}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium">Journal d'audit</h3>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground" aria-label="Journal d'audit">
                <li>Créé le {formatFrenchDate(transaction.createdAt)}</li>
                <li>Mis à jour le {formatFrenchDate(transaction.updatedAt)}</li>
                <li>Statut: {transaction.status}</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Modal>
            <ModalTrigger asChild>
              <Button>Modifier</Button>
            </ModalTrigger>
            <ModalContent>
              <ModalHeader>
                <ModalTitle>Modifier la transaction</ModalTitle>
              </ModalHeader>
              <ModalFooter>
                <TransactionForm
                  onSubmit={() => {}}
                  onCancel={() => {}}
                  initialData={transaction}
                />
              </ModalFooter>
            </ModalContent>
          </Modal>
          <Button variant="destructive">Supprimer</Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
