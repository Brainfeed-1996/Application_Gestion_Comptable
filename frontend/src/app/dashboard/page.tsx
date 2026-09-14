"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import {
  useBalanceSheetTemplates,
  useBalanceSheetDrafts,
  type BalanceSheetDraft,
} from "@/hooks/use-balance-sheet";

const STATUS_LABELS: Record<BalanceSheetDraft["status"], string> = {
  draft: "Brouillon",
  calculated: "Calculé",
  finalized: "Finalisé",
};

const STATUS_COLORS: Record<BalanceSheetDraft["status"], string> = {
  draft: "bg-gray-100 text-gray-800",
  calculated: "bg-blue-100 text-blue-800",
  finalized: "bg-emerald-100 text-emerald-800",
};

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function Avatar({ name, avatar }: { name: string; avatar?: string }) {
  if (avatar) {
    return (
      <img
        src={avatar}
        alt={name}
        className="h-12 w-12 rounded-full object-cover"
      />
    );
  }
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">
      {initials || "U"}
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const {
    user,
    isLoading: authLoading,
    isAuthenticated,
    logout,
  } = useAuth();

  const {
    data: templates,
    isLoading: templatesLoading,
    error: templatesError,
  } = useBalanceSheetTemplates();

  const { data: drafts, isLoading: draftsLoading, error: draftsError } =
    useBalanceSheetDrafts();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading || !isAuthenticated) {
    return <LoadingSpinner />;
  }

  const templateCount = templates?.length ?? 0;
  const draftCount = drafts?.length ?? 0;
  const recentDrafts = (drafts ?? []).slice().sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <nav className="flex items-center gap-4">
              <Link href="/dashboard" className="text-lg font-bold text-blue-700">
                Application Comptable
              </Link>
              <Link
                href="/bilan"
                className="text-sm font-medium text-gray-600 hover:text-blue-700"
              >
                Gestion des bilans
              </Link>
              <Link
                href="/login"
                className="text-sm font-medium text-gray-600 hover:text-blue-700"
              >
                Connexion
              </Link>
            </nav>
            <button
              onClick={() => logout()}
              className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="mb-8 flex items-center gap-6">
          <Avatar name={user?.name ?? "Utilisateur"} avatar={user?.avatar} />
          <div>
            <h1 className="text-2xl font-bold">{user?.name}</h1>
            <p className="text-gray-600">{user?.email}</p>
            <p className="text-sm text-gray-500">Rôle : {user?.role}</p>
          </div>
        </section>

        <section className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="rounded-lg bg-white p-6 shadow">
            <p className="text-sm font-medium text-gray-500">
              Modèles de bilan
            </p>
            <p className="text-3xl font-bold">{templateCount}</p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow">
            <p className="text-sm font-medium text-gray-500">
              Brouillons de bilan
            </p>
            <p className="text-3xl font-bold">{draftCount}</p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-xl font-semibold">Modèles de bilan</h2>
          {templatesLoading ? (
            <p className="text-sm text-gray-500">Chargement des modèles...</p>
          ) : templatesError ? (
            <p className="text-sm text-red-600">
              Impossible de charger les modèles.
            </p>
          ) : templateCount === 0 ? (
            <p className="text-sm text-gray-500">Aucun modèle disponible.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Nom
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Sections
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Créé le
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {(templates ?? []).map((template) => (
                    <tr key={template.id}>
                      <td className="px-4 py-2 text-sm">{template.name}</td>
                      <td className="px-4 py-2 text-sm">
                        {template.sections?.length ?? 0}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        {formatDate(template.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold">
            Brouillons de bilan récents
          </h2>
          {draftsLoading ? (
            <p className="text-sm text-gray-500">Chargement des brouillons...</p>
          ) : draftsError ? (
            <p className="text-sm text-red-600">
              Impossible de charger les brouillons.
            </p>
          ) : draftCount === 0 ? (
            <p className="text-sm text-gray-500">Aucun brouillon disponible.</p>
          ) : (
            <ul className="space-y-3">
              {recentDrafts.map((draft) => (
                <li
                  key={draft.id}
                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3"
                >
                  <div>
                    <p className="font-medium">{draft.name}</p>
                    <p className="text-sm text-gray-500">
                      Modifié le {formatDate(draft.updatedAt)}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[draft.status]}`}
                  >
                    {STATUS_LABELS[draft.status]}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
