"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  useBalanceSheetCalculation,
  useUpdateDraft,
} from "@/hooks/use-balance-sheet";
import { BilanCalculatedView } from "@/components/bilan/bilan-calculated-view";
import { BilanForm } from "@/components/bilan/bilan-form";

export default function EditBilanPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const draftId = params.id as string;

  const {
    data: calculation,
    refetch: refetchCalculation,
    isLoading: isLoadingCalculation,
    isFetching: isFetchingCalculation,
  } = useBalanceSheetCalculation(draftId);

  const updateDraft = useUpdateDraft(draftId);
  const [showResults, setShowResults] = useState(false);
  const [calculatedTotals, setCalculatedTotals] = useState<Record<string, number>>({});

  const handleCalculate = async () => {
    const result = await refetchCalculation();
    if (result.data) {
      const totals: Record<string, number> = {
        actif: result.data.assets,
        passif: result.data.liabilities,
        capitaux_propres: result.data.equity,
      };
      if (result.data.rows) {
        result.data.rows.forEach((row) => {
          totals[row.label] = row.value;
        });
      }
      if (result.data.ratios) {
        Object.entries(result.data.ratios).forEach(([key, value]) => {
          totals[key] = value;
        });
      }
      setCalculatedTotals(totals);
      setShowResults(true);
      queryClient.invalidateQueries({ queryKey: ["balance-sheet-drafts"] });
    }
  };

  const handleSave = (data: Record<string, unknown>) => {
    updateDraft.mutate(data, {
      onSuccess: () => {
        router.push("/bilan");
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Modification du bilan
            </h1>
            <p className="text-sm text-gray-500 mt-1">ID: {draftId}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleCalculate}
              disabled={isFetchingCalculation}
              className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {isFetchingCalculation ? "Calcul en cours..." : "Calculer les totaux"}
            </button>
            <button
              onClick={() => setShowResults((prev) => !prev)}
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              {showResults ? "Masquer" : "Afficher"} les résultats
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="rounded-lg bg-white shadow border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Éléments du bilan
              </h2>
              <BilanForm
                draftId={draftId}
                onSave={handleSave}
                isSaving={updateDraft.isPending}
              />
            </div>
          </div>

          {showResults && calculation && (
            <div className="lg:col-span-1">
              <div className="rounded-lg bg-white shadow border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Résultats calculés
                </h2>
                {isLoadingCalculation ? (
                  <div className="text-sm text-gray-500">Chargement...</div>
                ) : (
                  <BilanCalculatedView
                    calculatedTotals={calculatedTotals}
                    currency="EUR"
                  />
                )}
              </div>
            </div>
          )}
        </div>

        {showResults && calculation && (
          <div className="rounded-lg bg-white shadow border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Vue d'ensemble du bilan
              </h2>
            </div>
            <BilanCalculatedView
              calculatedTotals={calculatedTotals}
              currency="EUR"
            />
          </div>
        )}

        {updateDraft.isError && (
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-600">
            Erreur lors de la sauvegarde du brouillon
          </div>
        )}
      </div>
    </div>
  );
}
