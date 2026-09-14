"use client";

import React, { createContext, useCallback, useContext, useRef, useState } from "react";
import { Toast, ToastData, ToastPosition, ToastType } from "./toast";

interface ToastContextValue {
  addToast: (
    type: ToastType,
    title: string,
    message: string,
    duration?: number,
    position?: ToastPosition,
  ) => string;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

interface ToastProviderProps {
  children: React.ReactNode;
  position?: ToastPosition;
  maxToasts?: number;
}

export function ToastProvider({
  children,
  position = "top-right",
  maxToasts = 5,
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const idCounter = useRef(0);

  const addToast = useCallback(
    (
      type: ToastType,
      title: string,
      message: string,
      duration?: number,
      toastPosition: ToastPosition = position,
    ): string => {
      const id = `toast-${++idCounter.current}-${Date.now()}`;
      const newToast: ToastData = {
        id,
        title,
        message,
        type,
        duration,
        position: toastPosition,
      };

      setToasts((prev) => {
        const updated = [...prev, newToast];
        if (updated.length > maxToasts) {
          return updated.slice(updated.length - maxToasts);
        }
        return updated;
      });

      return id;
    },
    [position, maxToasts],
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const positionClasses: Record<ToastPosition, string> = {
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4",
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
  };

  const grouped: Record<ToastPosition, ToastData[]> = {
    "top-right": [],
    "top-left": [],
    "bottom-right": [],
    "bottom-left": [],
  };

  toasts.forEach((toast) => {
    const pos = toast.position || position;
    if (!grouped[pos]) grouped[pos] = [];
    grouped[pos].push(toast);
  });

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {(Object.keys(positionClasses) as ToastPosition[]).map((pos) => (
        <div
          key={pos}
          className={`pointer-events-none fixed z-50 flex w-full max-w-sm flex-col gap-2 ${positionClasses[pos]}`}
        >
          {grouped[pos]?.map((toast) => (
            <div key={toast.id} className="pointer-events-auto">
              <Toast toast={toast} onDismiss={removeToast} />
            </div>
          ))}
        </div>
      ))}
    </ToastContext.Provider>
  );
}

export function useToastContext(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToastContext must be used within a ToastProvider");
  }
  return context;
}
