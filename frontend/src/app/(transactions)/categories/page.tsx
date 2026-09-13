'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CategoryManager } from '@/components/transactions/CategoryManager';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function CategoriesPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [categories, setCategories] = useState<any[]>([]);

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
        <h2 className="text-2xl font-bold">Catégories</h2>
        <CategoryManager
          categories={categories}
          onCategoriesChange={setCategories}
        />
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-end">
              <Button onClick={() => router.push('/transactions')}>Retour aux transactions</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
