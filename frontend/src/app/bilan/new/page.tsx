"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  useBalanceSheetTemplates,
  useCreateQuickBilan,
} from "@/hooks/use-balance-sheet";
import { BUSINESS_TYPE_CONFIGS } from "@/lib/constants/balance-sheet";
import type { BalanceSheetTemplate } from "@/hooks/use-balance-sheet";

export default function NewBilanPage() {
  const router = useRouter();
  const { data: templates, isLoading, error } = useBalanceSheetTemplates();
  const createQuickBilan = useCreateQuickBilan();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelect = (template: BalanceSheetTemplate) => {
    setSelectedId(template.id);
    createQuickBilan.mutate(
      { name: template.name },
      {
        onSuccess: (data) => {
          router.push(`/bilan/${data.id}`);
        },
      }
    );
  };

  const allTemplates = templates ?? [];

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Créer un bilan</h1>
        <p className="text-gray-600 mb-8">
          Sélectionnez un modèle de bilan pour démarrer
        </p>

        {isLoading && (
          <div className="text-center py-12 text-gray-500">Chargement des modèles...</div>
        )}
        {error && (
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-600">
            Erreur lors du chargement des modèles
          </div>
        )}

        {!isLoading && !error && (
          <>
            {allTemplates.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allTemplates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleSelect(template)}
                    disabled={createQuickBilan.isPending}
                    className={`text-left rounded-lg border bg-white p-6 shadow-sm transition-colors hover:border-blue-400 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 ${
                      selectedId === template.id
                        ? "border-blue-500 ring-2 ring-blue-500"
                        : "border-gray-200"
                    }`}
                  >
                    <h3 className="font-semibold text-lg text-gray-900 mb-1">
                      {template.name}
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      {template.description ?? "Aucune description"}
                    </p>
                    <div className="text-sm text-gray-400">
                      {template.sections.length} sections
                    </div>
                    {createQuickBilan.isPending && selectedId === template.id && (
                      <div className="mt-3 text-sm text-blue-600">
                        Création en cours...
                      </div>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Modèles disponibles
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {BUSINESS_TYPE_CONFIGS.map((config) => (
                    <button
                      key={config.id}
                      onClick={() =>
                        handleSelect({
                          id: config.template.id,
                          name: config.template.name,
                          description: `Modèle ${config.label}`,
                          sections: config.template.sections.map(
                            (s) => s.code + " - " + s.label
                          ),
                          createdAt: new Date().toISOString(),
                          updatedAt: new Date().toISOString(),
                        })
                      }
                      disabled={createQuickBilan.isPending}
                      className="text-left rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-colors hover:border-blue-400 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      <h3 className="font-semibold text-lg text-gray-900 mb-1">
                        {config.label}
                      </h3>
                      <p className="text-sm text-gray-500 mb-4">
                        {config.template.sections.length} sections
                      </p>
                      {createQuickBilan.isPending && (
                        <div className="mt-3 text-sm text-blue-600">
                          Création en cours...
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
