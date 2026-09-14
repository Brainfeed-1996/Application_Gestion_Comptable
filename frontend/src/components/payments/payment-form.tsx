'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { formatFrenchCurrency } from '@/lib/formatters';
import type { PaymentCreate, PaymentMethod } from '@/types/payment';
import type { Invoice } from '@/types/invoice';

interface PaymentFormProps {
  onSubmit: (data: PaymentCreate) => void;
  onCancel: () => void;
  initialData?: Partial<PaymentCreate>;
  invoices?: Invoice[];
  isSubmitting?: boolean;
}

const METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: 'Espèces',
  card: 'Carte bancaire',
  transfer: 'Virement',
  cheque: 'Chèque',
};

export function PaymentForm({
  onSubmit,
  onCancel,
  initialData,
  invoices = [],
  isSubmitting = false,
}: PaymentFormProps) {
  const [formData, setFormData] = useState<PaymentCreate>({
    invoice_id: '',
    amount: 0,
    method: 'cash',
    payment_date: new Date().toISOString().split('T')[0],
    reference: '',
    notes: '',
    ...initialData,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedInvoice = invoices.find((inv) => inv.id === formData.invoice_id);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.invoice_id) newErrors.invoice_id = 'La facture est requise';
    if (formData.amount <= 0) newErrors.amount = 'Le montant doit être positif';
    if (!formData.payment_date) newErrors.payment_date = 'La date est requise';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Card>
        <CardHeader>
          <CardTitle>Nouveau paiement</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="invoice_id">Facture</Label>
            <Select
              id="invoice_id"
              value={formData.invoice_id}
              onValueChange={(v) => {
                const inv = invoices.find((i) => i.id === v);
                setFormData((prev) => ({
                  ...prev,
                  invoice_id: v,
                  amount: inv ? inv.total : prev.amount,
                }));
              }}
              aria-invalid={!!errors.invoice_id}
            >
              <option value="">Sélectionner une facture</option>
              {invoices.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.invoice_number} - {inv.client_name} ({formatFrenchCurrency(inv.total)})
                </option>
              ))}
            </Select>
            {errors.invoice_id && (
              <p className="text-xs text-destructive">{errors.invoice_id}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Montant</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount || ''}
                onChange={(e) =>
                  setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })
                }
                aria-invalid={!!errors.amount}
              />
              {errors.amount && <p className="text-xs text-destructive">{errors.amount}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="method">Mode de paiement</Label>
              <Select
                id="method"
                value={formData.method}
                onValueChange={(v) => setFormData({ ...formData, method: v as PaymentMethod })}
              >
                {Object.entries(METHOD_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="payment_date">Date de paiement</Label>
              <Input
                id="payment_date"
                type="date"
                value={formData.payment_date}
                onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                aria-invalid={!!errors.payment_date}
              />
              {errors.payment_date && (
                <p className="text-xs text-destructive">{errors.payment_date}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="reference">Référence (optionnel)</Label>
              <Input
                id="reference"
                value={formData.reference || ''}
                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                placeholder="N° de chèque, de transaction..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optionnel)</Label>
            <Input
              id="notes"
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Notes supplémentaires"
            />
          </div>

          {selectedInvoice && (
            <div className={cn('rounded-lg p-4 bg-muted')}>
              <p className="text-sm font-medium">Récapitulatif</p>
              <p className="text-sm text-muted-foreground">
                Facture : {selectedInvoice.invoice_number}
              </p>
              <p className="text-sm text-muted-foreground">
                Total dû : {formatFrenchCurrency(selectedInvoice.total)}
              </p>
              <p className="text-sm text-muted-foreground">
                Montant payé : {formatFrenchCurrency(formData.amount)}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Annuler
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
        </Button>
      </div>
    </form>
  );
}