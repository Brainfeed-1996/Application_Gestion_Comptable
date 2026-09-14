import { useState } from "react";

interface DetailsStepProps {
  data: { name: string; fiscalYear: string };
  onChange: (field: "name" | "fiscalYear", value: string) => void;
  onBack: () => void;
  onNext: () => void;
}

const CURRENT_YEAR = new Date().getFullYear();

export function DetailsStep({ data, onChange, onBack, onNext }: DetailsStepProps) {
  const [nameError, setNameError] = useState<string | null>(null);

  const handleNext = () => {
    if (!data.name.trim()) {
      setNameError("Le nom est obligatoire");
      return;
    }
    setNameError(null);
    onNext();
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-1">
        Détails du bilan
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        Donnez un nom à votre bilan et précisez l'exercice concerné.
      </p>

      <div className="space-y-5">
        <div>
          <label
            htmlFor="bilan-name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Nom du bilan *
          </label>
          <input
            id="bilan-name"
            type="text"
            value={data.name}
            onChange={(e) => {
              onChange("name", e.target.value);
              if (nameError) setNameError(null);
            }}
            placeholder="Ex: Bilan 2025"
            className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              nameError ? "border-red-500" : "border-gray-300"
            }`}
          />
          {nameError && (
            <p className="mt-1 text-sm text-red-600">{nameError}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="bilan-fiscal-year"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Exercice fiscal
          </label>
          <select
            id="bilan-fiscal-year"
            value={data.fiscalYear}
            onChange={(e) => onChange("fiscalYear", e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Sélectionner un exercice</option>
            {Array.from({ length: 6 }, (_, i) => CURRENT_YEAR - i).map((year) => (
              <option key={year} value={String(year)}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={onBack}
          className="rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
        >
          Retour
        </button>
        <button
          onClick={handleNext}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Suivant
        </button>
      </div>
    </div>
  );
}