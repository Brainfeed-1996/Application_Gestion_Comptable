"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { TemplateEditor } from "@/components/bilan/template-editor";
import { useBilanTemplates, type CreateTemplateInput, type BilanTemplate } from "@/hooks/use-bilan-templates";
import { BUSINESS_TYPE_CONFIGS, DEFAULT_BILAN_TEMPLATE } from "@/lib/constants/balance-sheet";

export default function CreateBilanTemplatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const editId = searchParams.get("id");
  const isEditing = !!editId;

  const {
    fetchAll,
    getById,
    create,
    update,
    getBusinessTypes,
    getCategories,
    isLoading,
    error,
  } = useBilanTemplates();

  const [name, setName] = useState("");
  const [businessType, setBusinessType] = useState("service");
  const [description, setDescription] = useState("");
  const [sections, setSections] = useState<
    { code: string; label: string; category: string; accountCodes: string[] }[]
  >([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const businessTypes = getBusinessTypes();
  const categories = getCategories();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isEditing && editId) {
      loadTemplate(editId);
    } else {
      initializeFromBusinessType(businessType);
    }
  }, [editId, isEditing, businessType]);

  const loadTemplate = async (id: string) => {
    const template = await getById(id);
    if (template) {
      setName(template.name);
      setBusinessType(template.businessType || "service");
      setDescription(template.description || "");
      setSections(template.sections || []);
    }
  };

  const initializeFromBusinessType = (type: string) => {
    const config = BUSINESS_TYPE_CONFIGS.find((c) => c.id === type);
    if (config) {
      setSections(config.template.sections);
    } else {
      setSections(DEFAULT_BILAN_TEMPLATE.sections);
    }
  };

  const handleBusinessTypeChange = (value: string) => {
    setBusinessType(value);
    initializeFromBusinessType(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      const data: CreateTemplateInput = {
        name,
        businessType,
        description,
        sections: sections as any,
      };

      if (isEditing && editId) {
        await update({ id: editId, ...data });
      } else {
        await create(data);
      }
      router.push("/bilan/templates");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Erreur lors de la sauvegarde");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push("/bilan/templates");
  };

  if (authLoading || !isAuthenticated) {
    return <div className="flex items-center justify-center h-64">Chargement...</div>;
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{isEditing ? "Modifier le modèle" : "Créer un modèle de bilan"}</h2>
            <p className="text-sm text-gray-500 mt-1">
              Configurez la structure de votre bilan selon le Plan Comptable Général
            </p>
          </div>
          <Button variant="outline" onClick={handleCancel}>
            Annuler
          </Button>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4">
            <p className="text-red-800">Erreur: {error.message}</p>
          </div>
        )}

        {formError && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4">
            <p className="text-red-800">{formError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-lg border border-gray-200 bg-white p-6 space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Informations générales</h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nom du modèle *
                </label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Bilan prestations de services"
                  required
                  className="w-full"
                />
              </div>

              <div>
                <label htmlFor="businessType" className="block text-sm font-medium text-gray-700 mb-1">
                  Type d'activité *
                </label>
                <Select
                  id="businessType"
                  value={businessType}
                  onValueChange={handleBusinessTypeChange}
                  className="w-full"
                >
                  {businessTypes.map((bt) => (
                    <option key={bt.id} value={bt.id}>
                      {bt.label}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <Input
                  id="description"
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Description optionnelle du modèle"
                  className="w-full"
                />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <TemplateEditor
              sections={sections as any}
              onChange={setSections}
              businessType={businessType}
            />
          </div>

          <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? "Masquer" : "Aperçu"} JSON
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {isEditing ? "Enregistrer les modifications" : "Créer le modèle"}
            </Button>
          </div>
        </form>

        {showPreview && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Aperçu JSON</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowPreview(false)}>
                Fermer
              </Button>
            </div>
            <pre className="text-xs bg-gray-900 text-green-300 p-4 rounded overflow-auto max-h-96">
              {JSON.stringify(
                {
                  name,
                  businessType,
                  description,
                  sections,
                },
                null,
                2
              )}
            </pre>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}