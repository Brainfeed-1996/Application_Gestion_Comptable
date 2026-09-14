"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useNotifications } from "@/hooks/use-notifications";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import NotificationList from "@/components/notifications/notification-list";
import type { Notification } from "@/types/notification";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type FilterType = "all" | "read" | "unread";

export default function NotificationsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { fetchAll, markAsRead, remove } = useNotifications();
  const [filter, setFilter] = useState<FilterType>("all");
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  const handleMarkAllAsRead = useCallback(async () => {
    setIsMarkingAll(true);
    try {
      const unread = await fetchAll({ is_read: false, limit: 100 });
      if (unread) {
        await Promise.all(unread.map((n) => markAsRead(n.id)));
      }
    } finally {
      setIsMarkingAll(false);
    }
  }, [fetchAll, markAsRead]);

  const handleNotificationClick = useCallback((notification: Notification) => {
    setSelectedNotification(notification);
  }, []);

  const handleCloseDetails = useCallback(() => {
    setSelectedNotification(null);
  }, []);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <p className="mt-1 text-sm text-gray-500">
              Consultez et gérez toutes vos notifications
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleMarkAllAsRead}
            disabled={isMarkingAll}
          >
            {isMarkingAll ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                En cours...
              </span>
            ) : (
              "Tout marquer comme lu"
            )}
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              filter === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Toutes
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              filter === "unread"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Non lues
          </button>
          <button
            onClick={() => setFilter("read")}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              filter === "read"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Lues
          </button>
        </div>

        <NotificationList
          filter={filter}
          onNotificationClick={handleNotificationClick}
        />

        {selectedNotification && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="relative w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
              <button
                onClick={handleCloseDetails}
                className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
                aria-label="Fermer"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="mb-4 flex items-start gap-3">
                <span className="shrink-0 text-2xl">
                  {selectedNotification.type === "info" && "ℹ️"}
                  {selectedNotification.type === "warning" && "⚠️"}
                  {selectedNotification.type === "error" && "❌"}
                  {selectedNotification.type === "success" && "✅"}
                </span>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedNotification.title}
                  </h3>
                  <Badge className="mt-1">
                    {selectedNotification.type === "info" && "Info"}
                    {selectedNotification.type === "warning" && "Attention"}
                    {selectedNotification.type === "error" && "Erreur"}
                    {selectedNotification.type === "success" && "Succès"}
                  </Badge>
                </div>
              </div>

              <div className="space-y-4">
                {selectedNotification.message && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Message</p>
                    <p className="mt-1 text-sm text-gray-700">
                      {selectedNotification.message}
                    </p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Date</p>
                    <p className="mt-1 text-gray-900">
                      {new Date(selectedNotification.created_at).toLocaleString("fr-FR")}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Statut</p>
                    <p className="mt-1">
                      {selectedNotification.is_read ? (
                        <span className="text-green-600">Lu</span>
                      ) : (
                        <span className="text-blue-600">Non lu</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={handleCloseDetails}
                >
                  Fermer
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    remove(selectedNotification.id);
                    handleCloseDetails();
                  }}
                >
                  Supprimer
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}