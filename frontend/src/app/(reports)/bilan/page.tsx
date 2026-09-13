'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { BilanReport } from '@/components/reports/BilanReport';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';

const PERIODS = [
  { value: '2025', label: '2025' },
  { value: '2026', label: '2026' },
];

export default function BilanPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [year, setYear] = useState('2026');

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
          <h2 className="text-2xl font-bold">Bilan</h2>
          <div className="flex items-center gap-2">
            <Select value={year} onValueChange={setYear} aria-label="Année">
              {PERIODS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </Select>
            <Button variant="outline">📄 PDF</Button>
            <Button variant="outline">📊 Excel</Button>
          </div>
        </div>

        <BilanReport />
      </div>
    </DashboardLayout>
  );
}
