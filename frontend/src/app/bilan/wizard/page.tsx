"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useBalanceSheetTemplates, useCreateQuickBilan } from "@/hooks/use-balance-sheet";
import { TemplateStep } from "./steps/template-step";
import { DetailsStep } from "./steps/details-step";
import { ReviewStep } from "./steps/review-step";
import type { BalanceSheetTemplate } from "@/hooks/use-balance-sheet";

const STEPS = [
  { id: 1, label: "Modèle" },
  { id: 2, label: "Détails" },
  { id: 3, label: "Récapitulatif" },
];

interface WizardData {
  template: BalanceSheetTemplate | null;
  name: string;
  fiscalYear: string;
}

export default function BilanWizardPage() {
  const router = useRouter();
  const { data: templates, isLoading, error } = useBalanceSheetTemplates();
  const createQuickBilan = useCreateQuickBilan();

  const [currentStep, setCurrentStep] = useState(1);
  const [wizardData, setWizardData] = useState<WizardData>({
    template: null,
    name: "",
    fiscalYear: "",
  });

  const handleNext = () => {
    if (currentStep < 3) setCurrentStep((s) => s + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep((s) => s - 1);
  };

  const handleCancel = () => {
    router.push("/bilan");
  };

  const handleCreate = () => {
    const name = wizardData.name.trim() || wizardData.template?.name || "Nouveau bilan";
    createQuickBilan.mutate(
      { name, period: wizardData.fiscalYear },
      {
        onSuccess: (data) => {
          router.push(`/bilan/${data.id}`);
        },
      }
    );
  };

  const progress = (currentStep / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Créer un bilan</h1>
          <p className="text-gray-600 mt-1">
            Suivez les étapes pour créer votre bilan en quelques clics.
          </p>
        </div>

        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {STEPS.map((step) => (
              <div key={step.id} className="flex items-center">
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium ${
                    step.id < currentStep
                      ? "bg-blue-600 text-white"
                      : step.id === currentStep
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {step.id < currentStep ? "✓" : step.id}
                </span>
                <span
                  className={`ml-2 hidden sm:inline text-sm ${
                    step.id <= currentStep ? "text-gray-900" : "text-gray-400"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            ))}
          </div>
          <div className="h-2 w-full rounded-full bg-gray-200">
            <div
              className="h-2 rounded-full bg-blue-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4 text-sm text-red-600">
            Erreur lors du chargement des modèles : {error.message}
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
            <span className="ml-3 text-gray-600">Chargement des modèles...</span>
          </div>
        ) : (
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            {currentStep === 1 && (
              <TemplateStep
                templates={templates ?? []}
                selected={wizardData.template}
                onSelect={(t) => {
                  setWizardData((d) => ({ ...d, template: t }));
                  handleNext();
                }}
              />
            )}
            {currentStep === 2 && (
              <DetailsStep
                data={{ name: wizardData.name, fiscalYear: wizardData.fiscalYear }}
                onChange={(field, value) =>
                  setWizardData((d) => ({ ...d, [field]: value }))
                }
                onBack={handleBack}
                onNext={handleNext}
              />
            )}
            {currentStep === 3 && (
              <ReviewStep
                data={wizardData}
                onBack={handleBack}
                onConfirm={handleCreate}
                isCreating={createQuickBilan.isPending}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}