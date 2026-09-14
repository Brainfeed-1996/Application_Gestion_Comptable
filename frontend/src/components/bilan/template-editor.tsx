"use client";

import { useState, useCallback, useMemo } from "react";
import { BalanceSheetSection, BalanceSheetCategory, DEFAULT_ACCOUNT_CODES } from "@/lib/constants/balance-sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface TemplateEditorProps {
  sections: BalanceSheetSection[];
  onChange: (sections: BalanceSheetSection[]) => void;
  readOnly?: boolean;
  businessType?: string;
}

const CATEGORIES: { value: BalanceSheetCategory; label: string }[] = [
  { value: "actif", label: "Actif" },
  { value: "passif", label: "Passif" },
  { value: "capitaux_propres", label: "Capitaux propres" },
];

const CATEGORY_COLORS: Record<BalanceSheetCategory, string> = {
  actif: "bg-blue-100 text-blue-800 border-blue-200",
  passif: "bg-red-100 text-red-800 border-red-200",
  capitaux_propres: "bg-green-100 text-green-800 border-green-200",
};

function AccountRow({
  accountCode,
  index,
  sectionIndex,
  onCodeChange,
  onRemove,
  readOnly,
}: {
  accountCode: string;
  index: number;
  sectionIndex: number;
  onCodeChange: (sectionIndex: number, index: number, value: string) => void;
  onRemove: (sectionIndex: number, index: number) => void;
  readOnly?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-100">
      <span className="text-gray-400 cursor-move" title="Glisser pour réorganiser">⋮⋮</span>
      <Input
        type="text"
        value={accountCode}
        onChange={(e) => onCodeChange(sectionIndex, index, e.target.value)}
        placeholder="Code compte (ex: 101, 401, 512)"
        className="w-24"
        disabled={readOnly}
      />
      <Input
        type="text"
        placeholder="Libellé (optionnel)"
        className="flex-1"
        disabled={readOnly}
      />
      {!readOnly && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(sectionIndex, index)}
          className="text-red-600 hover:bg-red-50"
          aria-label="Supprimer ce compte"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </Button>
      )}
    </div>
  );
}

function SectionCard({
  section,
  sectionIndex,
  onSectionChange,
  onAddAccount,
  onRemoveSection,
  readOnly,
}: {
  section: BalanceSheetSection;
  sectionIndex: number;
  onSectionChange: (index: number, field: keyof BalanceSheetSection, value: string | string[]) => void;
  onAddAccount: (sectionIndex: number) => void;
  onRemoveSection: (index: number) => void;
  readOnly?: boolean;
}) {
  const categoryColor = CATEGORY_COLORS[section.category];

  return (
    <div
      className={cn(
        "relative border rounded-lg p-4 transition-all",
        "bg-white shadow-sm",
        readOnly ? "opacity-75" : ""
      )}
      style={{ borderColor: section.category === "actif" ? "#bfdbfe" : section.category === "passif" ? "#fecaca" : "#bbf7d0" }}
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "px-2 py-1 text-xs font-medium rounded-full border",
                categoryColor
              )}
            >
              {section.category.toUpperCase()}
            </span>
            <Input
              type="text"
              value={section.code}
              onChange={(e) => onSectionChange(sectionIndex, "code", e.target.value)}
              placeholder="Code section (ex: A, P, CP)"
              className="w-20"
              disabled={readOnly}
            />
            <Input
              type="text"
              value={section.label}
              onChange={(e) => onSectionChange(sectionIndex, "label", e.target.value)}
              placeholder="Libellé section"
              className="flex-1 max-w-md"
              disabled={readOnly}
            />
            <Select
              value={section.category}
              onValueChange={(value) => onSectionChange(sectionIndex, "category", value as BalanceSheetCategory)}
              disabled={readOnly}
              className="w-40"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </Select>
          </div>
        </div>
        {!readOnly && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemoveSection(sectionIndex)}
            className="text-red-600 hover:bg-red-50"
            aria-label="Supprimer cette section"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {section.accountCodes.map((accountCode, accountIndex) => (
          <AccountRow
            key={`${sectionIndex}-${accountIndex}`}
            accountCode={accountCode}
            index={accountIndex}
            sectionIndex={sectionIndex}
            onCodeChange={(si, ai, value) => {
              const newCodes = [...section.accountCodes];
              newCodes[ai] = value;
              onSectionChange(sectionIndex, "accountCodes", newCodes);
            }}
            onRemove={(si, ai) => {
              const newCodes = section.accountCodes.filter((_, i) => i !== ai);
              onSectionChange(sectionIndex, "accountCodes", newCodes);
            }}
            readOnly={readOnly}
          />
        ))}

        {!readOnly && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAddAccount(sectionIndex)}
            className="w-full justify-start gap-2"
            icon={<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>}
          >
            Ajouter un compte
          </Button>
        )}
      </div>

      {!readOnly && section.accountCodes.length === 0 && (
        <p className="text-center text-sm text-gray-400 py-4">
          Aucun compte défini. Cliquez sur "Ajouter un compte" pour commencer.
        </p>
      )}
    </div>
  );
}

export function TemplateEditor({
  sections,
  onChange,
  readOnly = false,
  businessType,
}: TemplateEditorProps) {
  const [localSections, setLocalSections] = useState<BalanceSheetSection[]>(sections);

  const handleSectionChange = useCallback(
    (index: number, field: keyof BalanceSheetSection, value: string | string[]) => {
      setLocalSections((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], [field]: value };
        return next;
      });
    },
    []
  );

  const handleAddAccount = useCallback((sectionIndex: number) => {
    setLocalSections((prev) => {
      const next = [...prev];
      const defaultCodes = DEFAULT_ACCOUNT_CODES[next[sectionIndex].category] || [];
      next[sectionIndex] = {
        ...next[sectionIndex],
        accountCodes: [...next[sectionIndex].accountCodes, defaultCodes[0] || ""],
      };
      return next;
    });
  }, []);

  const handleRemoveSection = useCallback((index: number) => {
    setLocalSections((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleAddSection = useCallback(() => {
    setLocalSections((prev) => [
      ...prev,
      {
        code: String.fromCharCode(65 + prev.length),
        label: `Nouvelle section ${prev.length + 1}`,
        category: "actif",
        accountCodes: [],
      },
    ]);
  }, []);

  const handleReorderSections = useCallback((fromIndex: number, toIndex: number) => {
    setLocalSections((prev) => {
      const next = [...prev];
      const [removed] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, removed);
      return next;
    });
  }, []);

  useMemo(() => {
    onChange(localSections);
  }, [localSections, onChange]);

  const sectionCount = localSections.length;
  const accountCount = localSections.reduce((sum, s) => sum + s.accountCodes.length, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Structure du modèle de bilan</h3>
          <p className="text-sm text-gray-500">
            Organisez vos sections et comptes selon le Plan Comptable Général
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded">
            {sectionCount} section{sectionCount > 1 ? "s" : ""}
          </span>
          <span className="px-2 py-1 bg-green-50 text-green-700 rounded">
            {accountCount} compte{accountCount > 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {readOnly && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
          <p className="text-sm text-amber-800">
            Mode lecture seule - Ce modèle ne peut pas être modifié
          </p>
        </div>
      )}

      <div className="space-y-4" role="list" aria-label="Sections du bilan">
        {localSections.map((section, index) => (
          <SectionCard
            key={section.code + index}
            section={section}
            sectionIndex={index}
            onSectionChange={handleSectionChange}
            onAddAccount={handleAddAccount}
            onRemoveSection={handleRemoveSection}
            readOnly={readOnly}
          />
        ))}

        {localSections.length === 0 && !readOnly && (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h4 className="mt-2 text-lg font-medium text-gray-900">Aucune section définie</h4>
            <p className="mt-1 text-sm text-gray-500">Commencez par ajouter une section pour structurer votre bilan</p>
            <Button onClick={handleAddSection} className="mt-4" icon={<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>}>
              Ajouter la première section
            </Button>
          </div>
        )}

        {!readOnly && (
          <Button
            variant="outline"
            onClick={handleAddSection}
            className="w-full justify-center gap-2"
            icon={<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>}
          >
            Ajouter une section
          </Button>
        )}
      </div>

      {!readOnly && (
        <div className="rounded-lg bg-gray-50 p-4 border border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Codes comptes suggérés par catégorie</h4>
          <div className="grid gap-4 sm:grid-cols-3">
            {CATEGORIES.map((cat) => (
              <div key={cat.value} className="rounded bg-white p-3 border">
                <p className={cn("text-xs font-medium mb-2", CATEGORY_COLORS[cat.value])}>
                  {cat.label}
                </p>
                <div className="flex flex-wrap gap-1">
                  {DEFAULT_ACCOUNT_CODES[cat.value].map((code) => (
                    <span
                      key={code}
                      className="px-2 py-1 text-xs bg-gray-100 rounded cursor-pointer hover:bg-gray-200 transition-colors"
                      title={`Cliquer pour copier: ${code}`}
                    >
                      {code}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-lg bg-gray-50 p-4 border border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Aperçu JSON</h4>
        <pre className="text-xs bg-gray-900 text-green-300 p-3 rounded overflow-auto max-h-48">
          {JSON.stringify(localSections, null, 2)}
        </pre>
      </div>
    </div>
  );
}

export default TemplateEditor;