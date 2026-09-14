"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type BilanStatus = "draft" | "calculated" | "finalized" | "cancelled";

const statusConfig: Record<BilanStatus, { label: string; variant: "default" | "success" | "warning" | "error" | "info" | "secondary" }> = {
  draft: { label: "Brouillon", variant: "secondary" },
  calculated: { label: "Calculé", variant: "info" },
  finalized: { label: "Finalisé", variant: "success" },
  cancelled: { label: "Annulé", variant: "error" },
};

interface BilanStatusBadgeProps {
  status: BilanStatus;
  className?: string;
  showIcon?: boolean;
}

export function BilanStatusBadge({ status, className, showIcon = false }: BilanStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.draft;

  return (
    <Badge variant={config.variant} className={cn("gap-1.5", className)}>
      {showIcon && (
        <span className="h-1.5 w-1.5 rounded-full" aria-hidden="true">
          {status === "draft" && <span className="inline-block h-full w-full rounded-full bg-gray-400" />}
          {status === "calculated" && <span className="inline-block h-full w-full rounded-full bg-blue-400" />}
          {status === "finalized" && <span className="inline-block h-full w-full rounded-full bg-green-400" />}
          {status === "cancelled" && <span className="inline-block h-full w-full rounded-full bg-red-400" />}
        </span>
      )}
      {config.label}
    </Badge>
  );
}

export default BilanStatusBadge;