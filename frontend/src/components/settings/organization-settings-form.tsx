'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { z } from 'zod';
import type { Organization } from '@/types/organization';

const organizationSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  businessType: z.string().min(1, 'Le type d\'entreprise est requis'),
  description: z.string().optional(),
  address: z.string().optional(),
  siret: z.string().optional(),
  vat: z.string().optional(),
});

const BUSINESS_TYPES = [
  { value: 'sarl', label: 'SARL' },
  { value: 'sa', label: 'SA' },
  { value: 'sasu', label: 'SASU' },
  { value: 'scp', label: 'SCP' },
  { value: 'eurl', label: 'EURL' },
  { value: 'autoentrepreneur', label: 'Auto-entrepreneur' },
  { value: 'autre', label: 'Autre' },
];

type OrgErrors = Partial<Record<keyof typeof organizationSchema.shape, string>>;

interface OrganizationSettingsFormProps {
  organization?: Organization;
}

export function OrganizationSettingsForm({ organization }: OrganizationSettingsFormProps) {
  const { toast } = useToast();

  const defaultOrg: Organization = {
    id: '1',
    name: 'Mon Entreprise',
    business_type: 'sarl',
    description: '',
    is_active: true,
    is_default: true,
  };

  const org = organization || defaultOrg;
  const [data, setData] = useState({
    name: org.name,
    businessType: org.business_type,
    description: org.description ?? '',
    address: '',
    siret: '',
    vat: '',
  });
  const [errors, setErrors] = useState<OrgErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const validate = (): boolean => {
    const result = organizationSchema.safeParse(data);
    if (!result.success) {
      const orgErrors: OrgErrors = {};
      result.error.errors.forEach((err) => {
        const key = err.path[0] as keyof OrgErrors;
        orgErrors[key] = err.message;
      });
      setErrors(orgErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setIsSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsSaving(false);
      setSaved(true);
      toast.success('Paramètres de l\'entreprise enregistrés');
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setIsSaving(false);
      toast.error('Erreur lors de l\'enregistrement');
    }
  };

  const updateField = <K extends keyof typeof data>(field: K, value: typeof data[K]) => {
    setData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-2xl font-bold">Paramètres de l'entreprise</h2>

      <Card>
        <CardHeader>
          <CardTitle>Informations</CardTitle>
          <CardDescription>Informations de base de votre entreprise</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="org-name">Nom de l'entreprise *</Label>
            <Input
              id="org-name"
              value={data.name}
              onChange={(e) => updateField('name', e.target.value)}
              className={cn(errors.name && 'border-destructive')}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="org-business-type">Type d'entreprise *</Label>
            <Select
              id="org-business-type"
              value={data.businessType}
              onValueChange={(v) => updateField('businessType', v)}
            >
              {BUSINESS_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="org-description">Description</Label>
            <Input
              id="org-description"
              value={data.description}
              onChange={(e) => updateField('description', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="org-address">Adresse</Label>
            <Input
              id="org-address"
              value={data.address}
              onChange={(e) => updateField('address', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="org-siret">SIRET</Label>
              <Input
                id="org-siret"
                value={data.siret}
                onChange={(e) => updateField('siret', e.target.value)}
                placeholder="12 345 678 901 234"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="org-vat">N° TVA</Label>
              <Input
                id="org-vat"
                value={data.vat}
                onChange={(e) => updateField('vat', e.target.value)}
                placeholder="FR12345678901"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        {saved && <span className="text-green-600 self-center">✓ Enregistré</span>}
        <Button variant="outline">Annuler</Button>
        <Button onClick={handleSave} isLoading={isSaving}>
          Enregistrer
        </Button>
      </div>
    </div>
  );
}
