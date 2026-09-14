import type { BalanceSheetTemplate } from "@/hooks/use-balance-sheet";
import { BUSINESS_TYPE_CONFIGS } from "@/lib/constants/balance-sheet";

interface TemplateStepProps {
  templates: BalanceSheetTemplate[];
  selected: BalanceSheetTemplate | null;
  onSelect: (template: BalanceSheetTemplate) => void;
}

export function TemplateStep({ templates, selected, onSelect }: TemplateStepProps) {
  const hasTemplates = templates.length > 0;

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-1">
        Choisissez un modèle
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        Sélectionnez le modèle de bilan qui correspond à votre activité.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {hasTemplates ? (
          templates.map((template) => (
            <button
              key={template.id}
              onClick={() => onSelect(template)}
              className={`text-left rounded-lg border bg-white p-5 shadow-sm transition-colors hover:border-blue-400 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                selected?.id === template.id
                  ? "border-blue-500 ring-2 ring-blue-500"
                  : "border-gray-200"
              }`}
            >
              <h3 className="font-semibold text-gray-900">{template.name}</h3>
              {template.description && (
                <p className="mt-1 text-sm text-gray-500">
                  {template.description}
                </p>
              )}
              <p className="mt-3 text-xs text-gray-400">
                {template.sections.length} section(s)
              </p>
            </button>
          ))
        ) : (
          BUSINESS_TYPE_CONFIGS.map((config) => (
            <button
              key={config.id}
              onClick={() =>
                onSelect({
                  id: config.template.id,
                  name: config.template.name,
                  description: `Modèle ${config.label}`,
                  sections: config.template.sections.map(
                    (s) => `${s.code} - ${s.label}`,
                  ),
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                })
              }
              className="text-left rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition-colors hover:border-blue-400 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <h3 className="font-semibold text-gray-900">{config.label}</h3>
              <p className="mt-1 text-sm text-gray-500">
                {config.template.sections.length} sections
              </p>
            </button>
          ))
        )}
      </div>
    </div>
  );
}