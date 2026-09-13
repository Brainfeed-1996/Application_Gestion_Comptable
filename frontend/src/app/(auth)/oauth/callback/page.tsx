'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

export default function OAuthCallbackPage() {
  const router = useRouter();
  const { oauthCallback } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      const searchParams = new URLSearchParams(window.location.search);
      const token = searchParams.get('token') || searchParams.get('code');

      if (!token) {
        setError('Token OAuth non reçu');
        return;
      }

      try {
        await oauthCallback.mutateAsync(token, {
          onSuccess: () => {
            router.push('/dashboard');
            router.refresh();
          },
        });
      } catch {
        setError('Erreur lors de la connexion OAuth');
      }
    };

    handleCallback();
  }, [oauthCallback, router]);

  if (error) {
    return (
      <Card className="max-w-md mx-auto mt-20">
        <CardHeader><CardTitle>Erreur</CardTitle></CardHeader>
        <CardContent>
          <p className="text-destructive">{error}</p>
          <Button onClick={() => router.push('/login')} className="mt-4">Retour à la connexion</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Spinner aria-label="Connexion OAuth en cours" />
    </div>
  );
}
