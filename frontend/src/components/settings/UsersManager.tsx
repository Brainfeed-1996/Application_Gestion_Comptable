'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { User, UserRole } from '@/types/user';

interface UsersManagerProps {
  users?: User[];
}

const ROLES: UserRole[] = ['admin', 'accountant', 'viewer', 'client'];
const MOCK_USERS: User[] = [
  { id: '1', email: 'admin@company.com', name: 'Admin', role: 'admin', isActive: true, createdAt: '2026-01-01' },
  { id: '2', email: 'acc@company.com', name: 'Comptable', role: 'accountant', isActive: true, createdAt: '2026-02-01' },
  { id: '3', email: 'view@company.com', name: 'Vue', role: 'viewer', isActive: true, createdAt: '2026-03-01' },
];

export function UsersManager({ users }: UsersManagerProps) {
  const [search, setSearch] = useState('');
  const [userList, setUserList] = useState<User[]>(users || MOCK_USERS);
  const [showInvite, setShowInvite] = useState(false);

  const filtered = userList.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleRoleChange = (id: string, role: UserRole) => {
    setUserList((prev) =>
      prev.map((u) => (u.id === id ? { ...u, role } : u))
    );
  };

  const toggleActive = (id: string) => {
    setUserList((prev) =>
      prev.map((u) => (u.id === id ? { ...u, isActive: !u.isActive } : u))
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Utilisateurs</h2>
        <Button onClick={() => setShowInvite(true)}>Inviter</Button>
      </div>

      {showInvite && (
        <Card>
          <CardHeader><CardTitle>Inviter un utilisateur</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <InviteForm onClose={() => setShowInvite(false)} />
          </CardContent>
        </Card>
      )}

      <div className="flex gap-2">
        <Input
          placeholder="Rechercher..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
          aria-label="Rechercher un utilisateur"
        />
        <Select aria-label="Filtrer par rôle">
          <option value="all">Tous rôles</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </Select>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm" role="table" aria-label="Liste des utilisateurs">
              <thead className="border-b">
                <tr>
                  <th className="text-left py-2" scope="col">Utilisateur</th>
                  <th className="text-left py-2" scope="col">Email</th>
                  <th className="text-left py-2" scope="col">Rôle</th>
                  <th className="text-left py-2" scope="col">Statut</th>
                  <th className="text-right py-2" scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-accent">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <Avatar fallback={user.name.charAt(0)} size="sm" />
                        <span className="font-medium">{user.name}</span>
                      </div>
                    </td>
                    <td className="py-3">{user.email}</td>
                    <td className="py-3">
                      <Select
                        value={user.role}
                        onValueChange={(v) => handleRoleChange(user.id, v as UserRole)}
                        aria-label={`Rôle de ${user.name}`}
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </Select>
                    </td>
                    <td className="py-3">
                      <Badge variant={user.isActive ? 'success' : 'secondary'}>
                        {user.isActive ? 'Actif' : 'Inactif'}
                      </Badge>
                    </td>
                    <td className="py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleActive(user.id)}
                        aria-label={user.isActive ? `Désactiver ${user.name}` : `Activer ${user.name}`}
                      >
                        {user.isActive ? '🔒' : '🔓'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function InviteForm({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('viewer');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="invite-email">Email *</Label>
        <Input id="invite-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="invite-role">Rôle</Label>
        <Select value={role} onValueChange={(v) => setRole(v as UserRole)} aria-label="Rôle">
          <option value="admin">Admin</option>
          <option value="accountant">Comptable</option>
          <option value="viewer">Vue</option>
          <option value="client">Client</option>
        </Select>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
        <Button type="submit">Envoyer l'invitation</Button>
      </div>
    </form>
  );
}
