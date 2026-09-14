'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Search, Filter, ChevronDown } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { formatFrenchCurrency, formatFrenchDate } from '@/lib/formatters';
import type { Invoice, InvoiceStatus } from '@/types/invoice';

const STATUS_VARIANTS: Record<InvoiceStatus, 'default' | 'secondary' | 'destructive' | 'success' | 'warning' | 'info'> = {
  draft: 'default',
  sent: 'info',
  paid: 'success',
  cancelled: 'destructive',
  overdue: 'warning',
};

const STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft: 'Brouillon',
  sent: 'Envoyée',
  paid: 'Payée',
  cancelled: 'Annulée',
  overdue: 'En retard',
};

interface InvoiceFilters {
  search?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

async function fetchInvoices(filters: InvoiceFilters) {
  const params = new URLSearchParams();
  if (filters.page) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));
  if (filters.search) params.set('search', filters.search);
  if (filters.status && filters.status !== 'all') params.set('status', filters.status);
  if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
  if (filters.dateTo) params.set('dateTo', filters.dateTo);

  const query = params.toString();
  return apiClient
    .get<{ items: Invoice[]; total: number; page: number; limit: number; totalPages: number }>(
      `/invoices${query ? `?${query}` : ''}`,
    )
    .then((r) => r.data);
}

export default function InvoicesPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['invoices', search, statusFilter, dateFrom, dateTo, currentPage],
    queryFn: () =>
      fetchInvoices({
        search,
        status: statusFilter,
        dateFrom,
        dateTo,
        page: currentPage,
        limit: 10,
      }),
  });

  const invoices = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;
  const totalItems = data?.total ?? 0;

  const handleRowClick = (invoice: Invoice) => {
    router.push(`/invoices/${invoice.id}`);
  };

  const handleNewInvoice = () => {
    router.push('/invoices/new');
  };

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setDateFrom('');
    setDateTo('');
    setCurrentPage(1);
  };

  const hasActiveFilters = search || statusFilter !== 'all' || dateFrom || dateTo;

  if (isError) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold">Factures</h2>
            <p className="text-muted-foreground">Gérez vos factures</p>
          </div>
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <p className="text-destructive mb-4">Erreur lors du chargement des factures</p>
                <p className="text-muted-foreground mb-4">{error instanceof Error ? error.message : 'Erreur inconnue'}</p>
                <Button onClick={() => window.location.reload()}>Réessayer</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Factures</h2>
            <p className="text-muted-foreground">Gérez vos factures</p>
          </div>
          <Link href="/invoices/new">
            <Button>
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nouvelle facture
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">Liste des factures</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-1"
            >
              <Filter className="h-4 w-4" />
              Filtres
              <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </Button>
          </CardHeader>
          <CardContent className="pt-0">
            <div className={`space-y-4 ${showFilters ? '' : 'hidden'}`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher client ou numéro..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-10"
                    aria-label="Rechercher par client ou numéro de facture"
                  />
                </div>
                <Select
                  value={statusFilter}
                  onValueChange={(value) => {
                    setStatusFilter(value);
                    setCurrentPage(1);
                  }}
                  aria-label="Filtrer par statut"
                >
                  <option value="all">Tous statuts</option>
                  <option value="draft">Brouillon</option>
                  <option value="sent">Envoyée</option>
                  <option value="paid">Payée</option>
                  <option value="overdue">En retard</option>
                  <option value="cancelled">Annulée</option>
                </Select>
                <div>
                  <Label htmlFor="dateFrom" className="block text-sm font-medium mb-1">
                    Date de début
                  </Label>
                  <Input
                    id="dateFrom"
                    type="date"
                    value={dateFrom}
                    onChange={(e) => {
                      setDateFrom(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full"
                  />
                </div>
                <div className="flex items-end">
                  <Label htmlFor="dateTo" className="block text-sm font-medium mb-1 w-full">
                    Date de fin
                  </Label>
                  <Input
                    id="dateTo"
                    type="date"
                    value={dateTo}
                    onChange={(e) => {
                      setDateTo(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full"
                  />
                </div>
              </div>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-sm">
                  Effacer les filtres
                </Button>
              )}
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : invoices.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Aucune facture trouvée</p>
                {hasActiveFilters && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Essayez de modifier vos filtres
                  </p>
                )}
              </div>
            ) : (
              <>
                <div className="rounded-md border overflow-x-auto">
                  <table className="w-full text-sm" role="table" aria-label="Factures">
                    <thead className="bg-muted">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium" scope="col">Numéro</th>
                        <th className="px-4 py-3 text-left font-medium" scope="col">Client</th>
                        <th className="px-4 py-3 text-left font-medium" scope="col">Date</th>
                        <th className="px-4 py-3 text-left font-medium" scope="col">Échéance</th>
                        <th className="px-4 py-3 text-right font-medium" scope="col">Total</th>
                        <th className="px-4 py-3 text-left font-medium" scope="col">Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map((inv) => (
                        <tr
                          key={inv.id}
                          className="border-t hover:bg-accent cursor-pointer transition-colors"
                          onClick={() => handleRowClick(inv)}
                        >
                          <td className="px-4 py-3 font-medium">{inv.invoice_number}</td>
                          <td className="px-4 py-3">{inv.client_name}</td>
                          <td className="px-4 py-3">
                            <time dateTime={inv.issue_date}>{formatFrenchDate(inv.issue_date)}</time>
                          </td>
                          <td className="px-4 py-3">
                            <time dateTime={inv.due_date}>{formatFrenchDate(inv.due_date)}</time>
                          </td>
                          <td className="px-4 py-3 text-right font-medium">
                            {formatFrenchCurrency(inv.total)}
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={STATUS_VARIANTS[inv.status]}>
                              {STATUS_LABELS[inv.status]}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-muted-foreground">
                      Page {currentPage} sur {totalPages} ({totalItems} factures au total)
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        Précédent
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Suivant
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}