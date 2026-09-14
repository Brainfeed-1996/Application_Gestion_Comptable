'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatFrenchCurrency, formatFrenchDate } from '@/lib/formatters';
import type { ClientFull } from '@/services/clients.service';
import type { Invoice } from '@/types/invoice';
import type { Transaction } from '@/types/transaction';

interface ClientDetailProps {
  client: ClientFull;
  invoices?: Invoice[];
  transactions?: Transaction[];
  onEdit?: () => void;
}

export function ClientDetail({ client, invoices = [], transactions = [], onEdit }: ClientDetailProps) {
  const totalPaid = invoices
    .filter((i) => i.status === 'paid')
    .reduce((s, i) => s + i.totalTTC, 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{client.name}</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onEdit}>Modifier</Button>
            <Badge variant={client.status === 'active' ? 'success' : 'secondary'}>{client.status}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{client.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Téléphone</p>
              <p className="font-medium">{client.phone || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">N° TVA</p>
              <p className="font-medium">{client.vatNumber || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">SIRET</p>
              <p className="font-medium">{client.siret || '-'}</p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-muted-foreground">Adresse</p>
            <p>{client.address}{client.city ? `, ${client.city}` : ''}{client.postalCode ? ` ${client.postalCode}` : ''}{client.country ? `, ${client.country}` : ''}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Solde</CardTitle></CardHeader>
          <CardContent>
            <p className={cn('text-3xl font-bold', client.balance >= 0 ? 'text-green-600' : 'text-red-600')}>
              {formatFrenchCurrency(client.balance)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Factures</CardTitle></CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{invoices.length}</p>
            <p className="text-sm text-muted-foreground">{formatFrenchCurrency(totalPaid)} payés</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Transactions</CardTitle></CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{transactions.length}</p>
          </CardContent>
        </Card>
      </div>

      {invoices.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Factures</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm" role="table">
                <thead className="border-b">
                  <tr>
                    <th className="text-left py-2">N°</th>
                    <th className="text-left py-2">Statut</th>
                    <th className="text-right py-2">Montant</th>
                    <th className="text-left py-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="border-b">
                      <td className="py-2 font-medium">{inv.number}</td>
                      <td className="py-2"><Badge>{inv.status}</Badge></td>
                      <td className="py-2 text-right">{formatFrenchCurrency(inv.totalTTC)}</td>
                      <td className="py-2">{formatFrenchDate(inv.issueDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {transactions.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Transactions récentes</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-2" aria-label="Transactions">
              {transactions.slice(0, 10).map((t) => (
                <li key={t.id} className="flex items-center justify-between py-1">
                  <span>{t.label}</span>
                  <span className={t.type === 'credit' ? 'text-green-600' : 'text-red-600'}>
                    {t.type === 'credit' ? '+' : '-'}{formatFrenchCurrency(t.amount)}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
