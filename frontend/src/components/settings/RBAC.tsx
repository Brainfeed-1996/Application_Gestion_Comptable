'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/types/user';

interface PermissionCell {
  role: UserRole;
  permission: string;
  allowed: boolean;
}

const ROLES: UserRole[] = ['admin', 'accountant', 'viewer', 'client'];

const PERMISSIONS = [
  { key: 'transactions:read', label: 'Transactions - Lecture', category: 'transactions' },
  { key: 'transactions:create', label: 'Transactions - Création', category: 'transactions' },
  { key: 'transactions:update', label: 'Transactions - Modification', category: 'transactions' },
  { key: 'transactions:delete', label: 'Transactions - Suppression', category: 'transactions' },
  { key: 'invoices:read', label: 'Factures - Lecture', category: 'invoices' },
  { key: 'invoices:create', label: 'Factures - Création', category: 'invoices' },
  { key: 'invoices:update', label: 'Factures - Modification', category: 'invoices' },
  { key: 'invoices:delete', label: 'Factures - Suppression', category: 'invoices' },
  { key: 'clients:read', label: 'Clients - Lecture', category: 'clients' },
  { key: 'clients:create', label: 'Clients - Création', category: 'clients' },
  { key: 'clients:update', label: 'Clients - Modification', category: 'clients' },
  { key: 'clients:delete', label: 'Clients - Suppression', category: 'clients' },
  { key: 'reports:read', label: 'Rapports - Lecture', category: 'reports' },
  { key: 'settings:read', label: 'Paramètres - Lecture', category: 'settings' },
  { key: 'settings:update', label: 'Paramètres - Modification', category: 'settings' },
  { key: 'users:manage', label: 'Utilisateurs - Gestion', category: 'users' },
  { key: 'rbac:manage', label: 'RBAC - Gestion', category: 'rbac' },
];

export function RBACMatrix() {
  const [cells, setCells] = useState<PermissionCell[]>(() => {
    const result: PermissionCell[] = [];
    ROLES.forEach((role) => {
      PERMISSIONS.forEach((p) => {
        const adminPerms = [
          'transactions:read', 'transactions:create', 'transactions:update', 'transactions:delete',
          'invoices:read', 'invoices:create', 'invoices:update', 'invoices:delete',
          'clients:read', 'clients:create', 'clients:update', 'clients:delete',
          'reports:read', 'settings:read', 'settings:update',
          'users:manage', 'rbac:manage',
        ];
        const accountantPerms = [
          'transactions:read', 'transactions:create', 'transactions:update',
          'invoices:read', 'invoices:create', 'invoices:update',
          'clients:read', 'clients:create', 'clients:update',
          'reports:read', 'settings:read',
        ];
        const viewerPerms = ['transactions:read', 'invoices:read', 'clients:read', 'reports:read'];
        const clientPerms = ['invoices:read', 'clients:read'];

        let allowed = false;
        if (role === 'admin') allowed = adminPerms.includes(p.key);
        else if (role === 'accountant') allowed = accountantPerms.includes(p.key);
        else if (role === 'viewer') allowed = viewerPerms.includes(p.key);
        else if (role === 'client') allowed = clientPerms.includes(p.key);

        result.push({ role, permission: p.key, allowed });
      });
    });
    return result;
  });

  const [saved, setSaved] = useState(false);

  const toggleCell = (role: UserRole, permission: string) => {
    setCells((prev) =>
      prev.map((c) =>
        c.role === role && c.permission === permission ? { ...c, allowed: !c.allowed } : c
      )
    );
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
  };

  const categories = Array.from(new Set(PERMISSIONS.map((p) => p.category)));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Matrice RBAC</h2>
        <div className="flex items-center gap-2">
          {saved && <span className="text-green-600">✓ Enregistré</span>}
          <Button onClick={handleSave}>Enregistrer</Button>
        </div>
      </div>

      {categories.map((category) => {
        const perms = PERMISSIONS.filter((p) => p.category === category);
        return (
          <Card key={category}>
            <CardHeader><CardTitle>{category.charAt(0).toUpperCase() + category.slice(1)}</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm" role="table" aria-label={`Permissions ${category}`}>
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-2" scope="col">Permission</th>
                      {ROLES.map((role) => (
                        <th key={role} className="text-center py-2 px-2 capitalize" scope="col">{role}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {perms.map((perm) => (
                      <tr key={perm.key} className="border-b">
                        <td className="py-2 px-2 text-sm">{perm.label}</td>
                        {ROLES.map((role) => {
                          const cell = cells.find((c) => c.role === role && c.permission === perm.key);
                          return (
                            <td key={role} className="py-2 px-2 text-center">
                              <button
                                onClick={() => toggleCell(role, perm.key)}
                                className={cn(
                                  'h-6 w-6 rounded border transition-colors focus:outline-none focus:ring-2 focus:ring-ring',
                                  cell?.allowed
                                    ? 'bg-primary border-primary'
                                    : 'bg-background border-input'
                                )}
                                role="checkbox"
                                aria-checked={cell?.allowed}
                                aria-label={`${role} - ${perm.label}`}
                              >
                                {cell?.allowed && (
                                  <svg className="h-4 w-4 text-white mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                    <polyline points="20 6 9 17 4 12" />
                                  </svg>
                                )}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
