'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { formatFrenchCurrency } from '@/lib/formatters';
import type { InvoiceLine } from '@/types/invoice';

interface InvoiceEditorProps {
  onSubmit: (data: {
    clientId: string;
    clientName: string;
    clientEmail: string;
    clientAddress: string;
    lines: Omit<InvoiceLine, 'id' | 'totalHT' | 'totalTVA' | 'totalTTC'>[];
    notes?: string;
    terms?: string;
  }) => void;
  onCancel: () => void;
  initialData?: Partial<{
    clientId: string;
    clientName: string;
    clientEmail: string;
    clientAddress: string;
    lines: Array<Omit<InvoiceLine, 'id' | 'totalHT' | 'totalTVA' | 'totalTTC'>>;
    notes?: string;
    terms?: string;
  }>;
  isEdit?: boolean;
}

export function InvoiceEditor({
  onSubmit,
  onCancel,
  initialData,
  isEdit = false,
}: InvoiceEditorProps) {
  const [clientId, setClientId] = useState(initialData?.clientId || '');
  const [clientName, setClientName] = useState(initialData?.clientName || '');
  const [clientEmail, setClientEmail] = useState(initialData?.clientEmail || '');
  const [clientAddress, setClientAddress] = useState(initialData?.clientAddress || '');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [terms, setTerms] = useState(initialData?.terms || '');
  const [lines, setLines] = useState<InvoiceLine[]>(
    initialData?.lines?.map((l, i) => ({ ...l, id: l.id || `line_${i}` })) || [
      { id: 'line_0', description: '', quantity: 1, unitPrice: 0, tvaRate: 20, totalHT: 0, totalTVA: 0, totalTTC: 0 },
    ]
  );

  const addLine = () => {
    setLines((prev) => [
      ...prev,
      { id: `line_${Date.now()}`, description: '', quantity: 1, unitPrice: 0, tvaRate: 20, totalHT: 0, totalTVA: 0, totalTTC: 0 },
    ]);
  };

  const removeLine = (id: string) => {
    setLines((prev) => prev.filter((l) => l.id !== id));
  };

  const updateLine = (id: string, updates: Partial<InvoiceLine>) => {
    setLines((prev) =>
      prev.map((l) => {
        if (l.id !== id) return l;
        const line = { ...l, ...updates };
        line.totalHT = line.quantity * line.unitPrice;
        line.totalTVA = line.totalHT * (line.tvaRate / 100);
        line.totalTTC = line.totalHT + line.totalTVA;
        return line;
      })
    );
  };

  const totalHT = lines.reduce((s, l) => s + l.totalHT, 0);
  const totalTVA = lines.reduce((s, l) => s + l.totalTVA, 0);
  const totalTTC = lines.reduce((s, l) => s + l.totalTTC, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      clientId,
      clientName,
      clientEmail,
      clientAddress,
      lines: lines.map(({ id, ...rest }) => rest),
      notes: notes || undefined,
      terms: terms || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? 'Modifier' : 'Nouvelle'} facture</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <fieldset className="space-y-4">
            <legend className="text-sm font-medium">Informations client</legend>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clientName">Nom du client *</Label>
                <Input
                  id="clientName"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientEmail">Email client *</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  required
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="clientAddress">Adresse</Label>
                <Input
                  id="clientAddress"
                  value={clientAddress}
                  onChange={(e) => setClientAddress(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientId">ID Client</Label>
                <Input
                  id="clientId"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  placeholder="ID client (optionnel)"
                />
              </div>
            </div>
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="text-sm font-medium">Lignes de facture</legend>
            <div className="overflow-x-auto">
              <table className="w-full text-sm" role="table" aria-label="Lignes de facture">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2" scope="col">Description</th>
                    <th className="text-center py-2" scope="col">Qté</th>
                    <th className="text-right py-2" scope="col">P.U.</th>
                    <th className="text-center py-2" scope="col">TVA %</th>
                    <th className="text-right py-2" scope="col">Total</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((line, index) => (
                    <tr key={line.id} className="border-b">
                      <td className="py-2">
                        <Input
                          value={line.description}
                          onChange={(e) => updateLine(line.id, { description: e.target.value })}
                          placeholder={`Ligne ${index + 1}`}
                          aria-label={`Description ligne ${index + 1}`}
                        />
                      </td>
                      <td className="py-2">
                        <Input
                          type="number"
                          min="1"
                          value={line.quantity}
                          onChange={(e) => updateLine(line.id, { quantity: parseInt(e.target.value) || 0 })}
                          className="w-16 text-center"
                          aria-label={`Quantité ligne ${index + 1}`}
                        />
                      </td>
                      <td className="py-2">
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={line.unitPrice}
                          onChange={(e) => updateLine(line.id, { unitPrice: parseFloat(e.target.value) || 0 })}
                          className="w-24 text-right"
                          aria-label={`Prix unitaire ligne ${index + 1}`}
                        />
                      </td>
                      <td className="py-2">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={line.tvaRate}
                          onChange={(e) => updateLine(line.id, { tvaRate: parseFloat(e.target.value) || 0 })}
                          className="w-16 text-center"
                          aria-label={`Taux TVA ligne ${index + 1}`}
                        />
                      </td>
                      <td className="py-2 text-right font-medium">
                        {formatFrenchCurrency(line.totalTTC)}
                      </td>
                      <td className="py-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeLine(line.id)}
                          aria-label={`Supprimer ligne ${index + 1}`}
                          className="text-destructive"
                        >
                          ✕
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Button type="button" variant="outline" onClick={addLine} aria-label="Ajouter une ligne">
              + Ajouter une ligne
            </Button>
          </fieldset>

          <div className="flex justify-end gap-4 border-t pt-4">
            <div className="space-y-1">
              <p className="text-sm">Total HT :</p>
              <p className="text-lg font-bold">{formatFrenchCurrency(totalHT)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm">TVA :</p>
              <p className="text-lg font-bold">{formatFrenchCurrency(totalTVA)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm">Total TTC :</p>
              <p className="text-2xl font-bold text-primary">{formatFrenchCurrency(totalTTC)}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <textarea
              id="notes"
              className="flex h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes additionnelles..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="terms">Conditions</Label>
            <textarea
              id="terms"
              className="flex h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              placeholder="Conditions de vente..."
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit">{isEdit ? 'Mettre à jour' : 'Créer'}</Button>
      </div>
    </form>
  );
}
