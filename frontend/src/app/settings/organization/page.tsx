'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useOrganization } from '@/hooks/use-organization';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Avatar } from '@/components/ui/avatar';

interface OrganizationFormData {
  name: string;
  legalName: string;
  businessType: string;
  description: string;
  siret: string;
  vatNumber: string;
  siren: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
  email: string;
  industry: string;
}

export default function OrganizationPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const { data: organization } = useOrganization();

  const [formData, setFormData] = useState<OrganizationFormData>({
    name: '',
    legalName: '',
    businessType: '',
    description: '',
    siret: '',
    vatNumber: '',
    siren: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
    phone: '',
    email: '',
    industry: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (organization) {
      setFormData({
        name: organization.name ?? '',
        legalName: organization.legalName ?? '',
        businessType: organization.industry ?? '',
        description: '',
        siret: organization.siren ?? '',
        vatNumber: organization.vatNumber ?? '',
        siren: organization.siren ?? '',
        address: organization.address ?? '',
        city: organization.city ?? '',
        postalCode: organization.postalCode ?? '',
        country: organization.country ?? '',
        phone: organization.phone ?? '',
        email: organization.email ?? '',
        industry: organization.industry ?? '',
      });
    }
  }, [organization]);

  if (isLoading || !isAuthenticated) {
    return <div>Chargement...</div>;
  }

  const handleChange = (field: keyof OrganizationFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as string]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = "Le nom de l'entreprise est requis";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      setSuccess('Organisation enregistrée avec succès');
      setTimeout(() => setSuccess(null), 3000);
    } catch {
      setErrors({ submit: "Erreur lors de l'enregistrement de l'organisation" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold">Entreprise</h1>
          <p className="text-sm text-muted-foreground">Informations légales et adresse de votre entreprise</p>
        </div>

        {success && (
          <div className="rounded-md bg-green-50 p-4 text-sm text-green-600">{success}</div>
        )}
        {errors.submit && (
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-600">{errors.submit}</div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <Card>
            <CardHeader>
              <CardTitle>Informations de l'entreprise</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar size="xl" fallback={formData.name.charAt(0) || 'E'} />
                <div className="space-y-1">
                  <Button variant="outline" size="sm" type="button">
                    Changer le logo
                  </Button>
                  <p className="text-xs text-muted-foreground">PNG, JPG max 2MB</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="org-name">Nom de l'entreprise *</Label>
                <Input
                  id="org-name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  aria-invalid={!!errors.name}
                  required
                />
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="org-legal-name">Nom juridique</Label>
                <Input
                  id="org-legal-name"
                  value={formData.legalName}
                  onChange={(e) => handleChange('legalName', e.target.value)}
                  placeholder="Raison sociale complète"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="org-business-type">Type d'activité</Label>
                <Select
                  id="org-business-type"
                  value={formData.businessType}
                  onValueChange={(v) => handleChange('businessType', v)}
                  aria-label="Type d'activité"
                >
                  <option value="">Sélectionner</option>
                  <option value="syndicate">Syndicat</option>
                  <option value="accounting_firm">Cabinet comptable</option>
                  <option value="individual">Entreprise individuelle</option>
                  <option value="sarl">SARL</option>
                  <option value="eurl">EURL</option>
                  <option value="sa">SA</option>
                  <option value="sas">SAS</option>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="org-industry">Secteur d'activité</Label>
                <Select
                  id="org-industry"
                  value={formData.industry}
                  onValueChange={(v) => handleChange('industry', v)}
                  aria-label="Secteur d'activité"
                >
                  <option value="">Sélectionner</option>
                  <option value="accounting">Comptabilité</option>
                  <option value="consulting">Conseil</option>
                  <option value="retail">Commerce de détail</option>
                  <option value="services">Services</option>
                  <option value="manufacturing">Industrie</option>
                  <option value="healthcare">Santé</option>
                  <option value="construction">Construction</option>
                  <option value="technology">Technologie</option>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="org-description">Description</Label>
                <textarea
                  id="org-description"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                  placeholder="Description de votre entreprise"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Coordonnées</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="org-siren">SIREN</Label>
                  <Input
                    id="org-siren"
                    value={formData.siren}
                    onChange={(e) => handleChange('siren', e.target.value)}
                    placeholder="Numéro SIREN"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="org-siret">SIRET *</Label>
                  <Input
                    id="org-siret"
                    value={formData.siret}
                    onChange={(e) => handleChange('siret', e.target.value)}
                    aria-invalid={!!errors.siret}
                    required
                  />
                  {errors.siret && <p className="text-xs text-destructive">{errors.siret}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="org-vat">N° TVA</Label>
                <Input
                  id="org-vat"
                  value={formData.vatNumber}
                  onChange={(e) => handleChange('vatNumber', e.target.value)}
                  placeholder="FRXXXXXXXXXXX"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="org-address">Adresse *</Label>
                <Input
                  id="org-address"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  aria-invalid={!!errors.address}
                  required
                />
                {errors.address && <p className="text-xs text-destructive">{errors.address}</p>}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="org-city">Ville *</Label>
                  <Input
                    id="org-city"
                    value={formData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    aria-invalid={!!errors.city}
                    required
                  />
                  {errors.city && <p className="text-xs text-destructive">{errors.city}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="org-postal">Code postal *</Label>
                  <Input
                    id="org-postal"
                    value={formData.postalCode}
                    onChange={(e) => handleChange('postalCode', e.target.value)}
                    aria-invalid={!!errors.postalCode}
                    required
                  />
                  {errors.postalCode && <p className="text-xs text-destructive">{errors.postalCode}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="org-country">Pays *</Label>
                  <Input
                    id="org-country"
                    value={formData.country}
                    onChange={(e) => handleChange('country', e.target.value)}
                    aria-invalid={!!errors.country}
                    required
                  />
                  {errors.country && <p className="text-xs text-destructive">{errors.country}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="org-phone">Téléphone</Label>
                  <Input
                    id="org-phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="01 23 45 67 89"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="org-email">Email</Label>
                  <Input
                    id="org-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="contact@entreprise.fr"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" type="button" onClick={() => router.push('/settings')}>
              Annuler
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Enregistrer
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
