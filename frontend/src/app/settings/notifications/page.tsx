'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

type NotificationCategory = 'invoices' | 'transactions' | 'reports' | 'security' | 'system' | 'billing';

interface ChannelSettings {
  email: boolean;
  push: boolean;
  inApp: boolean;
}

interface NotificationSetting {
  id: NotificationCategory;
  title: string;
  description: string;
  enabled: boolean;
  channels: ChannelSettings;
}

const INITIAL_SETTINGS: NotificationSetting[] = [
  {
    id: 'invoices',
    title: 'Factures',
    description: 'Factures créées, échéances et rappels de paiement',
    enabled: true,
    channels: { email: true, push: true, inApp: true },
  },
  {
    id: 'transactions',
    title: 'Transactions',
    description: 'Transactions enregistrées et validations',
    enabled: true,
    channels: { email: false, push: true, inApp: true },
  },
  {
    id: 'reports',
    title: 'Rapports',
    description: 'Rapports disponibles (Bilan, TVA, FEC)',
    enabled: true,
    channels: { email: true, push: false, inApp: true },
  },
  {
    id: 'security',
    title: 'Sécurité',
    description: 'Connexions suspects, changements de mot de passe',
    enabled: true,
    channels: { email: true, push: true, inApp: true },
  },
  {
    id: 'billing',
    title: 'Facturation',
    description: 'Échéances, paiements et renouvellements d\'abonnement',
    enabled: false,
    channels: { email: true, push: false, inApp: false },
  },
  {
    id: 'system',
    title: 'Système',
    description: 'Maintenances et mises à jour du service',
    enabled: false,
    channels: { email: false, push: false, inApp: true },
  },
];

const CHANNELS: { key: keyof ChannelSettings; label: string }[] = [
  { key: 'email', label: 'Email' },
  { key: 'push', label: 'Push' },
  { key: 'inApp', label: 'In-app' },
];

export default function NotificationsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [settings, setSettings] = useState<NotificationSetting[]>(INITIAL_SETTINGS);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) {
    return <div>Chargement...</div>;
  }

  const toggleCategory = (id: NotificationCategory) => {
    setSettings((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, enabled: !s.enabled } : s
      )
    );
  };

  const toggleChannel = (categoryId: NotificationCategory, channel: keyof ChannelSettings) => {
    setSettings((prev) =>
      prev.map((s) =>
        s.id === categoryId
          ? {
              ...s,
              channels: { ...s.channels, [channel]: !s.channels[channel] },
            }
          : s
      )
    );
  };

  const handleSaveAll = () => {
    setIsSubmitting(true);
    try {
      setSuccess('Préférences de notification enregistrées avec succès');
      setTimeout(() => setSuccess(null), 3000);
    } catch {
      setSuccess(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const enabledCount = settings.filter((s) => s.enabled).length;

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-sm text-muted-foreground">
            Configuez les canaux et types de notifications que vous recevez
          </p>
        </div>

        {success && (
          <div className="rounded-md bg-green-50 p-4 text-sm text-green-600">{success}</div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Canaux de notification</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {enabledCount === settings.length
                ? `Toutes les catégories activées (${enabledCount})`
                : `${enabledCount} catégorie(s) activée(s) sur ${settings.length}`}
            </p>
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-blue-600" />
                <span>Email</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-orange-500" />
                <span>Push</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-purple-600" />
                <span>In-app</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {settings.map((setting) => (
            <Card key={setting.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={setting.enabled}
                        aria-label={setting.title}
                        onClick={() => toggleCategory(setting.id)}
                      />
                      <Label className="font-medium">{setting.title}</Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {setting.description}
                    </p>
                  </div>
                </div>

                {setting.enabled && (
                  <div className="mt-4 flex items-center gap-6 pl-10">
                    {CHANNELS.map((channel) => (
                      <div key={channel.key} className="flex items-center gap-2">
                        <Switch
                          checked={setting.channels[channel.key]}
                          aria-label={`${setting.title} - ${channel.label}`}
                          onClick={() =>
                            toggleChannel(setting.id, channel.key)
                          }
                        />
                        <Label className="text-sm">{channel.label}</Label>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" type="button" onClick={() => router.push('/settings')}>
            Annuler
          </Button>
          <Button onClick={handleSaveAll} isLoading={isSubmitting}>
            Enregistrer
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
