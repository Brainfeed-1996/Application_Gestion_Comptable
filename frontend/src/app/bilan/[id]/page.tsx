"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  useBalanceSheetCalculation,
  useUpdateDraft,
  useBalanceSheetDrafts,
} from "@/hooks/use-balance-sheet";
import { useAuth } from "@/hooks/use-auth";
import { BilanCalculatedView } from "@/components/bilan/bilan-calculated-view";
import { BilanForm } from "@/components/bilan/bilan-form";
import { BilanExport } from "@/components/bilan/bilan-export";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  type BalanceSheetDraft,
  type BalanceSheetCalculation,
  type BalanceSheetDraftUpdate,
} from "@/hooks/use-balance-sheet";

const STATUS_LABELS: Record<string, string> = {
  draft: "Brouillon",
  calculated: "Calculé",
  finalized: "Finalisé",
  cancelled: "Annulé",
};

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-yellow-100 text-yellow-800",
  calculated: "bg-blue-100 text-blue-800",
  finalized: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function BilanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const draftId = params.id as string;

  const {
    data: drafts,
    isLoading: draftsLoading,
    refetch: refetchDrafts,
  } = useBalanceSheetDrafts();

  const {
    data: calculation,
    refetch: refetchCalculation,
    isLoading: isLoadingCalculation,
    isFetching: isFetchingCalculation,
  } = useBalanceSheetCalculation(draftId);

  const updateDraft = useUpdateDraft(draftId);
  const [showResults, setShowResults] = useState(false);
  const [calculatedTotals, setCalculatedTotals] = useState<Record<string, number>>({});
  const [activeTab, setActiveTab] = useState<"details" | "history" | "export">("details");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [currentDraft, setCurrentDraft] = useState<BalanceSheetDraft | null>(null);

  const draft = drafts?.find((d) => d.id === draftId);

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
    updateDraft.mutate(data as BalanceSheetDraftUpdate, {
      onSuccess: () => {
        refetchDrafts();
        setShowResults(false);
      },
    });
  };

  const handleDuplicate = async () => {
    if (!draft) return;
    try {
      await queryClient.mutationCache?.build(new import("@tanstack/react-query").MutationCache()).execute({
        mutationFn: () =>
          import("@/lib/api").then(({ apiClient }) =>
            apiClient.post("/balance-sheet/quick", { name: `${draft.name} (copie)` }).then((r) => r.data)
          ),
        onSuccess: () => {
          refetchDrafts();
          router.push("/bilan");
        },
      });
    } catch {
      alert("Erreur lors de la duplication");
    }
  };

  const handleDelete = async () => {
    if (!draftId) return;
    try {
      await import("@/lib/api").then(({ apiClient }) =>
        apiClient.delete(`/balance-sheet/drafts/${draftId}`)
      );
      router.push("/bilan");
    } catch {
      alert("Erreur lors de la suppression");
    }
  };

  const handleExport = async () => {
    if (!calculation) return;
    try {
      const response = await import("@/lib/api").then(({ apiClient }) =>
        apiClient.get(`/balance-sheet/drafts/${draftId}/export`, { responseType: "blob" })
      );
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${draft?.name || "bilan"}-${draftId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      alert("Erreur lors de l'export PDF");
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="rounded-lg bg-yellow-50 p-8 border border-yellow-200 text-center">
          <p className="text-yellow-800">Veuillez vous connecter pour accéder au détail du bilan.</p>
        </div>
      </div>
    );
  }

  if (draftsLoading && !draft) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          <span className="text-gray-600">Chargement du bilan...</span>
        </div>
      </div>
    );
  }

  if (!draft) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="rounded-lg bg-red-50 p-8 border border-red-200 text-center">
          <p className="text-red-800">Bilan non trouvé (ID: {draftId})</p>
          <Button variant="outline" className="mt-4" onClick={() => router.push("/bilan")}>
            Retour à la liste
          </Button>
        </div>
      </div>
    );
  }

  setCurrentDraft(draft);

  const fiscalYear = new Date(draft.createdAt).getFullYear();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/bilan")}
                className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                ← Retour
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{draft.name}</h1>
                <p className="text-sm text-gray-500">
                  ID: {draft.id} · Exercice {fiscalYear}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className={cn("text-sm", STATUS_COLORS[draft.status] ?? "bg-gray-100 text-gray-800")}>
                {STATUS_LABELS[draft.status] ?? draft.status}
              </Badge>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => setActiveTab("details")} disabled={activeTab === "details"}>
                  Modifier
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCalculate}
                  disabled={isFetchingCalculation}
                >
                  {isFetchingCalculation ? "Calcul..." : "Calculer"}
                </Button>
                <Button variant="outline" onClick={handleDuplicate}>
                  Dupliquer
                </Button>
                <BilanExport filename={`${draft.name}-${draftId}`} />
                <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)}>
                      Supprimer
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Supprimer ce bilan ?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Cette action est irréversible. Le bilan "{draft.name}" sera supprimé définitivement.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete}>Supprimer</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Détails</TabsTrigger>
            <TabsTrigger value="history">Historique</TabsTrigger>
            <TabsTrigger value="export">Export</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Éléments du bilan</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <BilanForm
                      draftId={draftId}
                      onSave={handleSave}
                    />
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Actions rapides</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      className="w-full justify-start"
                      onClick={handleCalculate}
                      disabled={isFetchingCalculation}
                    >
                      {isFetchingCalculation ? "Calcul en cours..." : "Calculer les totaux"}
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => setShowResults((prev) => !prev)}
                    >
                      {showResults ? "Masquer" : "Afficher"} les résultats
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={handleExport}
                    >
                      Exporter en PDF
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={handleDuplicate}
                    >
                      Dupliquer ce bilan
                    </Button>
                    <div className="pt-2 border-t border-gray-200">
                      <p className="text-xs text-gray-500">
                        Statut: <span className="font-medium">{STATUS_LABELS[draft.status] ?? draft.status}</span>
                      </p>
                      <p className="text-xs text-gray-500">
                        Créé le: <span className="font-medium">{new Date(draft.createdAt).toLocaleDateString("fr-FR")}</span>
                      </p>
                      <p className="text-xs text-gray-500">
                        Modifié le: <span className="font-medium">{new Date(draft.updatedAt).toLocaleDateString("fr-FR")}</span>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {showResults && calculation && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Résultats calculés</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingCalculation ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
                      <span className="ml-3 text-gray-600">Calcul du bilan...</span>
                    </div>
                  ) : (
                    <BilanCalculatedView
                      calculatedTotals={calculatedTotals}
                      currency="EUR"
                    />
                  )}
                </CardContent>
              </Card>
            )}

            {showResults && calculation && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Vue d'ensemble du bilan</CardTitle>
                </CardHeader>
                <CardContent>
                  <BilanCalculatedView
                    calculatedTotals={calculatedTotals}
                    currency="EUR"
                  />
                </CardContent>
              </Card>
            )}

            {updateDraft.isError && (
              <div className="mt-4 rounded-md bg-red-50 p-4 text-sm text-red-600">
                Erreur lors de la sauvegarde du brouillon
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Historique du bilan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-lg bg-gray-50 p-4 border border-gray-200">
                    <h4 className="font-medium text-gray-900">Création du bilan</h4>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(draft.createdAt).toLocaleString("fr-FR")}
                    </p>
                    <Badge className={cn("mt-2", STATUS_COLORS[draft.status] ?? "bg-gray-100 text-gray-800")}>
                      {STATUS_LABELS[draft.status] ?? draft.status}
                    </Badge>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-4 border border-gray-200">
                    <h4 className="font-medium text-gray-900">Dernière modification</h4>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(draft.updatedAt).toLocaleString("fr-FR")}
                    </p>
                  </div>
                  {calculation && (
                    <div className="rounded-lg bg-gray-50 p-4 border border-gray-200">
                      <h4 className="font-medium text-gray-900">Dernier calcul</h4>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(calculation.calculatedAt).toLocaleString("fr-FR")}
                      </p>
                      <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Total Actif</p>
                          <p className="font-semibold">{calculation.assets.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Total Passif</p>
                          <p className="font-semibold">{calculation.liabilities.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Capitaux propres</p>
                          <p className="font-semibold">{calculation.equity.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="export" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Export du bilan</CardTitle>
                <CardDescription>
                  Exportez le bilan au format PDF, CSV ou Excel
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center gap-3">
                  <Button onClick={handleExport}>
                    Exporter en PDF
                  </Button>
                  <BilanExport filename={`${draft.name}-${draftId}`} />
                </div>
                <div className="mt-6 rounded-lg bg-gray-50 p-4 border border-gray-200">
                  <p className="text-sm text-gray-600">
                    L'export PDF inclut la vue d'ensemble complète du bilan avec les totaux par catégorie,
                    le résultat net et l'indicateur d'équilibre.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}