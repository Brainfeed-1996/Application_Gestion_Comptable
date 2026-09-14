'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { formatFrenchCurrency, formatFrenchDate } from '@/lib/formatters';
import type { Invoice } from '@/types/invoice';

interface ClientPortalProps {
  invoices: Invoice[];
}

export function ClientPortal({ invoices }: ClientPortalProps) {
  const [paymentInvoiceId, setPaymentInvoiceId] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [paidIds, setPaidIds] = useState<Set<string>>(new Set());

  const unpaidInvoices = invoices.filter((i) => i.status === 'sent' || i.status === 'overdue');
  const paidInvoices = invoices.filter((i) => i.status === 'paid');

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentInvoiceId || !paymentAmount) return;
    setPaidIds((prev) => new Set([...prev, paymentInvoiceId]));
    setPaymentInvoiceId('');
    setPaymentAmount('');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Mes factures</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {invoices.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium">Facture {inv.number}</p>
                  <p className="text-sm text-muted-foreground">{formatFrenchDate(inv.issueDate)}</p>
                  <Badge variant={inv.status === 'paid' ? 'success' : inv.status === 'overdue' ? 'warning' : 'info'}>
                    {inv.status}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="font-bold">{formatFrenchCurrency(inv.totalTTC)}</p>
                  {paidIds.has(inv.id) && <Badge variant="success">Payée</Badge>}
                </div>
              </div>
            ))}
            {invoices.length === 0 && (
              <p className="text-center text-muted-foreground py-4">Aucune facture</p>
            )}
          </div>
        </CardContent>
      </Card>

      {unpaidInvoices.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Paiement</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handlePayment} className="space-y-4" noValidate>
              <div className="space-y-2">
                <Label htmlFor="p-invoice">Facture à payer</Label>
                <Select value={paymentInvoiceId} onValueChange={setPaymentInvoiceId} aria-label="Sélectionner une facture">
                  <option value="">Sélectionner</option>
                  {unpaidInvoices.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.number} - {formatFrenchCurrency(inv.totalTTC)}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="p-amount">Montant</Label>
                <Input
                  id="p-amount"
                  type="number"
                  step="0.01"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="p-method">Méthode</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod} aria-label="Méthode de paiement">
                  <option value="card">Carte bancaire</option>
                  <option value="bank">Virement</option>
                  <option value="paypal">PayPal</option>
                </Select>
              </div>
              <Button type="submit" disabled={!paymentInvoiceId || !paymentAmount}>
                Payer
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {paidInvoices.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Historique des paiements</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-2" aria-label="Paiements effectués">
              {paidInvoices.map((inv) => (
                <li key={inv.id} className="flex items-center justify-between py-2 border-b">
                  <span>Facture {inv.number}</span>
                  <Badge variant="success">Payée le {formatFrenchDate(inv.issueDate)}</Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
