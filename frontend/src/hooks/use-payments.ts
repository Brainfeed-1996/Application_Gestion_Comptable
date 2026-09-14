"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  deletePayment,
} from "@/services/payments.service";
import type { Payment, PaymentCreate } from "@/types/payment";

export function usePayments(params?: {
  page?: number;
  limit?: number;
  status?: string;
  method?: string;
  dateFrom?: string;
  dateTo?: string;
}) {
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["payments", params],
    queryFn: () => getPayments(params),
  });

  const create = useMutation({
    mutationFn: createPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
  });

  const update = useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<PaymentCreate>) =>
      updatePayment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
  });

  const remove = useMutation({
    mutationFn: deletePayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
  });

  return {
    payments: (data?.items ?? []) as Payment[],
    total: data?.total ?? 0,
    page: data?.page ?? 1,
    limit: data?.limit ?? 20,
    totalPages: data?.totalPages ?? 1,
    isLoading,
    refetch,
    create,
    update,
    remove,
  };
}

export function usePayment(id: string | undefined) {
  return useQuery<Payment>({
    queryKey: ["payment", id],
    queryFn: () => getPaymentById(id!),
    enabled: !!id,
  });
}