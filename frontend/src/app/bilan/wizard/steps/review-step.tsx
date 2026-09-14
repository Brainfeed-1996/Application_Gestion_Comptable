import type { BalanceSheetTemplate } from "@/hooks/use-balance-sheet";

interface ReviewStepProps {
  data: {
    template: BalanceSheetTemplate | null;
    name: string;
    fiscalYear: string;
  };
  onBack: () => void;
  onConfirm: () => void;
  isCreating: boolean;
}

export function ReviewStep({ data, onBack, onConfirm, isCreating }: ReviewStepProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-1">
        Récapitulatif
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        Vérifiez les informations avant de créer le bilan.
      </p>

      <div className="rounded-md border border-gray-200 divide-y divide-gray-200">
        <div className="flex justify-between px-4 py-3">
          <span className="text-sm font-medium text-gray-500">Modèle</span>
          <span className="text-sm text-gray-900">
            {data.template?.name ?? "Aucun"}
          </span>
        </div>
        <div className="flex justify-between px-4 py-3">
          <span className="text-sm font-medium text-gray-500">Nom du bilan</span>
          <span className="text-sm text-gray-900">
            {data.name.trim() || data.template?.name || "—"}
          </span>
        </div>
        <div className="flex justify-between px-4 py-3">
          <span className="text-sm font-medium text-gray-500">Exercice fiscal</span>
          <span className="text-sm text-gray-900">
            {data.fiscalYear || "Non précisé"}
          </span>
        </div>
        <div className="flex justify-between px-4 py-3">
          <span className="text-sm font-medium text-gray-500">Sections</span>
          <span className="text-sm text-gray-900">
            {data.template?.sections.length ?? 0}
          </span>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={onBack}
          disabled={isCreating}
          className="rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50"
        >
          Retour
        </button>
        <button
          onClick={onConfirm}
          disabled={isCreating}
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isCreating ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
              Création...
            </>
          ) : (
            "Créer le bilan"
          )}
        </button>
      </div>
    </div>
  );
}