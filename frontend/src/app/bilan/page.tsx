"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import {
  useBalanceSheetTemplates,
  useBalanceSheetDrafts,
  useCreateQuickBilan,
  useBalanceSheetCalculation,
} from "@/hooks/use-balance-sheet";
import { BilanCalculatedView } from "@/components/bilan/bilan-calculated-view";

interface BilanCalculatedViewWrapperProps {
  draftId: string;
}

function BilanCalculatedViewWrapper({
  draftId,
}: BilanCalculatedViewWrapperProps) {
  const { data, isLoading, error } = useBalanceSheetCalculation(draftId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Calcul du bilan...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <p className="text-sm text-red-600">
          Erreur lors du calcul du bilan: {error?.message}
        </p>
      </div>
    );
  }

  const calculatedTotals: Record<string, number> = {
    actif: data.assets,
    passif: data.liabilities,
    capitaux_propres: data.equity,
    ...(data.rows || []).reduce(
      (acc: Record<string, number>, row: { label: string; value: number }) => {
        acc[row.label] = row.value;
        return acc;
      },
      {},
    ),
  };

  return <BilanCalculatedView calculatedTotals={calculatedTotals} />;
}

export default function BilanPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [selectedDraftId, setSelectedDraftId] = useState<string | undefined>(
    undefined,
  );

  const {
    data: templates,
    isLoading: templatesLoading,
    error: templatesError,
  } = useBalanceSheetTemplates();

  const {
    data: drafts,
    isLoading: draftsLoading,
    error: draftsError,
  } = useBalanceSheetDrafts();

  const createQuickBilan = useCreateQuickBilan();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handleBack = () => {
    router.push("/dashboard");
  };

  const handleCreateBilan = () => {
    createQuickBilan.mutate({ name: "Nouveau bilan" });
  };

  const handleSelectDraft = (draftId: string) => {
    setSelectedDraftId(draftId);
  };

  const isLoading = templatesLoading || draftsLoading;
  const error = templatesError || draftsError;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBack}
                className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Retour
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Bilan</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {user?.name || user?.email}
              </span>
              <button
                onClick={handleLogout}
                className="rounded-md px-3 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-600">
              Erreur: {error.message}
            </p>
          </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Chargement...</span>
          </div>
        )}

        {!isLoading && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Bilans
              </h2>
              <button
                onClick={handleCreateBilan}
                disabled={createQuickBilan.isPending}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {createQuickBilan.isPending ? "Création..." : "Créer un bilan"}
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div>
                <h3 className="mb-3 text-sm font-medium text-gray-700">
                  Modèles de bilan
                </h3>
                {templates && templates.length > 0 ? (
                  <ul className="divide-y divide-gray-200 rounded-md border border-gray-200 bg-white">
                    {templates.map((template) => (
                      <li
                        key={template.id}
                        className="px-4 py-3"
                      >
                        <p className="font-medium text-gray-900">
                          {template.name}
                        </p>
                        {template.description && (
                          <p className="mt-1 text-sm text-gray-500">
                            {template.description}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">
                    Aucun modèle disponible.
                  </p>
                )}
              </div>

              <div>
                <h3 className="mb-3 text-sm font-medium text-gray-700">
                  Brouillers
                </h3>
                {drafts && drafts.length > 0 ? (
                  <ul className="divide-y divide-gray-200 rounded-md border border-gray-200 bg-white">
                    {drafts.map((draft) => (
                      <li key={draft.id}>
                        <button
                          onClick={() => handleSelectDraft(draft.id)}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50"
                        >
                          <p className="font-medium text-gray-900">
                            {draft.name}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            Statut: {draft.status} &middot;{" "}
                            {new Date(draft.createdAt).toLocaleDateString(
                              "fr-FR",
                            )}
                          </p>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">
                    Aucun brouillard pour le moment.
                  </p>
                )}
              </div>
            </div>

            {selectedDraftId && (
              <BilanCalculatedViewWrapper draftId={selectedDraftId} />
            )}
          </div>
        )}
      </main>
    </div>
  );
}