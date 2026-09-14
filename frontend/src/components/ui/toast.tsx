"use client";

import { useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "warning" | "info";
export type ToastPosition =
  | "top-right"
  | "top-left"
  | "bottom-right"
  | "bottom-left";

export interface ToastData {
  id: string;
  title: string;
  message: string;
  type: ToastType;
  duration?: number;
  position?: ToastPosition;
}

interface ToastProps {
  toast: ToastData;
  onDismiss: (id: string) => void;
}

const typeStyles: Record<
  ToastType,
  { border: string; icon: string; iconBg: string }
> = {
  success: {
    border: "border-l-green-500",
    icon: "✓",
    iconBg: "bg-green-100 text-green-600",
  },
  error: {
    border: "border-l-red-500",
    icon: "✕",
    iconBg: "bg-red-100 text-red-600",
  },
  warning: {
    border: "border-l-amber-500",
    icon: "⚠",
    iconBg: "bg-amber-100 text-amber-600",
  },
  info: {
    border: "border-l-blue-500",
    icon: "ℹ",
    iconBg: "bg-blue-100 text-blue-600",
  },
};

export function Toast({ toast, onDismiss }: ToastProps) {
  const [isExiting, setIsExiting] = useState(false);
  const { title, message, type, duration = 5000 } = toast;
  const style = typeStyles[type];

  const handleDismiss = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => onDismiss(toast.id), 300);
  }, [onDismiss, toast.id]);

  useEffect(() => {
    if (duration <= 0) return;
    const timer = setTimeout(() => {
      handleDismiss();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, handleDismiss]);

  return (
    <div
      className={cn(
        "pointer-events-auto flex w-full items-start gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-lg transition-all duration-300",
        style.border,
        isExiting ? "translate-x-full opacity-0" : "translate-x-0 opacity-100",
      )}
      role="alert"
    >
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold",
          style.iconBg,
        )}
      >
        {style.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900">{title}</p>
        <p className="mt-0.5 text-sm text-gray-600 leading-relaxed">{message}</p>
      </div>
      <button
        onClick={handleDismiss}
        className="ml-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
        aria-label="Close notification"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  );
}
