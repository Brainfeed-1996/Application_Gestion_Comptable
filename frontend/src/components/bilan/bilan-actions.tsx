"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { BilanExport } from "./bilan-export";
import { apiClient } from "@/lib/api";
import { handleApiError } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { BalanceSheetDraft } from "@/types/balance-sheet";

export interface BilanActionsProps {
  draft: BalanceSheetDraft;
  onFinalize?: (draftId: string) => void;
  onDuplicate?: (draftId: string) => void;
  onDelete?: (draftId: string) => void;
  exportData?: { label: string; value: string | number }[];
  exportFilename?: string;
  className?: string;
}

export function BilanActions({
  draft,
  onFinalize,
  onDuplicate,
  onDelete,
  exportData = [],
  exportFilename = "bilan",
  className = "",
}: BilanActionsProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleFinalize = useCallback(async () => {
    if (!onFinalize || isFinalizing) return;

    setIsFinalizing(true);
    try {
      await apiClient.put(`/balance-sheet/drafts/${draft.id}/finalize`);
      toast({ title: "Succès", message: "Bilan finalisé avec succès", type: "success" });
      onFinalize(draft.id);
    } catch (err: unknown) {
      const error = handleApiError(err);
      toast({ title: "Erreur", message: error.message, type: "error" });
    } finally {
      setIsFinalizing(false);
    }
  }, [draft.id, onFinalize, toast]);

  const handleDuplicate = useCallback(async () => {
    if (!onDuplicate || isDuplicating) return;

    setIsDuplicating(true);
    try {
      const response = await apiClient.post<BalanceSheetDraft>(`/balance-sheet/drafts/${draft.id}/duplicate`);
      toast({ title: "Succès", message: "Bilan dupliqué avec succès", type: "success" });
      onDuplicate(response.data.id);
    } catch (err: unknown) {
      const error = handleApiError(err);
      toast({ title: "Erreur", message: error.message, type: "error" });
    } finally {
      setIsDuplicating(false);
    }
  }, [draft.id, onDuplicate, toast]);

  const handleDelete = useCallback(async () => {
    if (!onDelete || isDeleting) return;

    setIsDeleting(true);
    try {
      await apiClient.delete(`/balance-sheet/drafts/${draft.id}`);
      toast({ title: "Succès", message: "Bilan supprimé", type: "success" });
      onDelete(draft.id);
      setShowDeleteConfirm(false);
    } catch (err: unknown) {
      const error = handleApiError(err);
      toast({ title: "Erreur", message: error.message, type: "error" });
    } finally {
      setIsDeleting(false);
    }
  }, [draft.id, onDelete, toast]);

  const handleConfirmDelete = () => {
    setShowDeleteConfirm(true);
  };

  const isFinalized = draft.status === "finalized";

  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      <BilanExport data={exportData} filename={exportFilename} />

      {!isFinalized && (
        <Button
          variant="primary"
          onClick={handleFinalize}
          isLoading={isFinalizing}
          className="gap-2"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Finaliser
        </Button>
      )}

      <Button
        variant="outline"
        onClick={handleDuplicate}
        isLoading={isDuplicating}
        className="gap-2"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
        Dupliquer
      </Button>

      <Button
        variant="outline"
        onClick={handleConfirmDelete}
        isLoading={isDeleting}
        className="gap-2 text-red-600 hover:bg-red-50 border-red-200"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
        Supprimer
      </Button>

      <Dialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Confirmer la suppression"
        className="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Êtes-vous sûr de vouloir supprimer le bilan <strong className="text-gray-900">{draft.name}</strong> ?
            Cette action est irréversible.
          </p>
          {draft.status === "finalized" && (
            <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md">
              ⚠ Attention : ce bilan est finalisé. Sa suppression supprimera également toutes ses données associées.
            </p>
          )}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isDeleting}
            >
              Annuler
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              isLoading={isDeleting}
            >
              Supprimer
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

export default BilanActions;