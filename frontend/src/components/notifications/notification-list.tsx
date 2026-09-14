"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useNotifications } from "@/hooks/use-notifications";
import type { Notification } from "@/types/notification";
import NotificationItem from "./notification-item";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

const PAGE_SIZE = 20;

interface NotificationListProps {
  filter?: "all" | "read" | "unread";
  onNotificationClick: (notification: Notification) => void;
}

export default function NotificationList({
  filter = "all",
  onNotificationClick,
}: NotificationListProps) {
  const { fetchAll, markAsRead, remove, isLoading, error } = useNotifications();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);

  const loadNotifications = useCallback(
    async (reset = false) => {
      const currentPage = reset ? 1 : page;
      if (reset) {
        setIsLoadingMore(true);
      } else {
        setIsLoadingMore(true);
      }

      const params: { is_read?: boolean; page: number; limit: number } = {
        page: currentPage,
        limit: PAGE_SIZE,
      };
      if (filter === "read") params.is_read = true;
      if (filter === "unread") params.is_read = false;

      const result = await fetchAll(params);
      if (result) {
        if (reset) {
          setNotifications(result);
        } else {
          setNotifications((prev) => {
            const existingIds = new Set(prev.map((n) => n.id));
            const newItems = result.filter((n) => !existingIds.has(n.id));
            return [...prev, ...newItems];
          });
        }
        setHasMore(result.length === PAGE_SIZE);
        if (reset) {
          setPage(1);
        } else {
          setPage((p) => p + 1);
        }
      }
      setIsLoadingMore(false);
    },
    [filter, fetchAll, page],
  );

  useEffect(() => {
    setNotifications([]);
    setHasMore(true);
    setPage(1);
    loadNotifications(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadNotifications(false);
        }
      },
      { threshold: 0.1 },
    );

    const target = observerTarget.current;
    if (target) {
      observer.observe(target);
    }

    return () => {
      if (target) {
        observer.unobserve(target);
      }
    };
  }, [hasMore, isLoadingMore, loadNotifications]);

  const handleMarkAsRead = useCallback(
    async (id: string) => {
      await markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
      );
    },
    [markAsRead],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      await remove(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    },
    [remove],
  );

  if (error && notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-red-600">Impossible de charger les notifications.</p>
        <button
          onClick={() => loadNotifications(true)}
          className="mt-2 text-sm text-blue-600 hover:text-blue-800"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (notifications.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
          <svg
            className="h-8 w-8 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900">
          {filter === "unread"
            ? "Aucune notification non lue"
            : filter === "read"
              ? "Aucune notification lue"
              : "Aucune notification"}
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          {filter === "unread"
            ? "Toutes vos notifications sont lues."
            : "Vous recevrez ici vos notifications importantes."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {isLoading && notifications.length === 0 ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkAsRead={handleMarkAsRead}
              onDelete={handleDelete}
              onClick={onNotificationClick}
            />
          ))}

          <div ref={observerTarget} className="flex justify-center py-4">
            {isLoadingMore && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <LoadingSpinner />
                Chargement de plus de notifications...
              </div>
            )}
            {!hasMore && notifications.length > 0 && (
              <p className="text-sm text-gray-400">
                {notifications.length} notification{notifications.length > 1 ? "s" : ""} au total
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}