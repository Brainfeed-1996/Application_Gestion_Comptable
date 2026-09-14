'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { useTheme } from '@/providers/theme-provider';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { z } from 'zod';

const THEME_OPTIONS = [
  { value: 'light', label: 'Clair', icon: '☀️' },
  { value: 'dark', label: 'Sombre', icon: '🌙' },
  { value: 'system', label: 'Système', icon: '🖥️' },
];

const COLOR_OPTIONS = [
  { value: '#3b82f6', label: 'Bleu', class: 'bg-blue-500' },
  { value: '#6366f1', label: 'Indigo', class: 'bg-indigo-500' },
  { value: '#8b5cf6', label: 'Violet', class: 'bg-violet-500' },
  { value: '#ec4899', label: 'Rose', class: 'bg-pink-500' },
  { value: '#ef4444', label: 'Rouge', class: 'bg-red-500' },
  { value: '#f59e0b', label: 'Ambre', class: 'bg-amber-500' },
  { value: '#10b981', label: 'Émeraude', class: 'bg-emerald-500' },
  { value: '#06b6d4', label: 'Cyan', class: 'bg-cyan-500' },
];

const themeSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']),
  primaryColor: z.string(),
});

export function ThemeSettings() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  const [selectedTheme, setSelectedTheme] = useState(theme);
  const [primaryColor, setPrimaryColor] = useState('#3b82f6');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const validate = (): boolean => {
    const result = themeSchema.safeParse({ theme: selectedTheme, primaryColor });
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        const path = err.path.join('.');
        newErrors[path] = err.message;
      });
      setErrors(newErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const handleThemeChange = (value: string) => {
    setSelectedTheme(value as typeof selectedTheme);
    setTheme(value as 'light' | 'dark');
  };

  const handleSave = async () => {
    if (!validate()) return;
    setIsSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsSaving(false);
      setSaved(true);
      toast.success('Thème enregistré avec succès');
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setIsSaving(false);
      toast.error('Erreur lors de l\'enregistrement du thème');
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-2xl font-bold">Apparence</h2>

      <Card>
        <CardHeader>
          <CardTitle>Thème</CardTitle>
          <CardDescription>Choisissez le mode d'affichage de l'application</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base font-medium">Mode sombre</Label>
                <p className="text-sm text-muted-foreground">
                  {selectedTheme === 'system'
                    ? 'Utilise le thème du système'
                    : selectedTheme === 'dark'
                      ? 'Thème sombre activé'
                      : 'Thème clair activé'}
                </p>
              </div>
              <ThemeToggle />
            </div>

            <div className="space-y-2">
              <Label>Choix du thème</Label>
              <div className="grid grid-cols-3 gap-3">
                {THEME_OPTIONS.map((option) => (
                  <Button
                    key={option.value}
                    variant={selectedTheme === option.value ? 'primary' : 'outline'}
                    onClick={() => handleThemeChange(option.value)}
                    className={cn(
                      selectedTheme === option.value && 'bg-blue-600 text-white hover:bg-blue-700',
                    )}
                  >
                    <span className="mr-2" aria-hidden="true">{option.icon}</span>
                    {option.label}
                  </Button>
                ))}
              </div>
              {errors.theme && <p className="text-xs text-destructive">{errors.theme}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Couleur principale</CardTitle>
          <CardDescription>Personnalisez la couleur d'accentuation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div
                className="h-12 w-12 rounded-lg border-2 shadow-sm"
                style={{ backgroundColor: primaryColor }}
                aria-label={`Couleur sélectionnée: ${primaryColor}`}
              />
              <div className="space-y-1">
                <Label className="text-base font-medium">Couleur primaire</Label>
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="h-8 w-20 cursor-pointer rounded border border-input"
                  aria-label="Sélecteur de couleur"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Préréglages</Label>
              <div className="flex flex-wrap gap-3">
                {COLOR_OPTIONS.map((color) => (
                  <Button
                    key={color.value}
                    variant="outline"
                    size="sm"
                    onClick={() => setPrimaryColor(color.value)}
                    className={cn(
                      primaryColor === color.value && 'border-blue-600 ring-2 ring-blue-600 ring-offset-2',
                    )}
                    aria-label={`Couleur ${color.label}`}
                  >
                    <span className={cn('mr-2 h-3 w-3 rounded-full', color.class)} />
                    {color.label}
                  </Button>
                ))}
              </div>
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
