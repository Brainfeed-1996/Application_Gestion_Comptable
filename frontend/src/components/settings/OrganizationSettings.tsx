'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { Organization } from '@/types/organization';

interface OrganizationSettingsProps {
  organization?: Organization;
}

export function OrganizationSettings({ organization }: OrganizationSettingsProps) {
  const defaultOrg: Organization = {
    id: '1',
    name: 'Mon Entreprise',
    siret: '12345678901234',
    address: '12 Rue de Paris',
    city: 'Paris',
    postalCode: '75001',
    country: 'France',
    currency: 'EUR',
    vatNumber: 'FR12345678901',
  };

  const org = organization || defaultOrg;
  const [data, setData] = useState(org);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-2xl font-bold">Paramètres de l'entreprise</h2>

      <Card>
        <CardHeader><CardTitle>Informations</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar size="xl" fallback={data.name.charAt(0)} />
            <div>
              <Button variant="outline" className="mb-2">Changer le logo</Button>
              <p className="text-xs text-muted-foreground">PNG, JPG max 2MB</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="org-name">Nom de l'entreprise *</Label>
            <Input id="org-name" value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="org-siret">SIRET</Label>
              <Input id="org-siret" value={data.siret} onChange={(e) => setData({ ...data, siret: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="org-vat">N° TVA</Label>
              <Input id="org-vat" value={data.vatNumber} onChange={(e) => setData({ ...data, vatNumber: e.target.value })} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="org-address">Adresse</Label>
            <Input id="org-address" value={data.address} onChange={(e) => setData({ ...data, address: e.target.value })} />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="org-city">Ville</Label>
              <Input id="org-city" value={data.city} onChange={(e) => setData({ ...data, city: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="org-postal">Code postal</Label>
              <Input id="org-postal" value={data.postalCode} onChange={(e) => setData({ ...data, postalCode: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="org-country">Pays</Label>
              <Input id="org-country" value={data.country} onChange={(e) => setData({ ...data, country: e.target.value })} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Devise</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <span className="text-2xl" aria-hidden="true">💶</span>
            <div>
              <p className="font-medium">{data.currency}</p>
              <p className="text-sm text-muted-foreground">Euro (EUR)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        {saved && <span className="text-green-600 self-center">✓ Enregistré</span>}
        <Button variant="outline">Annuler</Button>
        <Button onClick={handleSave}>Enregistrer</Button>
      </div>
    </div>
  );
}
