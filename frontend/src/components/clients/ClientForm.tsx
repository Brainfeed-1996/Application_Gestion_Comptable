'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { formatFrenchCurrency } from '@/lib/formatters';

interface ClientFormProps {
  onSubmit: (data: {
    name: string;
    email: string;
    address?: string;
    city?: string;
    postalCode?: string;
    country?: string;
    vatNumber?: string;
    siret?: string;
  }) => void;
  onCancel: () => void;
  initialData?: Record<string, string>;
}

export function ClientForm({ onSubmit, onCancel, initialData }: ClientFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
    vatNumber: '',
    siret: '',
    ...initialData,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Le nom est requis';
    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }
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
        <CardHeader><CardTitle>Informations client</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="c-name">Nom *</Label>
            <Input
              id="c-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              aria-invalid={!!errors.name}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="c-email">Email *</Label>
            <Input
              id="c-email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              aria-invalid={!!errors.email}
            />
            {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="c-address">Adresse</Label>
              <Input id="c-address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-city">Ville</Label>
              <Input id="c-city" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-postal">Code postal</Label>
              <Input id="c-postal" value={formData.postalCode} onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-country">Pays</Label>
              <Input id="c-country" value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="c-vat">N° TVA</Label>
              <Input id="c-vat" value={formData.vatNumber} onChange={(e) => setFormData({ ...formData, vatNumber: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-siret">SIRET</Label>
              <Input id="c-siret" value={formData.siret} onChange={(e) => setFormData({ ...formData, siret: e.target.value })} />
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Annuler</Button>
        <Button type="submit">Ajouter</Button>
      </div>
    </form>
  );
}
