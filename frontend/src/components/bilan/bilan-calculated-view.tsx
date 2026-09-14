'use client';

import { useMemo } from 'react';
import {
  CATEGORY_LABELS,
  type BalanceSheetCategory,
} from '@/lib/constants/balance-sheet';

interface BilanCalculatedViewProps {
  calculatedTotals: Record<string, number>;
  currency?: string;
  className?: string;
}

interface CategoryRowProps {
  label: string;
  amount: number;
  currency: string;
  highlight?: boolean;
  isTotal?: boolean;
  isPositive?: boolean;
  isNegative?: boolean;
}

function formatAmount(amount: number, currency: string): string {
  const formatted = Math.abs(amount).toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${formatted} ${currency}`;
}

function CategoryRow({
  label,
  amount,
  currency,
  highlight = false,
  isTotal = false,
  isPositive = false,
  isNegative = false,
}: CategoryRowProps) {
  const baseClasses = 'flex items-center justify-between py-2 px-3';
  const totalClasses = isTotal ? 'font-bold border-t border-gray-300 mt-1' : '';
  const highlightClasses = highlight ? 'bg-blue-50 font-semibold' : '';

  let amountColor = 'text-gray-900';
  if (isPositive) amountColor = 'text-green-600';
  if (isNegative) amountColor = 'text-red-600';

  return (
    <div className={`${baseClasses} ${totalClasses} ${highlightClasses}`}>
      <span className={isTotal ? 'font-bold' : ''}>{label}</span>
      <span className={`${amountColor} ${isTotal ? 'font-bold' : ''}`}>
        {formatAmount(amount, currency)}
      </span>
    </div>
  );
}

export function BilanCalculatedView({
  calculatedTotals,
  currency = 'EUR',
  className = '',
}: BilanCalculatedViewProps) {
  const assets = useMemo(
    () => (calculatedTotals['actif'] as number | undefined) ?? 0,
    [calculatedTotals],
  );
  const liabilities = useMemo(
    () => (calculatedTotals['passif'] as number | undefined) ?? 0,
    [calculatedTotals],
  );
  const equity = useMemo(
    () => (calculatedTotals['capitaux_propres'] as number | undefined) ?? 0,
    [calculatedTotals],
  );

  const netWorth = useMemo(() => assets - liabilities, [assets, liabilities]);
  const totalPassif = useMemo(() => liabilities + equity, [liabilities, equity]);
  const isBalanced = useMemo(
    () => Math.abs(assets - totalPassif) < 0.01,
    [assets, totalPassif],
  );

  const categories = useMemo(() => {
    return (Object.keys(calculatedTotals) as BalanceSheetCategory[]).filter(
      (key) =>
        key !== 'actif' &&
        key !== 'passif' &&
        key !== 'capitaux_propres',
    );
  }, [calculatedTotals]);

  return (
    <div className={`w-full ${className}`}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Actif column */}
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          <div className="bg-blue-600 text-white px-4 py-3">
            <h3 className="font-bold text-lg uppercase tracking-wide">
              Actif
            </h3>
          </div>
          <div className="divide-y divide-gray-100">
            <CategoryRow
              label={CATEGORY_LABELS.actif}
              amount={assets}
              currency={currency}
              highlight
              isTotal
              isPositive={assets >= 0}
            />
            {categories.map((cat) => {
              const value = calculatedTotals[cat] as number | undefined;
              if (value === undefined) return null;
              return (
                <CategoryRow
                  key={cat}
                  label={cat}
                  amount={value}
                  currency={currency}
                />
              );
            })}
          </div>
        </div>

        {/* Passif column */}
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          <div className="bg-purple-600 text-white px-4 py-3">
            <h3 className="font-bold text-lg uppercase tracking-wide">
              Passif
            </h3>
          </div>
          <div className="divide-y divide-gray-100">
            <CategoryRow
              label={CATEGORY_LABELS.passif}
              amount={liabilities}
              currency={currency}
              highlight
              isTotal
            />
            <CategoryRow
              label={CATEGORY_LABELS.capitaux_propres}
              amount={equity}
              currency={currency}
            />
            <CategoryRow
              label="Total passif"
              amount={totalPassif}
              currency={currency}
              isTotal
              isPositive={totalPassif >= 0}
            />
          </div>
        </div>

        {/* Net worth / balance column */}
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          <div
            className={`px-4 py-3 text-white ${
              isBalanced ? 'bg-green-600' : 'bg-red-600'
            }`}
          >
            <h3 className="font-bold text-lg uppercase tracking-wide">
              Bilan
            </h3>
          </div>
          <div className="divide-y divide-gray-100">
            <CategoryRow
              label="Actif total"
              amount={assets}
              currency={currency}
            />
            <CategoryRow
              label="Passif total"
              amount={totalPassif}
              currency={currency}
            />
            <CategoryRow
              label="Résultat net"
              amount={netWorth}
              currency={currency}
              isTotal
              isPositive={netWorth >= 0}
              isNegative={netWorth < 0}
            />
            <div
              className={`px-4 py-3 text-sm font-semibold ${
                isBalanced
                  ? 'bg-green-50 text-green-700'
                  : 'bg-red-50 text-red-700'
              }`}
            >
              {isBalanced ? '✓ Bilan équilibré' : '✗ Bilan déséquilibré'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BilanCalculatedView;