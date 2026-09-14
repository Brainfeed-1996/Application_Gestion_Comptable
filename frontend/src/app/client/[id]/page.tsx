"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { apiClient } from "@/lib/api";
import type { Client } from "@/types/client";
import type { Invoice } from "@/types/invoice";

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;

  const [client, setClient] = useState<Client | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Client>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [clientRes, invoicesRes] = await Promise.all([
        apiClient.get<Client>(`/clients/${clientId}`),
        apiClient.get<Invoice[]>(`/invoices?clientId=${clientId}`),
      ]);
      setClient(clientRes.data);
      setEditData(clientRes.data);
      setInvoices(invoicesRes.data);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setIsLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleEdit = () => {
    setEditData({ ...client });
    setIsEditing(true);
    setFormError(null);
  };

  const handleCancelEdit = () => {
    setEditData({ ...client });
    setIsEditing(false);
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    try {
      const response = await apiClient.put<Client>(`/clients/${clientId}`, editData);
      setClient(response.data);
      setEditData(response.data);
      setIsEditing(false);
    } catch (err: any) {
      setFormError(
        err?.response?.data?.message || err?.response?.data?.detail || "Erreur lors de la mise à jour",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await apiClient.delete(`/clients/${clientId}`);
      router.push("/client");
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (error && !client) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-600">
            Erreur lors du chargement du client
          </div>
          <button
            onClick={() => router.push("/client")}
            className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            Retour à la liste
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditing ? "Modifier le client" : client?.name ?? "Client"}
            </h1>
            <p className="text-sm text-gray-500 mt-1">Détails du client</p>
          </div>
          <div className="flex items-center gap-3">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancelEdit}
                  className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  {isSubmitting ? "Enregistrement..." : "Enregistrer"}
                </button>
              </>
            ) : (
              <>
                <Link
                  href={`/client/${clientId}/edit`}
                  className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Modifier
                </Link>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="inline-flex items-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  Supprimer
                </button>
              </>
            )}
          </div>
        </div>

        {isEditing ? (
          <>
            {formError && (
              <div className="rounded-md bg-red-50 p-4 text-sm text-red-600">
                {formError}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="rounded-lg bg-white shadow border border-gray-200 p-6 space-y-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Informations du client
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Nom <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editData.name || ""}
                      onChange={(e) =>
                        setEditData((prev) => ({ ...prev, name: e.target.value }))
                      }
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={editData.email || ""}
                      onChange={(e) =>
                        setEditData((prev) => ({ ...prev, email: e.target.value }))
                      }
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Téléphone
                    </label>
                    <input
                      type="text"
                      value={editData.phone || ""}
                      onChange={(e) =>
                        setEditData((prev) => ({ ...prev, phone: e.target.value }))
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      SIREN
                    </label>
                    <input
                      type="text"
                      value={editData.siren || ""}
                      onChange={(e) =>
                        setEditData((prev) => ({ ...prev, siren: e.target.value }))
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm font-mono"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Adresse
                    </label>
                    <input
                      type="text"
                      value={editData.address || ""}
                      onChange={(e) =>
                        setEditData((prev) => ({ ...prev, address: e.target.value }))
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Ville
                    </label>
                    <input
                      type="text"
                      value={editData.city || ""}
                      onChange={(e) =>
                        setEditData((prev) => ({ ...prev, city: e.target.value }))
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Code postal
                    </label>
                    <input
                      type="text"
                      value={editData.postalCode || ""}
                      onChange={(e) =>
                        setEditData((prev) => ({
                          ...prev,
                          postalCode: e.target.value,
                        }))
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Pays
                    </label>
                    <input
                      type="text"
                      value={editData.country || ""}
                      onChange={(e) =>
                        setEditData((prev) => ({ ...prev, country: e.target.value }))
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Statut
                    </label>
                    <select
                      value={editData.isActive ? "active" : "inactive"}
                      onChange={(e) =>
                        setEditData((prev) => ({
                          ...prev,
                          isActive: e.target.value === "active",
                        }))
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                    >
                      <option value="active">Actif</option>
                      <option value="inactive">Inactif</option>
                    </select>
                  </div>
                </div>
              </div>
            </form>
          </>
        ) : (
          <div className="rounded-lg bg-white shadow border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Informations du client
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Nom</p>
                <p className="text-sm text-gray-900">{client?.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="text-sm text-gray-900">{client?.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Téléphone</p>
                <p className="text-sm text-gray-900">{client?.phone || "—"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">SIREN</p>
                <p className="text-sm text-gray-900 font-mono">{client?.siren || "—"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Adresse</p>
                <p className="text-sm text-gray-900">{client?.address || "—"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Ville</p>
                <p className="text-sm text-gray-900">{client?.city || "—"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Code postal</p>
                <p className="text-sm text-gray-900">{client?.postalCode || "—"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Pays</p>
                <p className="text-sm text-gray-900">{client?.country || "—"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Statut</p>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    client?.isActive
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {client?.isActive ? "Actif" : "Inactif"}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Créé le</p>
                <p className="text-sm text-gray-900">
                  {client?.createdAt ? formatDate(client.createdAt) : "—"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Mis à jour</p>
                <p className="text-sm text-gray-900">
                  {client?.updatedAt ? formatDate(client.updatedAt) : "—"}
                </p>
              </div>
            </div>
          </div>
        )}

        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Factures ({invoices.length})
          </h2>
          {invoices.length === 0 ? (
            <div className="rounded-lg bg-white border border-gray-200 p-6 text-sm text-gray-500">
              Aucune facture pour ce client
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      N° Facture
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Échéance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                        <Link href={`/invoices/${invoice.id}`}>
                          {invoice.number}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(invoice.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(invoice.dueDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                            invoice.status === "paid"
                              ? "bg-emerald-100 text-emerald-800"
                              : invoice.status === "draft"
                                ? "bg-gray-100 text-gray-800"
                                : invoice.status === "overdue"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                        {invoice.total.toFixed(2)} €
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {showDeleteConfirm && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-6">
            <h3 className="text-lg font-semibold text-red-800 mb-2">
              Confirmer la suppression
            </h3>
            <p className="text-sm text-red-700 mb-4">
              Êtes-vous sûr de vouloir supprimer le client{" "}
              <strong>{client?.name}</strong> ? Cette action est irréversible.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="inline-flex items-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? "Suppression..." : "Oui, supprimer"}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                Annuler
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
