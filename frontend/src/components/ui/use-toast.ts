"use client";

import { useToastContext } from "./toast-provider";
import { ToastPosition, ToastType } from "./toast";

export interface UseToastReturn {
  success: (message: string, duration?: number) => string;
  error: (message: string, duration?: number) => string;
  warning: (message: string, duration?: number) => string;
  info: (message: string, duration?: number) => string;
  successWithTitle: (title: string, message: string, duration?: number, position?: ToastPosition) => string;
  errorWithTitle: (title: string, message: string, duration?: number, position?: ToastPosition) => string;
  warningWithTitle: (title: string, message: string, duration?: number, position?: ToastPosition) => string;
  infoWithTitle: (title: string, message: string, duration?: number, position?: ToastPosition) => string;
  dismiss: (id: string) => void;
}

const typeLabels: Record<ToastType, string> = {
  success: "Success",
  error: "Error",
  warning: "Warning",
  info: "Information",
};

export function useToast(): UseToastReturn {
  const { addToast, removeToast } = useToastContext();

  const success = (message: string, duration?: number): string => {
    return addToast("success", typeLabels.success, message, duration);
  };

  const error = (message: string, duration?: number): string => {
    return addToast("error", typeLabels.error, message, duration);
  };

  const warning = (message: string, duration?: number): string => {
    return addToast("warning", typeLabels.warning, message, duration);
  };

  const info = (message: string, duration?: number): string => {
    return addToast("info", typeLabels.info, message, duration);
  };

  const successWithTitle = (
    title: string,
    message: string,
    duration?: number,
    position?: ToastPosition,
  ): string => {
    return addToast("success", title, message, duration, position);
  };

  const errorWithTitle = (
    title: string,
    message: string,
    duration?: number,
    position?: ToastPosition,
  ): string => {
    return addToast("error", title, message, duration, position);
  };

  const warningWithTitle = (
    title: string,
    message: string,
    duration?: number,
    position?: ToastPosition,
  ): string => {
    return addToast("warning", title, message, duration, position);
  };

  const infoWithTitle = (
    title: string,
    message: string,
    duration?: number,
    position?: ToastPosition,
  ): string => {
    return addToast("info", title, message, duration, position);
  };

  return {
    success,
    error,
    warning,
    info,
    successWithTitle,
    errorWithTitle,
    warningWithTitle,
    infoWithTitle,
    dismiss: removeToast,
  };
}
