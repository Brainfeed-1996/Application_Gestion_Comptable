"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useNotifications } from "@/hooks/use-notifications";
import type { Notification, NotificationType } from "@/types/notification";

const TYPE_COLORS: Record<NotificationType, string> = {
  info: "bg-blue-100 text-blue-800 border-blue-200",
  warning: "bg-yellow-100 text-yellow-800 border-yellow-200",
  error: "bg-red-100 text-red-800 border-red-200",
  success: "bg-emerald-100 text-emerald-800 border-emerald-200",
};

const TYPE_LABELS: Record<NotificationType, string> = {
  info: "Info",
  warning: "Attention",
  error: "Erreur",
  success: "Succès",
};

const TYPE_ICONS: Record<NotificationType, string> = {
  info: "ℹ️",
  warning: "⚠️",
  error: "❌",
  success: "✅",
};

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 60_000) return "À l'instant";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} min`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} h`;
  return d.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

interface NotificationCenterProps {
  maxItems?: number;
  onNotificationClick?: (notification: Notification) => void;
}

export default function NotificationCenter({
  maxItems = 10,
  onNotificationClick,
}: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { fetchAll, markAsRead, remove, isLoading, error } = useNotifications();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = useCallback(async () => {
    const result = await fetchAll({ limit: maxItems });
    if (result) {
      setNotifications(result);
      setUnreadCount(result.filter((n) => !n.is_read).length);
    }
  }, [fetchAll, maxItems]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkRead = useCallback(
    async (id: string) => {
      await markAsRead(id);
      await loadNotifications();
    },
    [markAsRead, loadNotifications],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      await remove(id);
      await loadNotifications();
    },
    [remove, loadNotifications],
  );

  const handleNotificationClick = useCallback(
    (notification: Notification) => {
      if (!notification.is_read) {
        handleMarkRead(notification.id);
      }
      onNotificationClick?.(notification);
      setIsOpen(false);
    },
    [handleMarkRead, onNotificationClick],
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-full p-2 text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-96 rounded-lg border border-gray-200 bg-white shadow-lg">
          <div className="flex items-center justify-between rounded-t-lg border-b border-gray-200 px-4 py-3">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            <button
              onClick={loadNotifications}
              className="text-sm text-blue-600 hover:text-blue-800"
              disabled={isLoading}
            >
              Actualiser
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {error && (
              <div className="px-4 py-3 text-sm text-red-600">
                Impossible de charger les notifications.
              </div>
            )}

            {notifications.length === 0 && !isLoading && (
              <div className="px-4 py-8 text-center text-sm text-gray-500">
                Aucune notification
              </div>
            )}

            {isLoading && notifications.length === 0 && (
              <div className="flex justify-center py-4">
                <div className="h-6 w-6 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
              </div>
            )}

            <ul className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <li
                  key={notification.id}
                  className={`flex gap-3 px-4 py-3 transition-colors hover:bg-gray-50 ${
                    !notification.is_read ? "bg-blue-50/50" : ""
                  }`}
                >
                  <button
                    onClick={() => handleNotificationClick(notification)}
                    className="flex flex-1 gap-3 text-left"
                  >
                    <span className="shrink-0 text-lg">
                      {TYPE_ICONS[notification.type]}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {notification.title}
                        </span>
                        <span className="shrink-0 text-xs text-gray-500">
                          {formatDateTime(notification.created_at)}
                        </span>
                      </div>
                      {notification.message && (
                        <p className="mt-0.5 text-xs text-gray-600 line-clamp-2">
                          {notification.message}
                        </p>
                      )}
                      <span
                        className={`mt-1 inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${TYPE_COLORS[notification.type]}`}
                      >
                        {TYPE_LABELS[notification.type]}
                      </span>
                    </div>
                  </button>

                  <div className="flex flex-col gap-1 shrink-0">
                    {!notification.is_read && (
                      <button
                        onClick={() => handleMarkRead(notification.id)}
                        className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                        title="Marquer comme lu"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notification.id)}
                      className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-red-600"
                      title="Supprimer"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
