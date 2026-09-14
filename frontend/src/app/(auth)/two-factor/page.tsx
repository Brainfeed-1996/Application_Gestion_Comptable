'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { twoFactorSchema } from '@/lib/validators';

export default function TwoFactorPage() {
  const router = useRouter();
  const { verifyTwoFactor, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated && !localStorage.getItem('access_token')) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const handleVerify = async (code: string) => {
    try {
      await verifyTwoFactor.mutateAsync(code, {
        onSuccess: () => {
          router.push('/dashboard');
          router.refresh();
        },
      });
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <Card className="max-w-md mx-auto mt-20">
      <CardHeader className="text-center">
        <CardTitle>Vérification en deux étapes</CardTitle>
        <p className="text-sm text-muted-foreground">Entrez le code reçu par SMS ou email</p>
      </CardHeader>
      <CardContent>
        <SixDigitInput onVerify={handleVerify} />
      </CardContent>
    </Card>
  );
}

function SixDigitInput({ onVerify }: { onVerify: (code: string) => void }) {
  const [digits, setDigits] = useState<string[]>(Array(6).fill(''));
  const [error, setError] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const validate = (code: string) => {
    const result = twoFactorSchema.safeParse({ code });
    return result.success;
  };

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      const chars = value.slice(0, 6).split('');
      const newDigits = [...digits];
      chars.forEach((char, i) => {
        const pos = index + i;
        if (pos < 6) newDigits[pos] = char;
      });
      setDigits(newDigits);
    } else if (/^\d$/.test(value)) {
      const newDigits = [...digits];
      newDigits[index] = value;
      setDigits(newDigits);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = digits.join('');
    if (!validate(code)) {
      setError('Code invalide');
      return;
    }
    setError('');
    onVerify(code);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="flex justify-center gap-2" role="group" aria-label="Code de vérification">
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => { inputRefs.current[index] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            className="h-14 w-12 text-center text-xl font-bold rounded-md border border-input focus:ring-2 focus:ring-ring"
            aria-label={`Chiffre ${index + 1} sur 6`}
          />
        ))}
      </div>
      {error && <p className="text-sm text-destructive text-center">{error}</p>}
      <Button type="submit" className="w-full" disabled={digits.join('').length !== 6}>
        Vérifier
      </Button>
    </form>
  );
}
