'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { z } from 'zod';

const profileSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  email: z.string().email('Email invalide'),
  phone: z.string().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Mot de passe actuel requis'),
  newPassword: z.string().min(8, 'Au moins 8 caractères'),
  confirmPassword: z.string().min(1, 'Confirmation requise'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

type ProfileErrors = Partial<Record<keyof typeof profileSchema.shape, string>>;
type PasswordErrors = Partial<Record<string, string>>;

export function ProfileSettingsForm() {
  const { toast } = useToast();
  const [profile, setProfile] = useState({
    name: 'Jean Dupont',
    email: 'jean@company.com',
    phone: '+33 6 12 34 56 78',
  });
  const [avatarSrc, setAvatarSrc] = useState<string>('');
  const [profileErrors, setProfileErrors] = useState<ProfileErrors>({});

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState<PasswordErrors>({});
  const [showPasswordSection, setShowPasswordSection] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const validateProfile = (): boolean => {
    const result = profileSchema.safeParse(profile);
    if (!result.success) {
      const errors: ProfileErrors = {};
      result.error.errors.forEach((err) => {
        const key = err.path[0] as keyof ProfileErrors;
        errors[key] = err.message;
      });
      setProfileErrors(errors);
      return false;
    }
    setProfileErrors({});
    return true;
  };

  const validatePassword = (): boolean => {
    const result = passwordSchema.safeParse(passwordData);
    if (!result.success) {
      const errors: PasswordErrors = {};
      result.error.errors.forEach((err) => {
        const key = err.path[0] as string;
        errors[key] = err.message;
      });
      setPasswordErrors(errors);
      return false;
    }
    setPasswordErrors({});
    return true;
  };

  const handleProfileSave = async () => {
    if (!validateProfile()) return;
    setIsSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsSaving(false);
      setSaved(true);
      toast.success('Profil mis à jour avec succès');
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setIsSaving(false);
      toast.error('Erreur lors de la mise à jour du profil');
    }
  };

  const handlePasswordSave = async () => {
    if (!validatePassword()) return;
    setIsSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsSaving(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Mot de passe modifié avec succès');
      setShowPasswordSection(false);
    } catch {
      setIsSaving(false);
      toast.error('Erreur lors du changement de mot de passe');
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner un fichier image');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Le fichier doit être inférieur à 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarSrc(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-2xl font-bold">Profil</h2>

      <Card>
        <CardHeader>
          <CardTitle>Informations personnelles</CardTitle>
          <CardDescription>Vos informations de profil</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar src={avatarSrc || undefined} fallback={profile.name.charAt(0)} size="xl" />
            <div>
              <div className="flex items-center gap-2">
                <Button variant="outline" className="mb-2">Changer la photo</Button>
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={handleAvatarUpload}
                    aria-label="Télécharger une photo de profil"
                  />
                </label>
              </div>
              <p className="text-xs text-muted-foreground">PNG, JPG max 2MB</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="profile-name">Nom *</Label>
            <Input
              id="profile-name"
              value={profile.name}
              onChange={(e) => {
                setProfile({ ...profile, name: e.target.value });
                if (profileErrors.name) setProfileErrors((prev) => ({ ...prev, name: undefined }));
              }}
              className={cn(profileErrors.name && 'border-destructive')}
            />
            {profileErrors.name && <p className="text-xs text-destructive">{profileErrors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="profile-email">Email *</Label>
            <Input
              id="profile-email"
              type="email"
              value={profile.email}
              onChange={(e) => {
                setProfile({ ...profile, email: e.target.value });
                if (profileErrors.email) setProfileErrors((prev) => ({ ...prev, email: undefined }));
              }}
              className={cn(profileErrors.email && 'border-destructive')}
            />
            {profileErrors.email && <p className="text-xs text-destructive">{profileErrors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="profile-phone">Téléphone</Label>
            <Input
              id="profile-phone"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mot de passe</CardTitle>
          <CardDescription>Changez votre mot de passe</CardDescription>
        </CardHeader>
        <CardContent>
          {!showPasswordSection ? (
            <Button variant="outline" onClick={() => setShowPasswordSection(true)}>
              Changer le mot de passe
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="profile-current-password">Mot de passe actuel *</Label>
                <Input
                  id="profile-current-password"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => {
                    setPasswordData({ ...passwordData, currentPassword: e.target.value });
                    if (passwordErrors.currentPassword) setPasswordErrors((prev) => ({ ...prev, currentPassword: undefined }));
                  }}
                  className={cn(passwordErrors.currentPassword && 'border-destructive')}
                />
                {passwordErrors.currentPassword && <p className="text-xs text-destructive">{passwordErrors.currentPassword}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="profile-new-password">Nouveau mot de passe *</Label>
                <Input
                  id="profile-new-password"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => {
                    setPasswordData({ ...passwordData, newPassword: e.target.value });
                    if (passwordErrors.newPassword) setPasswordErrors((prev) => ({ ...prev, newPassword: undefined }));
                  }}
                  className={cn(passwordErrors.newPassword && 'border-destructive')}
                />
                {passwordErrors.newPassword && <p className="text-xs text-destructive">{passwordErrors.newPassword}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="profile-confirm-password">Confirmer le mot de passe *</Label>
                <Input
                  id="profile-confirm-password"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => {
                    setPasswordData({ ...passwordData, confirmPassword: e.target.value });
                    if (passwordErrors.confirmPassword) setPasswordErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                  }}
                  className={cn(passwordErrors.confirmPassword && 'border-destructive')}
                />
                {passwordErrors.confirmPassword && <p className="text-xs text-destructive">{passwordErrors.confirmPassword}</p>}
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => { setShowPasswordSection(false); setPasswordErrors({}); }}>
                  Annuler
                </Button>
                <Button onClick={handlePasswordSave} isLoading={isSaving}>
                  Enregistrer
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        {saved && <span className="text-green-600 self-center">✓ Enregistré</span>}
        <Button variant="outline">Annuler</Button>
        <Button onClick={handleProfileSave} isLoading={isSaving}>
          Enregistrer
        </Button>
      </div>
    </div>
  );
}
