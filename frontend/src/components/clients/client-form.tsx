'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import type { ClientType } from '@/types/client';

interface ClientFormProps {
  onSubmit: (data: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    siren: string;
    naf: string;
    type: ClientType;
  }) => void;
  onCancel: () => void;
  initialData?: Partial<{
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    siren: string;
    naf: string;
    type: ClientType;
  }>;
  submitLabel?: string;
}

export function ClientForm({
  onSubmit,
  onCancel,
  initialData,
  submitLabel = 'Enregistrer',
}: ClientFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'France',
    siren: '',
    naf: '',
    type: 'customer' as ClientType,
    ...initialData,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Le nom est requis';
    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }
    if (formData.siren && !/^\d{9}$/.test(formData.siren)) {
      newErrors.siren = 'Le SIREN doit contenir 9 chiffres';
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

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Card>
        <CardHeader>
          <CardTitle>Informations client</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="c-name">Nom *</Label>
            <Input
              id="c-name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
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
              onChange={(e) => handleChange('email', e.target.value)}
              aria-invalid={!!errors.email}
            />
            {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="c-phone">Téléphone</Label>
            <Input
              id="c-phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="c-address">Adresse</Label>
            <Input
              id="c-address"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="c-city">Ville</Label>
              <Input
                id="c-city"
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-postal">Code postal</Label>
              <Input
                id="c-postal"
                value={formData.postalCode}
                onChange={(e) => handleChange('postalCode', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-country">Pays</Label>
              <Input
                id="c-country"
                value={formData.country}
                onChange={(e) => handleChange('country', e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="c-siren">SIREN</Label>
              <Input
                id="c-siren"
                value={formData.siren}
                onChange={(e) => handleChange('siren', e.target.value)}
                aria-invalid={!!errors.siren}
                placeholder="123456789"
              />
              {errors.siren && <p className="text-xs text-destructive">{errors.siren}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-naf">Code NAF</Label>
              <Input
                id="c-naf"
                value={formData.naf}
                onChange={(e) => handleChange('naf', e.target.value)}
                placeholder="6201Z"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Type</Label>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  id="c-type"
                  checked={formData.type === 'supplier'}
                  onChange={(e) => handleChange('type', e.target.checked ? 'supplier' : 'customer')}
                  aria-label="Type client"
                />
                <span className="text-sm font-medium">
                  {formData.type === 'supplier' ? 'Fournisseur' : 'Client'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}