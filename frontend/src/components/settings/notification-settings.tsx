'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { z } from 'zod';

type Channel = 'email' | 'push' | 'inapp';
type Category = 'alerts' | 'reminders' | 'updates';

interface NotificationPreference {
  enabled: boolean;
}

interface NotificationSettings {
  [category: string]: {
    [channel: string]: NotificationPreference;
  };
}

const CATEGORIES: { id: Category; label: string }[] = [
  { id: 'alerts', label: 'Alertes' },
  { id: 'reminders', label: 'Rappels' },
  { id: 'updates', label: 'Mises à jour' },
];

const CHANNELS: { id: Channel; label: string }[] = [
  { id: 'email', label: 'Email' },
  { id: 'push', label: 'Push' },
  { id: 'inapp', label: 'In-app' },
];

const settingsSchema = z.object({
  settings: z.record(
    z.string(),
    z.record(
      z.string(),
      z.object({ enabled: z.boolean() })
    )
  ),
});

export function NotificationSettings() {
  const { toast } = useToast();

  const [preferences, setPreferences] = useState<NotificationSettings>(() => {
    const initial: NotificationSettings = {};
    CATEGORIES.forEach((cat) => {
      initial[cat.id] = {};
      CHANNELS.forEach((ch) => {
        initial[cat.id][ch.id] = { enabled: true };
      });
    });
    return initial;
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const togglePreference = (category: Category, channel: Channel) => {
    setPreferences((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [channel]: { enabled: !prev[category][channel].enabled },
      },
    }));
    if (errors[`${category}-${channel}`]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[`${category}-${channel}`];
        return next;
      });
    }
  };

  const handleSave = async () => {
    const result = settingsSchema.safeParse({ settings: preferences });
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        const path = err.path.join('-');
        newErrors[path] = err.message;
      });
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setIsSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsSaving(false);
      setSaved(true);
      toast.success('Préférences de notification enregistrées');
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setIsSaving(false);
      toast.error('Erreur lors de l\'enregistrement');
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <h2 className="text-2xl font-bold">Notifications</h2>

      <Card>
        <CardHeader>
          <CardTitle>Préférences de notification</CardTitle>
          <CardDescription>Gérez comment et quand vous recevez des notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {CATEGORIES.map((category) => (
              <div key={category.id} className="space-y-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold capitalize">{category.label}</h3>
                  <span className="text-xs text-muted-foreground">
                    {CHANNELS.filter((ch) => preferences[category.id][ch.id].enabled).length} canal{CHANNELS.filter((ch) => preferences[category.id][ch.id].enabled).length > 1 ? 's' : ''} activé{CHANNELS.filter((ch) => preferences[category.id][ch.id].enabled).length === 1 ? '' : 's'}
                  </span>
                </div>

                <div className="ml-4 space-y-3 rounded-lg border border-border bg-muted/50 p-4">
                  {CHANNELS.map((channel) => {
                    const isEnabled = preferences[category.id][channel.id].enabled;
                    const errorKey = `${category.id}-${channel.id}`;
                    return (
                      <div key={channel.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Label htmlFor={`${category.id}-${channel.id}`} className="cursor-pointer capitalize">
                            {channel.label}
                          </Label>
                          {errors[errorKey] && (
                            <span className="text-xs text-destructive">{errors[errorKey]}</span>
                          )}
                        </div>
                        <Switch
                          id={`${category.id}-${channel.id}`}
                          checked={isEnabled}
                          onChange={() => togglePreference(category.id, channel.id)}
                          aria-label={`${category.label} - ${channel.label}`}
                          className={cn(!isEnabled && 'bg-gray-300')}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
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
