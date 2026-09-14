"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter } from "@/components/ui/modal";
import { useBilanTemplates, type BilanTemplate } from "@/hooks/use-bilan-templates";
import { cn } from "@/lib/utils";

export default function BilanTemplatesPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const {
    templates,
    isLoading,
    error,
    fetchAll,
    remove,
    setDefault,
  } = useBilanTemplates();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<BilanTemplate | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  if (authLoading || !isAuthenticated) {
    return <div className="flex items-center justify-center h-64">Chargement...</div>;
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce modèle ?")) return;
    await remove(id);
  };

  const handleSetDefault = async (id: string) => {
    await setDefault(id);
  };

  const handleEdit = (template: BilanTemplate) => {
    setEditingTemplate(template);
    router.push(`/bilan/templates/create?id=${template.id}`);
  };

  const columns = [
    { key: "name", label: "Nom" },
    { key: "businessType", label: "Type d'activité" },
    { key: "categories", label: "Catégories" },
    { key: "isDefault", label: "Défaut" },
    { key: "actions", label: "Actions" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Modèles de bilan</h2>
            <p className="text-sm text-gray-500 mt-1">
              Gérez vos modèles de structure de bilan selon le Plan Comptable Général
            </p>
          </div>
          <Button onClick={() => router.push("/bilan/templates/create")}>
            Créer un modèle
          </Button>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4">
            <p className="text-red-800">Erreur: {error.message}</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={fetchAll}>
              Réessayer
            </Button>
          </div>
        )}

        <div className="rounded-lg border border-gray-200 bg-white">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              <span className="ml-2 text-gray-500">Chargement...</span>
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">Aucun modèle</h3>
              <p className="mt-1 text-sm text-gray-500">Commencez par créer votre premier modèle de bilan</p>
              <Button className="mt-4" onClick={() => router.push("/bilan/templates/create")}>
                Créer un modèle
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((col) => (
                    <TableHead key={col.key}>{col.label}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell className="font-medium">{template.name}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded-full">
                        {template.businessType || "Standard"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {template.sections?.map((section) => (
                          <span
                            key={section.code}
                            className={cn(
                              "px-2 py-0.5 text-xs rounded-full",
                              section.category === "actif" && "bg-blue-100 text-blue-800",
                              section.category === "passif" && "bg-red-100 text-red-800",
                              section.category === "capitaux_propres" && "bg-green-100 text-green-800"
                            )}
                          >
                            {section.label}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      {template.isDefault ? (
                        <span className="flex items-center gap-1 text-green-600">
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Oui
                        </span>
                      ) : (
                        <span className="text-gray-400">Non</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(template)}
                          icon={<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />}
                          aria-label="Modifier"
                        />
                        {!template.isDefault && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSetDefault(template.id)}
                            icon={<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />}
                            aria-label="Définir par défaut"
                          />
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(template.id)}
                          className="text-red-600 hover:bg-red-50"
                          icon={<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />}
                          aria-label="Supprimer"
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)} title="Créer un modèle">
          <ModalContent>
            <p className="text-gray-600">Redirection vers la page de création...</p>
          </ModalContent>
          <ModalFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Annuler
            </Button>
            <Button onClick={() => { setShowCreateModal(false); router.push("/bilan/templates/create"); }}>
              Continuer
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    </DashboardLayout>
  );
}