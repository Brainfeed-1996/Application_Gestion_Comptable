'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { TVAReport } from '@/components/reports/TVAReport';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';

const PERIODS = [
  { value: 'q1', label: 'T1 2026' },
  { value: 'q2', label: 'T2 2026' },
  { value: 'q3', label: 'T3 2026' },
  { value: 'q4', label: 'T4 2026' },
];

export default function TVAPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [period, setPeriod] = useState('q3');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) {
    return <div>Chargement...</div>;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">TVA</h2>
          <div className="flex items-center gap-2">
            <Select value={period} onValueChange={setPeriod} aria-label="Période">
              {PERIODS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </Select>
            <Button variant="outline">📄 PDF</Button>
          </div>
        </div>
        <TVAReport />
      </div>
    </DashboardLayout>
  );
}
