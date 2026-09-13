'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { formatFrenchCurrency } from '@/lib/formatters';
import type { Invoice } from '@/types/invoice';

interface QuoteEditorProps {
  onSubmit: (data: Partial<Invoice>) => void;
  onCancel: () => void;
  initialData?: Partial<Invoice>;
}

export function QuoteEditor({ onSubmit, onCancel, initialData }: QuoteEditorProps) {
  const [clientName, setClientName] = useState(initialData?.clientName || '');
  const [clientEmail, setClientEmail] = useState(initialData?.clientEmail || '');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [lines, setLines] = useState(
    initialData?.lines || [
      { id: 'l1', description: '', quantity: 1, unitPrice: 0, tvaRate: 20, totalHT: 0, totalTVA: 0, totalTTC: 0 },
    ]
  );

  const updateLine = (id: string, updates: Partial<typeof lines[0]>) => {
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

  const addLine = () => {
    setLines((prev) => [
      ...prev,
      { id: `l${Date.now()}`, description: '', quantity: 1, unitPrice: 0, tvaRate: 20, totalHT: 0, totalTVA: 0, totalTTC: 0 },
    ]);
  };

  const totalHT = lines.reduce((s, l) => s + l.totalHT, 0);
  const totalTVA = lines.reduce((s, l) => s + l.totalTVA, 0);
  const totalTTC = lines.reduce((s, l) => s + l.totalTTC, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ clientName, clientEmail, notes, lines });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <Card>
        <CardHeader><CardTitle>Nouveau devis</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="q-clientName">Client</Label>
              <Input id="q-clientName" value={clientName} onChange={(e) => setClientName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="q-clientEmail">Email</Label>
              <Input id="q-clientEmail" type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm" role="table">
              <thead><tr className="border-b">
                <th className="text-left py-2">Description</th>
                <th className="text-center py-2">Qté</th>
                <th className="text-right py-2">P.U.</th>
                <th className="text-right py-2">TTC</th>
                <th></th>
              </tr></thead>
              <tbody>
                {lines.map((line, i) => (
                  <tr key={line.id} className="border-b">
                    <td className="py-2"><Input value={line.description} onChange={(e) => updateLine(line.id, { description: e.target.value })} placeholder={`Ligne ${i+1}`} /></td>
                    <td className="py-2"><Input type="number" value={line.quantity} onChange={(e) => updateLine(line.id, { quantity: parseInt(e.target.value) || 0 })} className="w-16 text-center" /></td>
                    <td className="py-2"><Input type="number" value={line.unitPrice} onChange={(e) => updateLine(line.id, { unitPrice: parseFloat(e.target.value) || 0 })} className="w-24 text-right" /></td>
                    <td className="py-2 text-right font-medium">{formatFrenchCurrency(line.totalTTC)}</td>
                    <td className="py-2"><Button type="button" variant="ghost" size="sm" className="text-destructive" aria-label={`Supprimer ligne ${i+1}`}>✕</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Button type="button" variant="outline" onClick={addLine}>+ Ajouter</Button>

          <div className="flex justify-end gap-4 border-t pt-4">
            <div><p>Total HT:</p><p className="font-bold">{formatFrenchCurrency(totalHT)}</p></div>
            <div><p>TVA:</p><p className="font-bold">{formatFrenchCurrency(totalTVA)}</p></div>
            <div><p>Total TTC:</p><p className="text-xl font-bold text-primary">{formatFrenchCurrency(totalTTC)}</p></div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="q-notes">Notes</Label>
            <textarea id="q-notes" className="flex h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </CardContent>
      </Card>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Annuler</Button>
        <Button type="submit">Créer</Button>
      </div>
    </form>
  );
}
