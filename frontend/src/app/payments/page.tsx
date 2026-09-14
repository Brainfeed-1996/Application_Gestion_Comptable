'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PaymentTable } from '@/components/payments/payment-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Modal, ModalTrigger, ModalContent, ModalHeader, ModalTitle } from '@/components/ui/modal';
import { PaymentForm } from '@/components/payments/payment-form';
import { usePayments } from '@/hooks/use-payments';
import { useInvoices } from '@/hooks/use-invoices';
import type { PaymentCreate } from '@/types/payment';

export default function PaymentsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const { payments, isLoading: isLoadingPayments, refetch } = usePayments();
  const { invoices } = useInvoices();
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) {
    return <div>Chargement...</div>;
  }

  const filteredPayments = payments.filter((payment) => {
    if (statusFilter !== 'all' && payment.status !== statusFilter) return false;
    if (methodFilter !== 'all' && payment.method !== methodFilter) return false;
    if (dateFrom && payment.payment_date < dateFrom) return false;
    if (dateTo && payment.payment_date > dateTo) return false;
    return true;
  });

  const handleSubmit = (data: PaymentCreate) => {
    // In a real app, this would call the API
    console.log('Create payment:', data);
    setShowModal(false);
    // Refetch would happen after API integration
    refetch();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Paiements</h2>
            <p className="text-muted-foreground">Gérez vos paiements reçus</p>
          </div>
          <Modal>
            <ModalTrigger asChild>
              <Button>+ Nouveau paiement</Button>
            </ModalTrigger>
            <ModalContent className="max-w-2xl max-h-[90vh] overflow-auto">
              <ModalHeader>
                <ModalTitle>Nouveau paiement</ModalTitle>
              </ModalHeader>
              <PaymentForm
                onSubmit={handleSubmit}
                onCancel={() => setShowModal(false)}
                invoices={invoices}
              />
            </ModalContent>
          </Modal>
        </div>

        <div className="flex flex-wrap items-end gap-4 rounded-lg border p-4">
          <div className="space-y-2">
            <Label htmlFor="statusFilter">Statut</Label>
            <Select
              id="statusFilter"
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <option value="all">Tous statuts</option>
              <option value="pending">En attente</option>
              <option value="completed">Complété</option>
              <option value="failed">Échoué</option>
              <option value="refunded">Remboursé</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="methodFilter">Mode</Label>
            <Select
              id="methodFilter"
              value={methodFilter}
              onValueChange={setMethodFilter}
            >
              <option value="all">Tous modes</option>
              <option value="cash">Espèces</option>
              <option value="card">Carte bancaire</option>
              <option value="transfer">Virement</option>
              <option value="cheque">Chèque</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="dateFrom">Date début</Label>
            <Input
              id="dateFrom"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dateTo">Date fin</Label>
            <Input
              id="dateTo"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setStatusFilter('all');
              setMethodFilter('all');
              setDateFrom('');
              setDateTo('');
            }}
          >
            Réinitialiser
          </Button>
        </div>

        <PaymentTable
          payments={filteredPayments}
          invoices={invoices}
          isLoading={isLoadingPayments}
          onEdit={(payment) => {
            // Edit functionality
            console.log('Edit payment:', payment);
          }}
          onDelete={(id) => {
            // Delete functionality
            console.log('Delete payment:', id);
          }}
        />
      </div>
    </DashboardLayout>
  );
}