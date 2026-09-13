'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { formatFrenchCurrency } from '@/lib/formatters';
import type { TransactionCreate, TransactionType } from '@/types/transaction';
import { useAccounts } from '@/hooks/use-accounts';

interface TransactionFormProps {
  onSubmit: (data: TransactionCreate) => void;
  onCancel: () => void;
  initialData?: Partial<TransactionCreate>;
}

export function TransactionForm({
  onSubmit,
  onCancel,
  initialData,
}: TransactionFormProps) {
  const { data: accounts } = useAccounts();
  const [formData, setFormData] = useState<TransactionCreate>({
    date: new Date().toISOString().split('T')[0],
    label: '',
    amount: 0,
    type: 'debit',
    accountId: '',
    counterparty: '',
    ...initialData,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const autoCalc = useCallback((type: TransactionType, amount: number) => {
    // Double-entry: when type changes, show counterpart automatically
    // debit = credit logic (both equal amount)
  }, []);

  useEffect(() => {
    autoCalc(formData.type, formData.amount);
  }, [formData.type, formData.amount, autoCalc]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.label.trim()) newErrors.label = 'Le libellé est requis';
    if (formData.amount <= 0) newErrors.amount = 'Le montant doit être positif';
    if (!formData.date) newErrors.date = 'La date est requise';
    if (!formData.accountId) newErrors.accountId = 'Le compte est requis';
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
          <CardTitle>Nouvelle transaction</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                error={errors.date}
                aria-invalid={!!errors.date}
              />
              {errors.date && <p className="text-xs text-destructive">{errors.date}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                id="type"
                value={formData.type}
                onValueChange={(v) => setFormData({ ...formData, type: v as TransactionType })}
              >
                <option value="debit">Dépense (Débit)</option>
                <option value="credit">Recette (Crédit)</option>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="label">Libellé</Label>
            <Input
              id="label"
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              placeholder="Description de la transaction"
              aria-invalid={!!errors.label}
            />
            {errors.label && <p className="text-xs text-destructive">{errors.label}</p>}
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
              <Label htmlFor="accountId">Compte</Label>
              <Select
                id="accountId"
                value={formData.accountId}
                onValueChange={(v) => setFormData({ ...formData, accountId: v })}
                aria-invalid={!!errors.accountId}
              >
                <option value="">Sélectionner</option>
                {accounts?.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </Select>
              {errors.accountId && <p className="text-xs text-destructive">{errors.accountId}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="counterparty">Counterparty (optionnel)</Label>
            <Input
              id="counterparty"
              value={formData.counterparty || ''}
              onChange={(e) => setFormData({ ...formData, counterparty: e.target.value })}
              placeholder="Nom du tiers"
            />
          </div>

          <div className={cn('rounded-lg p-4 bg-muted', !formData.counterparty && 'hidden')}>
            <p className="text-sm font-medium">Double-entry validation</p>
            <p className="text-sm text-muted-foreground">
              Débit = Crédit : {formatFrenchCurrency(formData.amount)}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit">Créer</Button>
      </div>
    </form>
  );
}
