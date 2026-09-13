'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatFrenchCurrency, formatFrenchDate } from '@/lib/formatters';
import type { ClientFull } from '@/services/clients.service';
import { Invoice } from '@/types/invoice';
import { Transaction } from '@/types/transaction';

interface ClientsTableProps {
  clients: ClientFull[];
  isLoading?: boolean;
  onCreate?: () => void;
  onView?: (client: ClientFull) => void;
}

export function ClientsTable({ clients, isLoading, onCreate, onView }: ClientsTableProps) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return clients;
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase())
    );
  }, [clients, search]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Rechercher un client..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
          aria-label="Rechercher un client"
        />
        <Button onClick={onCreate}>+ Ajouter un client</Button>
      </div>

      <div className="rounded-md border">
        <table className="w-full text-sm" role="table" aria-label="Clients">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-3 text-left font-medium" scope="col">Nom</th>
              <th className="px-4 py-3 text-left font-medium" scope="col">Email</th>
              <th className="px-4 py-3 text-right font-medium" scope="col">Solde</th>
              <th className="px-4 py-3 text-left font-medium" scope="col">Statut</th>
              <th className="px-4 py-3 text-left font-medium" scope="col">Créé</th>
              <th className="px-4 py-3 text-right font-medium" scope="col"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center">Chargement...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Aucun client</td></tr>
            ) : (
              filtered.map((client) => (
                <tr
                  key={client.id}
                  className="border-t cursor-pointer hover:bg-accent"
                  onClick={() => onView?.(client)}
                  tabIndex={0}
                  role="button"
                  onKeyDown={(e) => { if (e.key === 'Enter') onView?.(client); }}
                  aria-label={`Voir ${client.name}`}
                >
                  <td className="px-4 py-3 font-medium">{client.name}</td>
                  <td className="px-4 py-3">{client.email}</td>
                  <td className={cn('px-4 py-3 text-right font-medium', client.balance >= 0 ? 'text-green-600' : 'text-red-600')}>
                    {formatFrenchCurrency(client.balance)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={client.status === 'active' ? 'success' : 'secondary'}>{client.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{formatFrenchDate(client.createdAt)}</td>
                  <td className="px-4 py-3"></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
