'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatFrenchCurrency, formatFrenchDate } from '@/lib/formatters';
import type { Invoice } from '@/types/invoice';

interface InvoiceDetailProps {
  invoice: Invoice;
  onSend?: () => void;
  onPay?: () => void;
  onCancel?: () => void;
  onDownload?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive' | 'success' | 'warning' | 'info'> = {
  draft: 'default', sent: 'info', paid: 'success', cancelled: 'destructive', overdue: 'warning',
};

export function InvoiceDetail({
  invoice,
  onSend,
  onPay,
  onCancel,
  onDownload,
  onEdit,
  onDelete,
}: InvoiceDetailProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Facture {invoice.number}</CardTitle>
          <Badge variant={STATUS_VARIANTS[invoice.status] || 'default'}>
            {invoice.status}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Client</h3>
              <p className="font-medium">{invoice.clientName}</p>
              <p className="text-sm text-muted-foreground">{invoice.clientEmail}</p>
              <p className="text-sm text-muted-foreground">{invoice.clientAddress}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Dates</h3>
              <p><time dateTime={invoice.issueDate}>{formatFrenchDate(invoice.issueDate)}</time></p>
              <p className="text-sm text-muted-foreground">
                Échéance: <time dateTime={invoice.dueDate}>{formatFrenchDate(invoice.dueDate)}</time>
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm" role="table" aria-label="Lignes de facture">
              <thead className="border-b">
                <tr>
                  <th className="text-left py-2" scope="col">Description</th>
                  <th className="text-center py-2" scope="col">Qté</th>
                  <th className="text-right py-2" scope="col">P.U.</th>
                  <th className="text-center py-2" scope="col">TVA %</th>
                  <th className="text-right py-2" scope="col">HT</th>
                  <th className="text-right py-2" scope="col">TVA</th>
                  <th className="text-right py-2" scope="col">TTC</th>
                </tr>
              </thead>
              <tbody>
                {invoice.lines.map((line) => (
                  <tr key={line.id} className="border-b">
                    <td className="py-2">{line.description}</td>
                    <td className="py-2 text-center">{line.quantity}</td>
                    <td className="py-2 text-right">{formatFrenchCurrency(line.unitPrice)}</td>
                    <td className="py-2 text-center">{line.tvaRate}%</td>
                    <td className="py-2 text-right">{formatFrenchCurrency(line.totalHT)}</td>
                    <td className="py-2 text-right">{formatFrenchCurrency(line.totalTVA)}</td>
                    <td className="py-2 text-right font-medium">{formatFrenchCurrency(line.totalTTC)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={4}></td>
                  <td className="py-3 text-right font-medium">{formatFrenchCurrency(invoice.totalHT)}</td>
                  <td className="py-3 text-right font-medium">{formatFrenchCurrency(invoice.totalTVA)}</td>
                  <td className="py-3 text-right font-bold text-primary">{formatFrenchCurrency(invoice.totalTTC)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {(invoice.notes || invoice.terms) && (
            <div className="space-y-2">
              {invoice.notes && (
                <div>
                  <h4 className="text-sm font-medium">Notes</h4>
                  <p className="text-sm text-muted-foreground">{invoice.notes}</p>
                </div>
              )}
              {invoice.terms && (
                <div>
                  <h4 className="text-sm font-medium">Conditions</h4>
                  <p className="text-sm text-muted-foreground">{invoice.terms}</p>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2 border-t pt-4">
            {invoice.status === 'draft' && (
              <>
                <Button onClick={onEdit}>Modifier</Button>
                <Button onClick={onSend}>Envoyer</Button>
              </>
            )}
            {invoice.status === 'sent' && (
              <>
                <Button onClick={onPay}>Payer</Button>
                <Button variant="outline" onClick={onDownload}>Télécharger PDF</Button>
              </>
            )}
            {invoice.status === 'paid' && (
              <Button variant="outline" onClick={onDownload}>Télécharger PDF</Button>
            )}
            {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
              <Button variant="destructive" onClick={onCancel}>Annuler</Button>
            )}
            <Button variant="ghost" onClick={onDelete} className="text-destructive">Supprimer</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
