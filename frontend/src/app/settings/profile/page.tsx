'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar } from '@/components/ui/avatar';

interface ProfileFormData {
  name: string;
  email: string;
  phone: string;
  avatar: string;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();

  const [formData, setFormData] = useState<ProfileFormData>({
    name: user?.name ?? '',
    email: user?.email ?? '',
    phone: '',
    avatar: user?.avatar ?? '',
  });
  const [passwordData, setPasswordData] = useState<PasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
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
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name ?? prev.name,
        email: user.email ?? prev.email,
        avatar: user.avatar ?? prev.avatar,
      }));
    }
  }, [user]);

  if (isLoading || !isAuthenticated) {
    return <div>Chargement...</div>;
  }

  const validateProfile = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est requis';
    }
    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);
    if (!validateProfile()) return;
    setIsSubmitting(true);
    try {
      setSuccess('Profil enregistré avec succès');
      setTimeout(() => setSuccess(null), 3000);
    } catch {
      setErrors({ submit: "Erreur lors de l'enregistrement" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);
    const newErrors: Record<string, string> = {};
    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Le mot de passe actuel est requis';
    }
    if (!passwordData.newPassword) {
      newErrors.newPassword = 'Le nouveau mot de passe est requis';
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = 'Le mot de passe doit contenir au moins 8 caractères';
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }
    setErrors((prev) => ({ ...prev, currentPassword: newErrors.currentPassword, newPassword: newErrors.newPassword, confirmPassword: newErrors.confirmPassword }));

    if (Object.keys(newErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      setSuccess('Mot de passe modifié avec succès');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setSuccess(null), 3000);
    } catch {
      setErrors({ passwordSubmit: 'Erreur lors du changement de mot de passe' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof ProfileFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as string]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handlePasswordChange = (field: keyof PasswordFormData, value: string) => {
    setPasswordData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as string]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold">Profil</h1>
          <p className="text-sm text-muted-foreground">Gérez vos informations personnelles</p>
        </div>

        {success && (
          <div className="rounded-md bg-green-50 p-4 text-sm text-green-600">{success}</div>
        )}
        {(errors.submit || errors.passwordSubmit) && (
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-600">
            {errors.submit || errors.passwordSubmit}
          </div>
        )}

        <form onSubmit={handleProfileSave} noValidate>
          <Card>
            <CardHeader>
              <CardTitle>Informations personnelles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar size="xl" src={formData.avatar || undefined} fallback={formData.name.charAt(0) || 'U'} />
                <div className="space-y-1">
                  <Button variant="outline" size="sm" type="button">
                    Changer l'avatar
                  </Button>
                  <p className="text-xs text-muted-foreground">PNG, JPG max 2MB</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="profile-name">Nom *</Label>
                <Input
                  id="profile-name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  aria-invalid={!!errors.name}
                  required
                />
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="profile-email">Email *</Label>
                <Input
                  id="profile-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  aria-invalid={!!errors.email}
                  required
                />
                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="profile-phone">Téléphone</Label>
                <Input
                  id="profile-phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="06 12 34 56 78"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="profile-avatar">URL de l'avatar</Label>
                <Input
                  id="profile-avatar"
                  value={formData.avatar}
                  onChange={(e) => handleChange('avatar', e.target.value)}
                  placeholder="https://exemple.com/avatar.png"
                />
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

        <Card>
          <CardHeader>
            <CardTitle>Mot de passe</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSave} className="space-y-4" noValidate>
              <div className="space-y-2">
                <Label htmlFor="password-current">Mot de passe actuel *</Label>
                <Input
                  id="password-current"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                  aria-invalid={!!errors.currentPassword}
                  required
                />
                {errors.currentPassword && <p className="text-xs text-destructive">{errors.currentPassword}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password-new">Nouveau mot de passe *</Label>
                <Input
                  id="password-new"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                  aria-invalid={!!errors.newPassword}
                  required
                />
                {errors.newPassword && <p className="text-xs text-destructive">{errors.newPassword}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password-confirm">Confirmer le mot de passe *</Label>
                <Input
                  id="password-confirm"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                  aria-invalid={!!errors.confirmPassword}
                  required
                />
                {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" isLoading={isSubmitting}>
                  Changer le mot de passe
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
