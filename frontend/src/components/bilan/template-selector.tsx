"use client";

import { useCallback } from "react";
import { useBalanceSheetTemplates, type BalanceSheetTemplate } from "@/hooks/use-balance-sheet";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BUSINESS_TYPE_CONFIGS, type BusinessTypeConfig } from "@/lib/constants/balance-sheet";

export interface TemplateSelectorProps {
  onSelect: (template: BalanceSheetTemplate) => void;
  selectedTemplateId?: string;
  className?: string;
  placeholder?: string;
  showBusinessType?: boolean;
  disabled?: boolean;
}

export function TemplateSelector({
  onSelect,
  selectedTemplateId,
  className = "",
  placeholder = "Sélectionner un modèle de bilan",
  showBusinessType = true,
  disabled = false,
}: TemplateSelectorProps) {
  const { data: templates, isLoading, error } = useBalanceSheetTemplates();

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const templateId = e.target.value;
      if (templateId && templates) {
        const template = templates.find((t) => t.id === templateId);
        if (template) {
          onSelect(template);
        }
      }
    },
    [onSelect, templates]
  );

  const getBusinessType = (template: BalanceSheetTemplate): BusinessTypeConfig | undefined => {
    return BUSINESS_TYPE_CONFIGS.find((config) => config.template.id === template.id);
  };

  if (isLoading) {
    return (
      <div className={className}>
        <Select
          disabled
          placeholder="Chargement des modèles..."
          className="w-full"
        >
          <option value="">Chargement...</option>
        </Select>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className} rounded-md bg-red-50 p-4 border border-red-200`}>
        <p className="text-red-800">Erreur : {error.message}</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="space-y-3">
        <Select
          value={selectedTemplateId || ""}
          onChange={handleChange}
          disabled={disabled || !templates || templates.length === 0}
          placeholder={placeholder}
          className="w-full"
        >
          <option value="">-- {placeholder} --</option>
          {templates?.map((template) => {
            const businessType = getBusinessType(template);
            return (
              <option key={template.id} value={template.id}>
                {template.name}
                {businessType && showBusinessType && ` (${businessType.label})`}
              </option>
            );
          })}
        </Select>

        {selectedTemplateId && templates && showBusinessType && (
          <>
            {(() => {
              const template = templates.find((t) => t.id === selectedTemplateId);
              if (!template) return null;
              const businessType = getBusinessType(template);
              if (!businessType) return null;
              return (
                <div className="flex items-center gap-2">
                  <Badge variant="info" className="text-xs">
                    Type d'activité : {businessType.label}
                  </Badge>
                  {template.description && (
                    <span className="text-xs text-gray-500">{template.description}</span>
                  )}
                </div>
              );
            })()}
          </>
        )}

        {!templates || templates.length === 0 ? (
          <p className="text-sm text-gray-500">Aucun modèle disponible</p>
        ) : null}
      </div>
    </div>
  );
}

export default TemplateSelector;