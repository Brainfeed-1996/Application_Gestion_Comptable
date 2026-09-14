"use client";

import { useState, useCallback, useMemo } from "react";
import { ChevronRight, ChevronDown, Folder, FolderOpen, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/formatters";
import type { BilanCategory, BilanCategoryAccount } from "@/hooks/use-bilan-categories";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CategoryTreeNode {
  id: string;
  label: string;
  amount: number;
  isLeaf: boolean;
  children?: CategoryTreeNode[];
  kind: "category" | "account";
  category?: BilanCategory;
}

export interface CategoryTreeProps {
  /** Grouped categories as returned by useBilanCategories. */
  groups: Array<{
    category: BilanCategory;
    label: string;
    accounts: BilanCategoryAccount[];
    total: number;
  }>;
  /** Optional currency for amounts. */
  currency?: string;
  /** Optional className. */
  className?: string;
  /** Callback fired when an account node is clicked. */
  onAccountClick?: (account: BilanCategoryAccount, category: BilanCategory) => void;
  /** Initial expanded node ids. */
  defaultExpanded?: string[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const CATEGORY_ICONS: Record<BilanCategory, string> = {
  actif: "A",
  passif: "P",
  capitaux_propres: "CP",
};

function buildTree(
  groups: CategoryTreeProps["groups"],
): CategoryTreeNode[] {
  return groups.map((group) => ({
    id: group.category,
    label: group.label,
    amount: group.total,
    isLeaf: false,
    kind: "category",
    category: group.category,
    children: group.accounts.map((acc) => ({
      id: `${group.category}:${acc.account_code}`,
      label: acc.account_name ? `${acc.account_code} — ${acc.account_name}` : acc.account_code,
      amount: Number(acc.amount) || 0,
      isLeaf: true,
      kind: "account",
      category: group.category,
    })),
  }));
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CategoryTree({
  groups,
  currency = "EUR",
  className = "",
  onAccountClick,
  defaultExpanded = [],
}: CategoryTreeProps) {
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(defaultExpanded));

  const tree = useMemo(() => buildTree(groups), [groups]);

  const formatAmount = (amount: number) =>
    `${formatNumber(amount)} ${currency}`;

  const toggleNode = useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleAccountClick = useCallback(
    (node: CategoryTreeNode) => {
      if (!onAccountClick || !node.category) return;
      const group = groups.find((g) => g.category === node.category);
      const account = group?.accounts.find(
        (a) => a.account_code === node.id.split(":")[1],
      );
      if (account) onAccountClick(account, node.category);
    },
    [groups, onAccountClick],
  );

  if (groups.length === 0) {
    return (
      <div className={cn("rounded-lg border border-gray-200 bg-white p-8 text-center", className)}>
        <FileText className="mx-auto h-10 w-10 text-gray-300" />
        <p className="mt-2 text-sm text-gray-500">Aucune catégorie à afficher</p>
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      <ul className="space-y-1">
        {tree.map((node) => (
          <TreeNode
            key={node.id}
            node={node}
            level={0}
            expanded={expanded}
            onToggle={toggleNode}
            onAccountClick={handleAccountClick}
            currency={currency}
          />
        ))}
      </ul>
    </div>
  );
}

// ---------------------------------------------------------------------------
// TreeNode
// ---------------------------------------------------------------------------

interface TreeNodeProps {
  node: CategoryTreeNode;
  level: number;
  expanded: Set<string>;
  onToggle: (id: string) => void;
  onAccountClick: (node: CategoryTreeNode) => void;
  currency: string;
}

function TreeNode({
  node,
  level,
  expanded,
  onToggle,
  onAccountClick,
  currency,
}: TreeNodeProps) {
  const isExpanded = expanded.has(node.id);
  const hasChildren = node.kind === "category" && (node.children?.length ?? 0) > 0;
  const indent = level * 24;

  const handleChevronClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasChildren) onToggle(node.id);
  };

  const handleClick = () => {
    if (node.kind === "account") {
      onAccountClick(node);
    } else if (hasChildren) {
      onToggle(node.id);
    }
  };

  return (
    <li>
      <div
        className={cn(
          "flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors",
          node.kind === "account"
            ? "cursor-pointer hover:bg-gray-100"
            : "cursor-pointer hover:bg-gray-50",
        )}
        style={{ marginLeft: `${indent}px` }}
        onClick={handleClick}
      >
        <span
          className={cn(
            "flex h-5 w-5 shrink-0 items-center justify-center",
            hasChildren ? "cursor-pointer" : "invisible",
          )}
          onClick={handleChevronClick}
          aria-hidden="true"
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-400" />
            )
          ) : null}
        </span>

        {node.kind === "category" ? (
          isExpanded ? (
            <FolderOpen className="h-4 w-4 shrink-0 text-blue-500" />
          ) : (
            <Folder className="h-4 w-4 shrink-0 text-blue-500" />
          )
        ) : (
          <FileText className="h-4 w-4 shrink-0 text-gray-400" />
        )}

        <span
          className={cn(
            "flex-1 truncate text-sm",
            node.kind === "category" ? "font-semibold text-gray-900" : "text-gray-700",
          )}
        >
          {node.label}
        </span>

        <span className="shrink-0 text-sm font-medium text-gray-900 tabular-nums">
          {formatAmount(node.amount)}
        </span>
      </div>

      {hasChildren && isExpanded && (
        <ul className="mt-0.5 space-y-1">
          {node.children!.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              expanded={expanded}
              onToggle={onToggle}
              onAccountClick={onAccountClick}
              currency={currency}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export default CategoryTree;