"use client";

import { useState } from "react";
import { CheckCircle, XCircle, Copy, RotateCcw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { BilanStatusBadge, type BilanStatus } from "./bilan-status-badge";
import { useBalanceSheetDrafts, useUpdateDraft, useCreateQuickBilan } from "@/hooks/use-balance-sheet";
import { useToastContext } from "@/components/ui/toast-provider";
import { cn } from "@/lib/utils";

interface BilanStatusActionsProps {
  draftId: string;
  currentStatus: BilanStatus;
  draftName?: string;
  onStatusChange?: (newStatus: BilanStatus) => void;
  className?: string;
  disabled?: boolean;
}

const statusTransitions: Record<BilanStatus, BilanStatus[]> = {
  draft: ["calculated", "finalized", "cancelled"],
  calculated: ["finalized", "draft", "cancelled"],
  finalized: ["cancelled"],
  cancelled: ["draft"],
};

const actionLabels: Record<BilanStatus, string> = {
  draft: "Repasser en brouillon",
  calculated: "Calculer",
  finalized: "Finaliser",
  cancelled: "Annuler",
};

const actionIcons: Record<BilanStatus, React.ReactNode> = {
  draft: <RotateCcw className="h-4 w-4" />,
  calculated: <CheckCircle className="h-4 w-4" />,
  finalized: <CheckCircle className="h-4 w-4" />,
  cancelled: <XCircle className="h-4 w-4" />,
};

const actionVariants: Record<BilanStatus, "primary" | "secondary" | "outline" | "ghost" | "danger"> = {
  draft: "outline",
  calculated: "primary",
  finalized: "primary",
  cancelled: "danger",
};

export function BilanStatusActions({
  draftId,
  currentStatus,
  draftName,
  onStatusChange,
  className,
  disabled,
}: BilanStatusActionsProps) {
  const { addToast } = useToastContext();
  const queryClient = useBalanceSheetDrafts().queryClient;
  const updateDraft = useUpdateDraft(draftId);
  const createQuickBilan = useCreateQuickBilan();

  const [confirmAction, setConfirmAction] = useState<BilanStatus | null>(null);
  const [isDuplicating, setIsDuplicating] = useState(false);

  const availableActions = statusTransitions[currentStatus] || [];

  const handleConfirm = async (newStatus: BilanStatus) => {
    if (newStatus === "calculated") {
      try {
        const result = await createQuickBilan.mutateAsync({});
        addToast("success", "Bilan calculé", `Le bilan "${draftName || draftId}" a été calculé avec succès.`);
        onStatusChange?.("calculated");
      } catch (error) {
        addToast("error", "Erreur", "Impossible de calculer le bilan.");
      }
    } else if (newStatus === "finalized") {
      try {
        await updateDraft.mutateAsync({ status: "finalized" });
        addToast("success", "Bilan finalisé", `Le bilan "${draftName || draftId}" a été finalisé.`);
        onStatusChange?.("finalized");
      } catch (error) {
        addToast("error", "Erreur", "Impossible de finaliser le bilan.");
      }
    } else if (newStatus === "cancelled") {
      try {
        await updateDraft.mutateAsync({ status: "cancelled" });
        addToast("success", "Bilan annulé", `Le bilan "${draftName || draftId}" a été annulé.`);
        onStatusChange?.("cancelled");
      } catch (error) {
        addToast("error", "Erreur", "Impossible d'annuler le bilan.");
      }
    } else if (newStatus === "draft") {
      try {
        await updateDraft.mutateAsync({ status: "draft" });
        addToast("success", "Remis en brouillon", `Le bilan "${draftName || draftId}" est de nouveau un brouillon.`);
        onStatusChange?.("draft");
      } catch (error) {
        addToast("error", "Erreur", "Impossible de remettre en brouillon.");
      }
    }
    setConfirmAction(null);
  };

  const handleDuplicate = async () => {
    setIsDuplicating(true);
    try {
      await createQuickBilan.mutateAsync({
        name: `${draftName || "Bilan"} (copie)`,
      });
      addToast("success", "Bilan dupliqué", `Une copie du bilan "${draftName || draftId}" a été créée.`);
    } catch (error) {
      addToast("error", "Erreur", "Impossible de dupliquer le bilan.");
    } finally {
      setIsDuplicating(false);
    }
  };

  const isDestructiveAction = (status: BilanStatus) => status === "cancelled";

  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      <BilanStatusBadge status={currentStatus} showIcon />

      <div className="flex items-center gap-2">
        {availableActions.map((actionStatus) => (
          <Button
            key={actionStatus}
            variant={actionVariants[actionStatus]}
            size="sm"
            onClick={() => {
              if (isDestructiveAction(actionStatus) || actionStatus === "finalized") {
                setConfirmAction(actionStatus);
              } else {
                handleConfirm(actionStatus);
              }
            }}
            disabled={disabled || updateDraft.isPending || createQuickBilan.isPending}
            className="gap-1.5"
            aria-label={actionLabels[actionStatus]}
          >
            {actionIcons[actionStatus]}
            {actionLabels[actionStatus]}
          </Button>
        ))}

        <Button
          variant="ghost"
          size="sm"
          onClick={handleDuplicate}
          disabled={disabled || isDuplicating || createQuickBilan.isPending}
          className="gap-1.5"
          aria-label="Dupliquer le bilan"
        >
          <Copy className="h-4 w-4" />
          Dupliquer
        </Button>
      </div>

      {confirmAction && (
        <Dialog
          open={true}
          onClose={() => setConfirmAction(null)}
          title={isDestructiveAction(confirmAction) ? "Confirmer l'annulation" : "Confirmer l'action"}
          footer={
            <div className="flex gap-2 justify-end w-full">
              <Button variant="ghost" onClick={() => setConfirmAction(null)}>
                Annuler
              </Button>
              <Button
                variant={isDestructiveAction(confirmAction) ? "danger" : "primary"}
                onClick={() => handleConfirm(confirmAction)}
                disabled={updateDraft.isPending || createQuickBilan.isPending}
              >
                {isDestructiveAction(confirmAction) ? "Confirmer l'annulation" : "Confirmer"}
              </Button>
            </div>
          }
        >
          <div className="space-y-3">
            <AlertCircle className="mx-auto h-12 w-12 text-amber-500" aria-hidden="true" />
            <p className="text-center text-sm text-gray-600">
              {confirmAction === "cancelled"
                ? `Êtes-vous sûr de vouloir annuler le bilan "${draftName || draftId}" ? Cette action est irréversible.`
                : confirmAction === "finalized"
                ? `Êtes-vous sûr de vouloir finaliser le bilan "${draftName || draftId}" ? Une fois finalisé, il ne pourra plus être modifié.`
                : `Confirmez-vous cette action sur le bilan "${draftName || draftId}" ?`}
            </p>
          </div>
        </Dialog>
      )}
    </div>
  );
}

export default BilanStatusActions;