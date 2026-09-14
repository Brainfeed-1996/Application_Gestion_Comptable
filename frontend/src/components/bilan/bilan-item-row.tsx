"use client";

import { useState, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { type BilanItem, type BalanceSheetCategory } from "@/types/balance-sheet";
import { CATEGORY_LABELS } from "@/lib/constants/balance-sheet";

export interface BilanItemRowProps {
  item: BilanItem;
  onUpdate: (id: string, updates: Partial<BilanItem>) => void;
  onDelete?: (id: string) => void;
  isEditing?: boolean;
  categories?: BalanceSheetCategory[];
  className?: string;
}

const DEFAULT_CATEGORIES: BalanceSheetCategory[] = [
  "actif",
  "passif",
  "capitaux_propres",
];

export function BilanItemRow({
  item,
  onUpdate,
  onDelete,
  isEditing = false,
  categories = DEFAULT_CATEGORIES,
  className = "",
}: BilanItemRowProps) {
  const [localValues, setLocalValues] = useState({
    account_code: item.account_code,
    account_name: item.account_name,
    amount: item.amount,
    category: item.category,
  });

  const handleChange = useCallback(
    (field: keyof typeof localValues, value: string | number) => {
      setLocalValues((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleBlur = useCallback(() => {
    onUpdate(item.id, localValues);
  }, [item.id, localValues, onUpdate]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, field: keyof typeof localValues) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleBlur();
      }
    },
    [handleBlur]
  );

  const getCategoryBadgeVariant = (category: BalanceSheetCategory) => {
    switch (category) {
      case "actif":
        return "success" as const;
      case "passif":
        return "error" as const;
      case "capitaux_propres":
        return "info" as const;
      default:
        return "default" as const;
    }
  };

  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat("fr-FR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <tr className={`${className} border-b border-gray-100 hover:bg-gray-50`}>
      <td className="px-4 py-3">
        {isEditing ? (
          <Input
            type="text"
            value={localValues.account_code}
            onChange={(e) => handleChange("account_code", e.target.value)}
            onBlur={handleBlur}
            onKeyDown={(e) => handleKeyDown(e, "account_code")}
            placeholder="Code compte"
            className="w-full text-sm"
            maxLength={20}
          />
        ) : (
          <code className="text-sm font-mono text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
            {item.account_code}
          </code>
        )}
      </td>
      <td className="px-4 py-3">
        {isEditing ? (
          <Input
            type="text"
            value={localValues.account_name}
            onChange={(e) => handleChange("account_name", e.target.value)}
            onBlur={handleBlur}
            onKeyDown={(e) => handleKeyDown(e, "account_name")}
            placeholder="Nom du compte"
            className="w-full text-sm"
            maxLength={100}
          />
        ) : (
          <span className="text-sm text-gray-900">{item.account_name}</span>
        )}
      </td>
      <td className="px-4 py-3">
        {isEditing ? (
          <Input
            type="number"
            step="0.01"
            min="0"
            value={localValues.amount}
            onChange={(e) => handleChange("amount", parseFloat(e.target.value) || 0)}
            onBlur={handleBlur}
            onKeyDown={(e) => handleKeyDown(e, "amount")}
            placeholder="0.00"
            className="w-full text-sm text-right"
          />
        ) : (
          <span className="text-sm text-gray-900 font-medium tabular-nums">
            {formatAmount(item.amount)} €
          </span>
        )}
      </td>
      <td className="px-4 py-3">
        {isEditing ? (
          <select
            value={localValues.category}
            onChange={(e) => handleChange("category", e.target.value as BalanceSheetCategory)}
            onBlur={handleBlur}
            onKeyDown={(e) => handleKeyDown(e, "category")}
            className="w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-2 py-1"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {CATEGORY_LABELS[cat]}
              </option>
            ))}
          </select>
        ) : (
          <Badge variant={getCategoryBadgeVariant(item.category)}>
            {CATEGORY_LABELS[item.category as BalanceSheetCategory] || item.category}
          </Badge>
        )}
      </td>
      {item.is_calculated && (
        <td className="px-4 py-3">
          <Badge variant="secondary" className="text-xs">
            Calculé
          </Badge>
        </td>
      )}
      {onDelete && (
        <td className="px-4 py-3 text-right">
          <button
            onClick={() => onDelete(item.id)}
            type="button"
            className="text-gray-400 hover:text-red-600 transition-colors"
            aria-label="Supprimer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </td>
      )}
    </tr>
  );
}

export interface BilanItemRowTableProps {
  items: BilanItem[];
  onUpdate: (id: string, updates: Partial<BilanItem>) => void;
  onDelete?: (id: string) => void;
  isEditing?: boolean;
  categories?: BalanceSheetCategory[];
  className?: string;
}

export function BilanItemRowTable({
  items,
  onUpdate,
  onDelete,
  isEditing = false,
  categories = DEFAULT_CATEGORIES,
  className = "",
}: BilanItemRowTableProps) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Code compte
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nom du compte
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Montant (€)
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Catégorie
            </th>
            {items.some((i) => i.is_calculated) && (
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
            )}
            {onDelete && (
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {items.map((item) => (
            <BilanItemRow
              key={item.id}
              item={item}
              onUpdate={onUpdate}
              onDelete={onDelete}
              isEditing={isEditing}
              categories={categories}
            />
          ))}
          {items.length === 0 && (
            <tr>
              <td
                colSpan={onDelete ? 6 : items.some((i) => i.is_calculated) ? 5 : 4}
                className="px-4 py-8 text-center text-gray-500"
              >
                Aucun élément de bilan
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default BilanItemRow;