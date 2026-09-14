"use client";

import { useCallback } from "react";
import type { Notification, NotificationType } from "@/types/notification";

const TYPE_ICONS: Record<NotificationType, string> = {
  info: "ℹ️",
  warning: "⚠️",
  error: "❌",
  success: "✅",
};

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

function formatTimeAgo(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 60_000) return "À l'instant";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} min`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} h`;
  if (diff < 604_800_000)
    return `${Math.floor(diff / 86_400_000)} j`;
  return d.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onClick: (notification: Notification) => void;
}

export default function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
  onClick,
}: NotificationItemProps) {
  const handleClick = useCallback(() => {
    if (!notification.is_read) {
      onMarkAsRead(notification.id);
    }
    onClick(notification);
  }, [notification, onMarkAsRead, onClick]);

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onDelete(notification.id);
    },
    [onDelete, notification.id],
  );

  return (
    <div
      className={`group flex cursor-pointer gap-3 rounded-lg border p-4 transition-colors hover:bg-gray-50 ${
        !notification.is_read ? "border-l-4 border-l-blue-500 bg-blue-50/50" : "border-gray-200"
      }`}
      onClick={handleClick}
    >
      <span className="shrink-0 text-xl" role="img" aria-label={TYPE_LABELS[notification.type]}>
        {TYPE_ICONS[notification.type]}
      </span>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-gray-900">
              {notification.title}
            </h4>
            {!notification.is_read && (
              <span className="h-2 w-2 shrink-0 rounded-full bg-blue-500" title="Non lu" />
            )}
          </div>
          <span className="shrink-0 text-xs text-gray-500">
            {formatTimeAgo(notification.created_at)}
          </span>
        </div>

        {notification.message && (
          <p className="mt-0.5 text-sm text-gray-600 line-clamp-2">
            {notification.message}
          </p>
        )}

        <span
          className={`mt-2 inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${TYPE_COLORS[notification.type]}`}
        >
          {TYPE_LABELS[notification.type]}
        </span>
      </div>

      <div className="flex shrink-0 flex-col gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        {!notification.is_read && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMarkAsRead(notification.id);
            }}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            title="Marquer comme lu"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </button>
        )}
        <button
          onClick={handleDelete}
          className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
          title="Supprimer"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}