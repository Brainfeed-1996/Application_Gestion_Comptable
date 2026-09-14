"use client";

import { useState, useCallback } from "react";
import { useBalanceSheetTemplates, type BalanceSheetTemplate } from "@/hooks/use-balance-sheet";
import { useAuth } from "@/hooks/use-auth";

export interface TemplateSelectorProps {
  onSelect: (template: BalanceSheetTemplate) => void;
  selectedTemplateId?: string;
  className?: string;
}

export function BilanTemplateSelector({
  onSelect,
  selectedTemplateId,
  className = "",
}: TemplateSelectorProps) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { data: templates, isLoading, error } = useBalanceSheetTemplates();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleSelect = useCallback(
    (template: BalanceSheetTemplate) => {
      onSelect(template);
    },
    [onSelect]
  );

  const toggleExpand = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="rounded-lg bg-yellow-50 p-4 border border-yellow-200">
        <p className="text-yellow-800">Veuillez vous connecter pour sélectionner un modèle de bilan.</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900">Modèles de bilan disponibles</h3>
        <p className="mt-1 text-sm text-gray-500">
          Choisissez un modèle préconfiguré selon votre type d'activité
        </p>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          <span className="ml-2 text-gray-500">Chargement des modèles...</span>
        </div>
      )}

      {error && !isLoading && (
        <div className="rounded-md bg-red-50 p-4 border border-red-200">
          <p className="text-red-800">
            Erreur lors du chargement des modèles : {error.message}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-sm text-red-600 hover:underline"
          >
            Réessayer
          </button>
        </div>
      )}

      {!isLoading && !error && templates && templates.length === 0 && (
        <div className="rounded-lg bg-gray-50 p-6 text-center border border-gray-200">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">Aucun modèle disponible</h3>
          <p className="mt-1 text-sm text-gray-500">
            Aucun modèle de bilan n'a été configuré. Contactez l'administrateur.
          </p>
        </div>
      )}

      {!isLoading && !error && templates && templates.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              isSelected={selectedTemplateId === template.id}
              isExpanded={expandedId === template.id}
              onSelect={handleSelect}
              onToggleExpand={toggleExpand}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface TemplateCardProps {
  template: BalanceSheetTemplate;
  isSelected: boolean;
  isExpanded: boolean;
  onSelect: (template: BalanceSheetTemplate) => void;
  onToggleExpand: (id: string) => void;
}

function TemplateCard({
  template,
  isSelected,
  isExpanded,
  onSelect,
  onToggleExpand,
}: TemplateCardProps) {
  const sectionCount = template.sections?.length || 0;

  return (
    <div
      className={`relative rounded-lg border transition-all ${
        isSelected
          ? "border-blue-500 bg-blue-50 shadow-lg"
          : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
      }`}
    >
      {isSelected && (
        <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-blue-500">
          <svg
            className="h-4 w-4 text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h4 className="text-base font-semibold text-gray-900 truncate">
              {template.name}
            </h4>
            {template.description && (
              <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                {template.description}
              </p>
            )}
          </div>
        </div>

        <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            {sectionCount} section{sectionCount > 1 ? "s" : ""}
          </span>
          <span className="flex items-center gap-1">
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            {template.createdAt
              ? new Date(template.createdAt).toLocaleDateString("fr-FR")
              : "Date inconnue"}
          </span>
        </div>

        {isExpanded && template.sections && template.sections.length > 0 && (
          <div className="mt-4 rounded-md bg-gray-50 p-3 border border-gray-200">
            <h5 className="text-xs font-medium text-gray-700 uppercase tracking-wider">
              Sections incluses
            </h5>
            <ul className="mt-2 space-y-1">
              {template.sections.map((section, index) => (
                <li
                  key={section}
                  className="flex items-center gap-2 text-xs text-gray-600"
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded bg-blue-100 text-blue-700 font-medium">
                    {index + 1}
                  </span>
                  {section}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 border-t border-gray-100 px-4 py-3">
        <button
          onClick={() => onToggleExpand(template.id)}
          type="button"
          className="flex-1 text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          {isExpanded ? "Masquer les détails" : "Voir les détails"}
        </button>
        <button
          onClick={() => onSelect(template)}
          type="button"
          disabled={isSelected}
          className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            isSelected
              ? "bg-blue-500 text-white cursor-default"
              : "bg-white text-blue-600 border border-blue-600 hover:bg-blue-50"
          }`}
        >
          {isSelected ? "Sélectionné" : "Sélectionner"}
        </button>
      </div>
    </div>
  );
}

export default BilanTemplateSelector;